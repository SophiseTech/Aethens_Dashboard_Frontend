import { Modal, Form, DatePicker, Select, Input, message } from "antd";
import { useState } from "react";
import dayjs from "dayjs";
import leaveService from "@services/LeaveService";

const { RangePicker } = DatePicker;
const { TextArea } = Input;

function ApplyLeaveModal({ visible, onClose, onSuccess }) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (values) => {
        try {
            setLoading(true);

            const [fromDate, toDate] = values.dateRange;

            const leaveData = {
                fromDate: fromDate.format("YYYY-MM-DD"),
                toDate: toDate.format("YYYY-MM-DD"),
                leaveType: values.leaveType,
                reason: values.reason
            };

            await leaveService.applyLeave(leaveData);

            message.success("Leave application submitted successfully!");
            form.resetFields();
            onClose();
            if (onSuccess) onSuccess();
        } catch (error) {
            // Error already handled by service
            console.error("Apply leave error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        onClose();
    };

    // Disable past dates
    const disabledDate = (current) => {
        return current && current < dayjs().startOf('day');
    };

    return (
        <Modal
            title="Apply for Leave"
            open={visible}
            onOk={() => form.submit()}
            onCancel={handleCancel}
            confirmLoading={loading}
            okText="Submit"
            cancelText="Cancel"
            width={600}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                className="mt-4"
            >
                <Form.Item
                    name="dateRange"
                    label="Leave Duration"
                    rules={[
                        { required: true, message: "Please select leave duration" }
                    ]}
                >
                    <RangePicker
                        style={{ width: "100%" }}
                        disabledDate={disabledDate}
                        format="DD-MM-YYYY"
                    />
                </Form.Item>

                <Form.Item
                    name="leaveType"
                    label="Leave Type"
                    rules={[
                        { required: true, message: "Please select leave type" }
                    ]}
                >
                    <Select placeholder="Select leave type">
                        <Select.Option value="CASUAL">Casual Leave</Select.Option>
                        <Select.Option value="SICK">Sick Leave</Select.Option>
                        <Select.Option value="PERMISSION">Permission</Select.Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    name="reason"
                    label="Reason"
                    rules={[
                        { required: true, message: "Please provide a reason" },
                        { max: 500, message: "Reason cannot exceed 500 characters" }
                    ]}
                >
                    <TextArea
                        rows={4}
                        placeholder="Enter reason for leave"
                        maxLength={500}
                        showCount
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
}

export default ApplyLeaveModal;
