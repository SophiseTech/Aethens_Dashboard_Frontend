import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Button, Form, Input, message, Modal, Upload, Image } from 'antd'
import { PlusOutlined, EditOutlined, InboxOutlined, DeleteOutlined } from '@ant-design/icons'
import syllabusGalleryService from '@services/SyllabusGalleryService'
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

    // For the upload preview
    const [previewUrl, setPreviewUrl] = useState(null)
    const [pendingFile, setPendingFile] = useState(null) // { file, dataUrl }

    const showModal = () => {
        if (item) {
            form.setFieldsValue({ name: item.name, url: item.url })
            setPreviewUrl(item.url)
        }
        setIsModalOpen(true)
    }

    const handleCancel = () => {
        setIsModalOpen(false)
        form.resetFields()
        setPreviewUrl(null)
        setPendingFile(null)
    }

    // Intercept file selection — don't auto-upload, just preview
    const beforeUpload = async (file) => {
        const isImage = file.type.startsWith('image/')
        if (!isImage) {
            message.error('Only image files are allowed')
            return Upload.LIST_IGNORE
        }
        const dataUrl = await readFileAsDataUrl(file)
        setPreviewUrl(dataUrl)
        setPendingFile({ file, dataUrl })

        // Auto-fill name from filename if empty
        const currentName = form.getFieldValue('name')
        if (!currentName) {
            const ext = file.name.lastIndexOf('.')
            const baseName = ext !== -1 ? file.name.slice(0, ext) : file.name
            form.setFieldValue('name', slugify(baseName))
        }

        return false // prevent ant design auto-upload
    }

    const handleSubmit = async (values) => {
        setLoading(true)
        try {
            let url = values.url

            // If a new file was selected, upload it first
            if (pendingFile) {
                const { file, dataUrl } = pendingFile
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

                if (!result?.[0]) throw new Error('Upload failed')
                url = result[0]
            }

            const payload = { name: values.name, url }

            if (isCreate) {
                await syllabusGalleryService.createSyllabusGalleryImage(payload)
                message.success('Gallery image added successfully')
            } else {
                await syllabusGalleryService.updateSyllabusGalleryImage(item._id, payload)
                message.success('Gallery image updated successfully')
            }

            form.resetFields()
            setPreviewUrl(null)
            setPendingFile(null)
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
                    Add Gallery Image
                </Button>
            ) : (
                <Button type="default" icon={<EditOutlined />} onClick={showModal} size="small">
                    Edit
                </Button>
            )}

            <Modal
                title={isCreate ? 'Add Gallery Image' : 'Edit Gallery Image'}
                open={isModalOpen}
                onCancel={handleCancel}
                footer={null}
                destroyOnClose
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit} className="mt-4">
                    {/* Image upload / preview */}
                    <Form.Item label="Image">
                        {previewUrl ? (
                            <div className="relative inline-block">
                                <Image
                                    src={previewUrl}
                                    alt="preview"
                                    height={160}
                                    style={{ objectFit: 'cover', borderRadius: 8 }}
                                />
                                <Button
                                    size="small"
                                    danger
                                    icon={<DeleteOutlined />}
                                    style={{ position: 'absolute', top: 4, right: 4 }}
                                    onClick={() => {
                                        setPreviewUrl(null)
                                        setPendingFile(null)
                                        form.setFieldValue('url', '')
                                    }}
                                />
                            </div>
                        ) : (
                            <Dragger
                                accept="image/*"
                                showUploadList={false}
                                beforeUpload={beforeUpload}
                                style={{ padding: '8px 0' }}
                            >
                                <p className="ant-upload-drag-icon">
                                    <InboxOutlined />
                                </p>
                                <p className="ant-upload-text">Click or drag image to upload</p>
                                <p className="ant-upload-hint">PNG, JPG, WEBP supported</p>
                            </Dragger>
                        )}
                    </Form.Item>

                    <Form.Item
                        label="Name"
                        name="name"
                        rules={[
                            { required: true, message: 'Please enter image name' },
                            { max: 100, message: 'Name must be less than 100 characters' },
                        ]}
                    >
                        <Input placeholder="e.g., javascript-basics" />
                    </Form.Item>

                    {/* Hidden url field — populated by upload or kept from existing item */}
                    <Form.Item name="url" hidden>
                        <Input />
                    </Form.Item>

                    {/* Fallback: allow pasting a URL if no file picked */}
                    {!pendingFile && !previewUrl && (
                        <Form.Item
                            label="Or paste an image URL"
                            name="url"
                            rules={[
                                { required: true, message: 'Upload an image or enter a URL' },
                                { type: 'url', message: 'Please enter a valid URL' },
                            ]}
                        >
                            <Input placeholder="https://example.com/image.jpg" />
                        </Form.Item>
                    )}

                    <Form.Item className="mb-0 flex justify-end gap-2">
                        <Button onClick={handleCancel}>Cancel</Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            disabled={!pendingFile && !previewUrl && !form.getFieldValue('url')}
                        >
                            {isCreate ? 'Add' : 'Update'}
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
    }),
    onSuccess: PropTypes.func,
}

export default SyllabusGalleryForm
