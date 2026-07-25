import { useState } from 'react';
import { Modal, Form, Input, InputNumber, Select, Button, TimePicker, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import diplomaBatchStore from '@stores/DiplomaBatchStore';

const { Option } = Select;

const WEEK_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function AddBatchModal() {
    const [visible, setVisible] = useState(false);
    const [form] = Form.useForm();
    const { createBatch, createLoading } = diplomaBatchStore();

    const showModal = () => setVisible(true);
    const handleCancel = () => {
        setVisible(false);
        form.resetFields();
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            const batchData = {
                name: values.name,
                capacity: values.capacity,
                status: values.status,
                start_time: values.time_range?.[0]?.toDate(),
                end_time: values.time_range?.[1]?.toDate(),
                weekDays: values.weekDays || [],
            };

            await createBatch(batchData);
            message.success('Diploma batch created successfully');
            handleCancel();
        } catch (error) {
            if (error.errorFields) {
                message.error('Please fill in all required fields');
            }
        }
    };

    return (
        <>
            <Button type="primary" icon={<PlusOutlined />} onClick={showModal}>
                Add Diploma Batch
            </Button>

            <Modal
                title="Add New Diploma Batch"
                open={visible}
                onCancel={handleCancel}
                onOk={handleSubmit}
                confirmLoading={createLoading}
                okText="Create Batch"
                width={600}
            >
                <Form form={form} layout="vertical" initialValues={{ status: 'upcoming' }}>
                    <Form.Item
                        name="name"
                        label="Batch Name"
                        rules={[{ required: true, message: 'Please enter the batch name' }]}
                    >
                        <Input placeholder="Enter batch name" />
                    </Form.Item>

                    <Form.Item
                        name="capacity"
                        label="Capacity"
                        rules={[{ required: true, message: 'Please enter the batch capacity' }]}
                    >
                        <InputNumber min={1} placeholder="Enter capacity" style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        name="status"
                        label="Status"
                        rules={[{ required: true, message: 'Please select a status' }]}
                    >
                        <Select placeholder="Select status">
                            <Option value="upcoming">Upcoming</Option>
                            <Option value="active">Active</Option>
                            <Option value="full">Full</Option>
                            <Option value="inactive">Inactive</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item name="time_range" label="Class Time">
                        <TimePicker.RangePicker use12Hours format="h:mm A" style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item name="weekDays" label="Week Days">
                        <Select mode="multiple" placeholder="Select the days this batch meets" allowClear>
                            {WEEK_DAYS.map((day) => (
                                <Option key={day} value={day}>{day}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
}

export default AddBatchModal;
