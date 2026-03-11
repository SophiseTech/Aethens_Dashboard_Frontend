import { useEffect, useState, useRef } from 'react'
import { Modal, Form, Input, Select, Radio, Divider, Space, Spin } from 'antd'
import { UserOutlined, ShopOutlined } from '@ant-design/icons'
import centersService from '@services/Centers'
import userService from '@services/User'

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
    const onModel = Form.useWatch('on_model', form)

    const [centers, setCenters] = useState([])
    const [centersLoading, setCentersLoading] = useState(false)
    const [users, setUsers] = useState([])
    const [usersLoading, setUsersLoading] = useState(false)
    const searchTimeoutRef = useRef(null)

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
            setCenters([])
            setUsers([])
        }
    }, [open, ledger, form])

    useEffect(() => {
        if (ledgerType === 'internal' && onModel === 'Center' && open && centers.length === 0) {
            const fetchCenters = async () => {
                setCentersLoading(true)
                try {
                    const res = await centersService.getCenters({ status: 'active' }, 0, 1000)
                    const centersList = res?.centers || (Array.isArray(res) ? res : [])
                    setCenters(centersList)
                } catch (error) {
                    console.error(error)
                } finally {
                    setCentersLoading(false)
                }
            }
            fetchCenters()
        }
    }, [ledgerType, onModel, open, centers.length])

    const handleUserSearch = (search) => {
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
        if (!search) {
            setUsers([])
            return
        }
        searchTimeoutRef.current = setTimeout(async () => {
            setUsersLoading(true)
            try {
                const results = await userService.searchUsersV2(search)
                setUsers(Array.isArray(results) ? results : [])
            } catch (err) {
                console.error(err)
            } finally {
                setUsersLoading(false)
            }
        }, 400)
    }

    const handleOnModelChange = () => {
        form.setFieldsValue({ entity_id: undefined })
        setUsers([])
    }

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

                {/* Internal: entity selection */}
                {ledgerType === 'internal' && (
                    <>
                        <Form.Item
                            name="on_model"
                            label="Entity Type"
                            rules={[{ required: true, message: 'Please select entity type' }]}
                        >
                            <Select placeholder="Select entity type" onChange={handleOnModelChange}>
                                <Option value="User">User</Option>
                                <Option value="Center">Center</Option>
                            </Select>
                        </Form.Item>

                        {onModel === 'Center' && (
                            <Form.Item
                                name="entity_id"
                                label="Select Center"
                                rules={[{ required: true, message: 'Please select a center' }]}
                            >
                                <Select
                                    placeholder="Select Center"
                                    loading={centersLoading}
                                    optionLabelProp="label"
                                    options={centers.map(c => ({ label: c.center_name || c.name, value: String(c._id) }))}
                                    showSearch
                                    filterOption={(input, option) =>
                                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                    }
                                />
                            </Form.Item>
                        )}

                        {onModel === 'User' && (
                            <Form.Item
                                name="entity_id"
                                label="Select User"
                                rules={[{ required: true, message: 'Please select a user' }]}
                            >
                                <Select
                                    placeholder="Search User..."
                                    showSearch
                                    filterOption={false}
                                    loading={usersLoading}
                                    onSearch={handleUserSearch}
                                    optionLabelProp="label"
                                    options={users.map(u => ({
                                        label: `${u.username || u.name} ${u.role ? `(${u.role})` : ''}`,
                                        value: String(u._id)
                                    }))}
                                    notFoundContent={usersLoading ? <Spin size="small" /> : null}
                                />
                            </Form.Item>
                        )}
                    </>
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
