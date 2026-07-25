import { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, TimePicker, message } from 'antd';
import dayjs from 'dayjs';
import diplomaBatchStore from '@stores/DiplomaBatchStore';

const { Option } = Select;

const WEEK_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function EditBatchModal({ batch, visible, onCancel, onSave }) {
    const [form] = Form.useForm();
    const { updateBatch, loading } = diplomaBatchStore();

    useEffect(() => {
        if (visible && batch) {
            form.setFieldsValue({
                name: batch.name,
                capacity: batch.capacity,
                status: batch.status,
                time_range: batch.start_time && batch.end_time
                    ? [dayjs(batch.start_time), dayjs(batch.end_time)]
                    : undefined,
                weekDays: batch.weekDays || [],
            });
        }
    }, [visible, batch, form]);

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

            await updateBatch(batch._id, batchData);
            message.success('Diploma batch updated successfully');
            onSave();
            form.resetFields();
        } catch (error) {
            if (error.errorFields) {
                message.error('Please fill in all required fields');
            }
        }
    };

    const handleCancel = () => {
        form.resetFields();
        onCancel();
    };

    return (
        <Modal
            title="Edit Diploma Batch"
            open={visible}
            onCancel={handleCancel}
            onOk={handleSubmit}
            confirmLoading={loading}
            okText="Update Batch"
            width={600}
        >
            <Form form={form} layout="vertical">
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
    );
}

export default EditBatchModal;
