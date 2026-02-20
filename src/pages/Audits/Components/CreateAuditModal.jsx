import { Modal, Form, Select, DatePicker, Input, Switch, Row, Col, Button } from 'antd';
import { useState, useEffect } from 'react';
import inventoryAuditStore from '@stores/InventoryAuditStore';
import userStore from '@stores/UserStore';
import centersStore from '@stores/CentersStore';
import inventoryStore from '@stores/InventoryStore';
import { post } from '@utils/Requests';
import handleInternalError from '@utils/handleInternalError';

const { TextArea } = Input;

function CreateAuditModal({ open, onClose }) {
    const [form] = Form.useForm();
    const { createAudit, createLoading } = inventoryAuditStore();
    const { user } = userStore();
    const { selectedCenter } = centersStore();
    const { inventory, getCenterInventory } = inventoryStore();
    const [managers, setManagers] = useState([]);
    const [autoPopulate, setAutoPopulate] = useState(true);

    useEffect(() => {
        if (open) {
            fetchManagers();
            loadInventory();
        }
    }, [open]);

    const fetchManagers = async () => {
        try {
            const response = await post('/user/getManagers');
            if (response?.data) {
                setManagers(response.data);
            }
        } catch (error) {
            handleInternalError(error);
        }
    };

    const loadInventory = () => {
        const centerId = selectedCenter === 'all' ? null : selectedCenter || user.center_id;
        if (centerId) {
            getCenterInventory(centerId);
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const centerId = selectedCenter === 'all' ? values.center_id : selectedCenter || user.center_id;

            const payload = {
                center_id: centerId,
                auditor_id: values.auditor_id,
                audit_date: values.audit_date?.toISOString(),
                remarks: values.remarks || '',
            };

            // If not auto-populate, include selected items
            if (!autoPopulate && values.selected_items) {
                payload.items = values.selected_items.map(itemId => ({ item_id: itemId }));
            }

            await createAudit(payload);
            form.resetFields();
            setAutoPopulate(true);
            onClose();
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        setAutoPopulate(true);
        onClose();
    };

    return (
        <Modal
            title="Create New Audit"
            open={open}
            onCancel={handleCancel}
            footer={[
                <Button key="cancel" onClick={handleCancel}>
                    Cancel
                </Button>,
                <Button key="submit" type="primary" loading={createLoading} onClick={handleSubmit}>
                    Create Audit
                </Button>,
            ]}
            width={600}
        >
            <Form form={form} layout="vertical">
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="auditor_id"
                            label="Auditor (Manager)"
                            rules={[{ required: true, message: 'Please select an auditor' }]}
                        >
                            <Select placeholder="Select Manager" showSearch optionFilterProp="children">
                                {managers.map((manager) => (
                                    <Select.Option key={manager._id} value={manager._id}>
                                        {manager.username} - {manager.email}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="audit_date" label="Audit Date" rules={[{ required: true }]}>
                            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item label="Auto-populate Items">
                    <Switch checked={autoPopulate} onChange={setAutoPopulate} />
                    <span className="ml-2 text-gray-500">
                        {autoPopulate ? 'All center items will be included' : 'Select specific items'}
                    </span>
                </Form.Item>

                {!autoPopulate && (
                    <Form.Item
                        name="selected_items"
                        label="Select Items"
                        rules={[{ required: true, message: 'Please select at least one item' }]}
                    >
                        <Select
                            mode="multiple"
                            placeholder="Select items to audit"
                            showSearch
                            optionFilterProp="children"
                            maxTagCount="responsive"
                        >
                            {(Array.isArray(inventory) ? inventory : []).map((item) => (
                                <Select.Option key={item._id} value={item.item_id?._id || item._id}>
                                    {item.item_id?.name || item.name} - Qty: {item.quantity || 0}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                )}

                <Form.Item name="remarks" label="Remarks">
                    <TextArea rows={3} placeholder="Optional remarks" />
                </Form.Item>
            </Form>
        </Modal>
    );
}

export default CreateAuditModal;
