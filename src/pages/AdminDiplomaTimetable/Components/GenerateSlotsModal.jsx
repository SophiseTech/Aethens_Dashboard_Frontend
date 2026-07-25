import { useState } from 'react';
import { Modal, Form, DatePicker, Button, message } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import batchScheduleStore from '@stores/BatchScheduleStore';

function GenerateSlotsModal({ schedules = [] }) {
    const [visible, setVisible] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form] = Form.useForm();
    const { generateSlots } = batchScheduleStore();

    const showModal = () => setVisible(true);
    const handleCancel = () => {
        setVisible(false);
        form.resetFields();
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const fromDate = values.date_range[0].format('YYYY-MM-DD');
            const toDate = values.date_range[1].format('YYYY-MM-DD');

            setSubmitting(true);
            const results = await Promise.all(
                schedules.map((schedule) => generateSlots(schedule._id, { fromDate, toDate }))
            );
            const totalSlots = results.reduce((sum, slots) => sum + (slots?.length || 0), 0);
            message.success(`Generated ${totalSlots} slot(s) across ${schedules.length} schedule row(s)`);
            handleCancel();
        } catch (error) {
            if (error.errorFields) {
                message.error('Please select a date range');
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <Button
                icon={<CalendarOutlined />}
                onClick={showModal}
                disabled={!schedules.length}
            >
                Generate Slots
            </Button>

            <Modal
                title="Generate Slots"
                open={visible}
                onCancel={handleCancel}
                onOk={handleSubmit}
                confirmLoading={submitting}
                okText="Generate"
                width={480}
            >
                <p className="mb-4 text-gray-500">
                    Generates slots for every active timetable row of this batch, for every enrolled student, within the selected date range.
                </p>
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="date_range"
                        label="Date Range"
                        rules={[{ required: true, message: 'Please select a date range' }]}
                    >
                        <DatePicker.RangePicker style={{ width: '100%' }} />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
}

export default GenerateSlotsModal;
