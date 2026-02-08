import { Drawer, Form, InputNumber, Button, List, Input, Space, Tag, Divider } from 'antd';
import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import inventoryAuditStore from '@stores/InventoryAuditStore';

function ConductAudit({ open, audit, onClose }) {
    const [form] = Form.useForm();
    const { updateAudit, createLoading } = inventoryAuditStore();
    const [formValues, setFormValues] = useState({});

    useEffect(() => {
        if (audit && open) {
            // Initialize form with existing audited quantities
            const initialValues = {};
            audit.items?.forEach((item) => {
                if (item.audited_quantity !== null && item.audited_quantity !== undefined) {
                    initialValues[`item_${item.item_id._id}`] = item.audited_quantity;
                }
            });
            form.setFieldsValue(initialValues);
            setFormValues(initialValues);
        }
    }, [audit, open, form]);

    const handleSubmit = async () => {
        try {
            const values = form.getFieldsValue();

            // Map form values to items array
            const items = audit.items.map((item) => {
                const itemId = item.item_id._id;
                const fieldKey = `item_${itemId}`;
                const auditedQty = values[fieldKey];

                return {
                    item_id: itemId,
                    audited_quantity: auditedQty !== undefined && auditedQty !== null ? Number(auditedQty) : null,
                    notes: values[`notes_${itemId}`] || '',
                };
            });

            const payload = {
                items,
                status: 'in-progress', // Progress status
            };

            await updateAudit(audit._id, payload);
            onClose();
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    if (!audit) return null;

    return (
        <Drawer
            title="Conduct Audit"
            open={open}
            onClose={onClose}
            width={600}
            footer={
                <div className="flex justify-end gap-2">
                    <Button onClick={onClose}>Cancel</Button>
                    <Button type="primary" loading={createLoading} onClick={handleSubmit}>
                        Submit Audit
                    </Button>
                </div>
            }
        >
            <div className="mb-4">
                <p className="text-sm text-gray-500">
                    <strong>Audit Date:</strong> {dayjs(audit.audit_date).format('DD/MM/YYYY')}
                </p>
                <p className="text-sm text-gray-500">
                    <strong>Center:</strong> {audit.center_id?.name}
                </p>
                <Tag color={audit.status === 'pending' ? 'default' : 'processing'}>
                    {audit.status?.toUpperCase()}
                </Tag>
            </div>

            <Divider />

            <Form form={form} layout="vertical">
                <List
                    dataSource={audit.items}
                    renderItem={(item) => (
                        <List.Item key={item.item_id._id}>
                            <div className="w-full">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-medium">{item.item_id.name}</span>
                                </div>
                                <Space direction="vertical" className="w-full">
                                    <Form.Item
                                        name={`item_${item.item_id._id}`}
                                        label="Audited Quantity"
                                        className="mb-2"
                                        rules={[{ required: true, message: 'Please enter quantity' }]}
                                    >
                                        <InputNumber
                                            min={0}
                                            placeholder="Enter quantity"
                                            style={{ width: '100%' }}
                                        />
                                    </Form.Item>
                                    <Form.Item name={`notes_${item.item_id._id}`} label="Notes" className="mb-0">
                                        <Input.TextArea rows={2} placeholder="Optional notes" />
                                    </Form.Item>
                                </Space>
                            </div>
                        </List.Item>
                    )}
                    bordered
                    size="small"
                />
            </Form>
        </Drawer>
    );
}

export default ConductAudit;
