import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Button, Form, Input, Select, message, Modal, Upload, Image } from 'antd'
import { PlusOutlined, EditOutlined, InboxOutlined, DeleteOutlined } from '@ant-design/icons'
import syllabusGalleryService from '@services/SyllabusGalleryService'
import courseService from '@services/Course'
import s3Service from '@services/S3Service'

const { Dragger } = Upload

// Read a File as a base64 data URI
function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(file)
    })
}

// Slugify filename (mirrors backend rename script)
function slugify(name) {
    return name
        .replace(/\((\d+)\)/g, '-$1')
        .replace(/[^a-zA-Z0-9]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .toLowerCase()
}

function SyllabusGalleryForm({ isCreate = true, item = null, onSuccess }) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [form] = Form.useForm()

    const [courses, setCourses] = useState([])

    // Batch upload state for new files (both Create & Edit mode)
    const [pendingFiles, setPendingFiles] = useState([]) // Array of { uid, file, dataUrl }

    // Existing images (for Edit mode)
    const [existingImages, setExistingImages] = useState([])

    useEffect(() => {
        if (isModalOpen) {
            fetchCourses()
        }
    }, [isModalOpen])

    const fetchCourses = async () => {
        try {
            const data = await courseService.getCourses({}, 0, 1000)
            if (data && data.courses) {
                setCourses(data.courses)
            } else if (Array.isArray(data)) {
                setCourses(data)
            }
        } catch (error) {
            console.error("Failed to fetch courses:", error)
        }
    }

    const showModal = () => {
        if (item) {
            form.setFieldsValue({
                name: item.name,
                url: item.url,
                course: typeof item.course === 'object' ? item.course?._id : item.course
            })
            // If item has images array, use that. Otherwise fallback to single url if present.
            if (item.images && item.images.length > 0) {
                setExistingImages([...item.images])
            } else if (item.url) {
                setExistingImages([item.url])
            } else {
                setExistingImages([])
            }
        }
        setIsModalOpen(true)
    }

    const handleCancel = () => {
        setIsModalOpen(false)
        form.resetFields()
        setPendingFiles([])
        setExistingImages([])
    }

    const handleRemovePendingFile = (uid) => {
        setPendingFiles(prev => prev.filter(f => f.uid !== uid))
    }

    const handleRemoveExistingImage = (urlToRemove) => {
        setExistingImages(prev => prev.filter(url => url !== urlToRemove))
    }

    // Intercept file selection — don't auto-upload, just preview
    const beforeUpload = async (file) => {
        const isImage = file.type.startsWith('image/')
        if (!isImage) {
            message.error('Only image files are allowed: ' + file.name)
            return Upload.LIST_IGNORE
        }

        const dataUrl = await readFileAsDataUrl(file)

        setPendingFiles(prev => [...prev, {
            uid: file.uid || Date.now() + Math.random().toString(),
            file,
            dataUrl
        }])

        // Auto-fill name from first filename if empty
        const currentName = form.getFieldValue('name')
        if (!currentName) {
            const ext = file.name.lastIndexOf('.')
            const baseName = ext !== -1 ? file.name.slice(0, ext) : file.name
            form.setFieldValue('name', slugify(baseName))
        }

        return false // prevent ant design auto-upload
    }

    const uploadFileToS3 = async (file, dataUrl) => {
        const ext = file.name.lastIndexOf('.')
        const baseName = ext !== -1 ? file.name.slice(0, ext) : file.name
        const slug = slugify(baseName)
        const ts = Date.now()
        const fileName = `${slug}_${ts}${ext !== -1 ? file.name.slice(ext) : ''}`

        const result = await s3Service.uploadFiles({
            files: [{
                fileName,
                fileType: file.type,
                data: dataUrl,
                path: 'uploads/syllabus-gallery',
            }]
        })

        if (!result?.[0]) throw new Error('Upload failed for ' + file.name)
        return result[0]
    }

    const handleSubmit = async (values) => {
        setLoading(true)
        try {
            // Upload all new pending files
            let uploadedUrls = []
            if (pendingFiles.length > 0) {
                const uploadPromises = pendingFiles.map(pf => uploadFileToS3(pf.file, pf.dataUrl))
                uploadedUrls = await Promise.all(uploadPromises)
            }

            // Combine existing images that weren't deleted + newly uploaded files
            const finalImages = [...existingImages, ...uploadedUrls]

            if (isCreate) {
                if (finalImages.length === 0 && !values.url) {
                    message.error('Please upload at least one image or provide a URL')
                    setLoading(false)
                    return
                }

                const payload = {
                    name: values.name,
                }

                if (finalImages.length > 0) {
                    payload.images = finalImages;
                } else if (values.url) {
                    payload.url = values.url;
                }

                if (values.course) {
                    payload.course = values.course;
                }

                await syllabusGalleryService.createSyllabusGalleryImage(payload)
                message.success(`Gallery content added successfully`)

            } else {
                // Edit Mode Submission
                const payload = {
                    name: values.name,
                    course: values.course || null,
                }

                // If the user deleted all images but provided a fallback url
                if (finalImages.length === 0) {
                    if (!values.url) {
                        message.error('Please provide at least one image or URL')
                        setLoading(false)
                        return
                    }
                    payload.url = values.url;
                    payload.images = []; // Explicitly clear images if they typed a URL
                } else {
                    payload.images = finalImages;
                    // Optional: could clear payload.url since it's now a set, but backend should handle
                }

                await syllabusGalleryService.updateSyllabusGalleryImage(item._id, payload)
                message.success('Gallery updated successfully')
            }

            form.resetFields()
            setPendingFiles([])
            setExistingImages([])
            setIsModalOpen(false)
            onSuccess?.()
        } catch (error) {
            message.error(error.message || 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            {isCreate ? (
                <Button type="primary" icon={<PlusOutlined />} onClick={showModal} size="large">
                    Add Gallery Set
                </Button>
            ) : (
                <Button type="default" icon={<EditOutlined />} onClick={showModal} size="small">
                    Edit
                </Button>
            )}

            <Modal
                title={isCreate ? 'Add Gallery Image Set' : 'Edit Gallery Item'}
                open={isModalOpen}
                onCancel={handleCancel}
                footer={null}
                destroyOnClose
                width={600}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit} className="mt-4">

                    <Form.Item
                        label="Name"
                        name="name"
                        rules={[
                            { required: true, message: 'Please enter a name for the item/set' },
                            { max: 100, message: 'Name must be less than 100 characters' },
                        ]}
                    >
                        <Input placeholder="e.g., Watercolors Masterclass" />
                    </Form.Item>

                    <Form.Item
                        label="Associated Course (Optional)"
                        name="course"
                    >
                        <Select
                            showSearch
                            placeholder="Select a course to link"
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                            allowClear
                        >
                            {courses.map(c => (
                                <Select.Option key={c._id} value={c._id}>
                                    {c.course_name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item label="Images (Multiple allowed)">
                        <Dragger
                            accept="image/*"
                            multiple={true}
                            showUploadList={false}
                            beforeUpload={beforeUpload}
                            style={{ padding: '8px 0', marginBottom: 16 }}
                        >
                            <p className="ant-upload-drag-icon">
                                <InboxOutlined />
                            </p>
                            <p className="ant-upload-text">Click or drag images to upload</p>
                            <p className="ant-upload-hint">Upload one or multiple images as a Set.</p>
                        </Dragger>

                        {/* Existing Images Preview (Edit mode) */}
                        {existingImages.length > 0 && (
                            <div className="mb-4">
                                <p className="text-sm text-gray-500 mb-2">Existing Images:</p>
                                <div className="flex flex-wrap gap-3 max-h-[200px] overflow-y-auto">
                                    {existingImages.map((url, idx) => (
                                        <div key={`existing-${idx}`} className="relative group rounded border border-gray-200 overflow-hidden" style={{ width: 100, height: 100 }}>
                                            <Image
                                                src={url}
                                                alt="existing"
                                                width={100}
                                                height={100}
                                                style={{ objectFit: 'cover' }}
                                                preview={false}
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Button
                                                    danger
                                                    type="primary"
                                                    shape="circle"
                                                    icon={<DeleteOutlined />}
                                                    onClick={() => handleRemoveExistingImage(url)}
                                                    size="small"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* New Uploads Preview */}
                        {pendingFiles.length > 0 && (
                            <div>
                                <p className="text-sm flex-none text-gray-500 mb-2">New Uploads:</p>
                                <div className="flex flex-wrap gap-3 max-h-[200px] overflow-y-auto">
                                    {pendingFiles.map((pf) => (
                                        <div key={pf.uid} className="relative group rounded border border-gray-200 overflow-hidden" style={{ width: 100, height: 100 }}>
                                            <Image
                                                src={pf.dataUrl}
                                                alt="preview"
                                                width={100}
                                                height={100}
                                                style={{ objectFit: 'cover' }}
                                                preview={false}
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Button
                                                    danger
                                                    type="primary"
                                                    shape="circle"
                                                    icon={<DeleteOutlined />}
                                                    onClick={() => handleRemovePendingFile(pf.uid)}
                                                    size="small"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </Form.Item>

                    {/* Hidden url field used for form submission if it's set programmatically. */}
                    <Form.Item name="url" hidden>
                        <Input />
                    </Form.Item>

                    {/* For single fallback item loading */}
                    {(existingImages.length === 0 && pendingFiles.length === 0) && (
                        <Form.Item
                            label="Or paste an image URL"
                            name="url"
                            rules={[
                                { required: existingImages.length === 0 && pendingFiles.length === 0, message: 'Upload an image or enter a URL' },
                                { type: 'url', message: 'Please enter a valid URL' },
                            ]}
                        >
                            <Input
                                placeholder="https://example.com/image.jpg"
                            />
                        </Form.Item>
                    )}

                    <Form.Item className="flex justify-end gap-2 mb-0 mt-4">
                        <Button onClick={handleCancel}>Cancel</Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                        >
                            {isCreate ? 'Add Set' : 'Update Section'}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    )
}

SyllabusGalleryForm.propTypes = {
    isCreate: PropTypes.bool,
    item: PropTypes.shape({
        _id: PropTypes.string,
        name: PropTypes.string,
        url: PropTypes.string,
        course: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
        images: PropTypes.arrayOf(PropTypes.string),
    }),
    onSuccess: PropTypes.func,
}

export default SyllabusGalleryForm
