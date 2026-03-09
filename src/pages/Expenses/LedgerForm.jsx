import { useEffect } from 'react'
import { Modal, Form, Input, Select, Radio, Divider, Space } from 'antd'
import { UserOutlined, ShopOutlined } from '@ant-design/icons'

const { Option } = Select

/**
 * LedgerForm — Modal for creating or editing a Ledger account
 * Props:
 *   open    - boolean
 *   ledger  - existing ledger doc (Edit mode) | null (Create mode)
 *   onClose - fn
 *   onSave  - fn(formValues) => Promise<void>
 *   loading - boolean
 */
function LedgerForm({ open, ledger, onClose, onSave, loading }) {
    const [form] = Form.useForm()
    const ledgerType = Form.useWatch('type', form)

    useEffect(() => {
        if (open) {
            if (ledger) {
                form.setFieldsValue({
                    name: ledger.name,
                    type: ledger.type,
                    vendor_name: ledger.vendor_name,
                    status: ledger.status,
                })
            } else {
                form.resetFields()
                form.setFieldValue('type', 'external')
            }
        }
    }, [open, ledger, form])

    const handleOk = () => form.submit()

    const handleFinish = async (values) => {
        await onSave(values)
    }

    const isEdit = !!ledger

    return (
        <Modal
            title={isEdit ? 'Edit Ledger Account' : 'New Ledger Account'}
            open={open}
            onCancel={onClose}
            onOk={handleOk}
            okText={isEdit ? 'Save Changes' : 'Create Ledger'}
            confirmLoading={loading}
            destroyOnClose
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleFinish}
                className="mt-4"
            >
                {/* Name */}
                <Form.Item
                    name="name"
                    label="Ledger Name"
                    rules={[{ required: true, message: 'Please enter a name' }]}
                >
                    <Input placeholder="e.g. Office Supplies, Salary Account" />
                </Form.Item>

                {/* Type */}
                {!isEdit && (
                    <>
                        <Form.Item
                            name="type"
                            label="Account Type"
                            rules={[{ required: true }]}
                        >
                            <Radio.Group className="w-full">
                                <div className="grid grid-cols-2 gap-3">
                                    <Radio.Button
                                        value="external"
                                        className="h-auto !rounded-lg flex flex-col items-center justify-center py-3 text-center"
                                        style={{ whiteSpace: 'normal', lineHeight: 1.3 }}
                                    >
                                        <Space direction="vertical" size={2} className="items-center">
                                            <ShopOutlined className="text-lg" />
                                            <span className="font-medium">External</span>
                                            <span className="text-xs text-gray-400">Vendor / Supplier</span>
                                        </Space>
                                    </Radio.Button>
                                    <Radio.Button
                                        value="internal"
                                        className="h-auto !rounded-lg flex flex-col items-center justify-center py-3 text-center"
                                        style={{ whiteSpace: 'normal', lineHeight: 1.3 }}
                                    >
                                        <Space direction="vertical" size={2} className="items-center">
                                            <UserOutlined className="text-lg" />
                                            <span className="font-medium">Internal</span>
                                            <span className="text-xs text-gray-400">Center / Staff</span>
                                        </Space>
                                    </Radio.Button>
                                </div>
                            </Radio.Group>
                        </Form.Item>

                        <Divider className="my-3" />
                    </>
                )}

                {/* External: vendor name */}
                {ledgerType === 'external' && (
                    <Form.Item name="vendor_name" label="Vendor Name (optional)">
                        <Input placeholder="e.g. ACME Corp" />
                    </Form.Item>
                )}

                {/* Edit mode: status toggle */}
                {isEdit && (
                    <Form.Item name="status" label="Status">
                        <Select>
                            <Option value="active">Active</Option>
                            <Option value="inactive">Inactive</Option>
                        </Select>
                    </Form.Item>
                )}
            </Form>
        </Modal>
    )
}

export default LedgerForm
