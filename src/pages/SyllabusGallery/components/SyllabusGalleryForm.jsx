import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Button, Form, Input, message, Modal } from 'antd'
import { PlusOutlined, EditOutlined } from '@ant-design/icons'
import syllabusGalleryService from '@services/SyllabusGalleryService'

function SyllabusGalleryForm({ isCreate = true, item = null, onSuccess }) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [form] = Form.useForm()

    const showModal = () => {
        if (item) {
            form.setFieldsValue({
                name: item.name,
                url: item.url,
            })
        }
        setIsModalOpen(true)
    }

    const handleCancel = () => {
        setIsModalOpen(false)
        form.resetFields()
    }

    const handleSubmit = async (values) => {
        setLoading(true)
        try {
            if (isCreate) {
                await syllabusGalleryService.createSyllabusGalleryImage(values)
                message.success('Gallery image added successfully')
            } else {
                await syllabusGalleryService.updateSyllabusGalleryImage(item._id, values)
                message.success('Gallery image updated successfully')
            }

            form.resetFields()
            setIsModalOpen(false)

            if (onSuccess) {
                onSuccess()
            }
        } catch (error) {
            message.error(error.message || 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            {isCreate ? (
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={showModal}
                    size="large"
                >
                    Add Gallery Image
                </Button>
            ) : (
                <Button
                    type="default"
                    icon={<EditOutlined />}
                    onClick={showModal}
                    size="small"
                >
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
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    className="mt-4"
                >
                    <Form.Item
                        label="Name"
                        name="name"
                        rules={[
                            { required: true, message: 'Please enter image name' },
                            { max: 100, message: 'Name must be less than 100 characters' },
                        ]}
                    >
                        <Input placeholder="Enter image name (e.g., JavaScript Basics)" />
                    </Form.Item>

                    <Form.Item
                        label="Image URL"
                        name="url"
                        rules={[
                            { required: true, message: 'Please enter image URL' },
                            { type: 'url', message: 'Please enter a valid URL' },
                        ]}
                    >
                        <Input placeholder="https://example.com/image.jpg" />
                    </Form.Item>

                    <Form.Item className="mb-0 flex justify-end gap-2">
                        <Button onClick={handleCancel}>Cancel</Button>
                        <Button type="primary" htmlType="submit" loading={loading}>
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
