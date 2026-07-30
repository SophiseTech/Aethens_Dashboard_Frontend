import { useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, message } from 'antd';
import dayjs from 'dayjs';
import diplomaIntakeStore from '@stores/DiplomaIntakeStore';
import useDiplomaCourses from '@hooks/useDiplomaCourses';

function EditIntakeModal({ intake, visible, onCancel, onSave }) {
    const [form] = Form.useForm();
    const { updateIntake, loading } = diplomaIntakeStore();
    const { courseOptions, loading: loadingCourses } = useDiplomaCourses({ enabled: visible });

    useEffect(() => {
        if (visible && intake) {
            form.setFieldsValue({
                courseId: intake.courseId?._id || intake.courseId,
                name: intake.name,
                date_range: intake.startDate && intake.endDate
                    ? [dayjs(intake.startDate), dayjs(intake.endDate)]
                    : undefined,
            });
        }
    }, [visible, intake, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            const intakeData = {
                courseId: values.courseId,
                name: values.name,
                startDate: values.date_range?.[0]?.toDate(),
                endDate: values.date_range?.[1]?.toDate(),
            };

            await updateIntake(intake._id, intakeData);
            message.success('Diploma intake updated successfully');
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
            title="Edit Diploma Intake"
            open={visible}
            onCancel={handleCancel}
            onOk={handleSubmit}
            confirmLoading={loading}
            okText="Update Intake"
            width={600}
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="courseId"
                    label="Diploma Course"
                    rules={[{ required: true, message: 'Please select a diploma course' }]}
                >
                    <Select
                        placeholder="Select course"
                        showSearch
                        optionFilterProp="label"
                        loading={loadingCourses}
                        options={courseOptions}
                    />
                </Form.Item>

                <Form.Item
                    name="name"
                    label="Intake Name"
                    rules={[{ required: true, message: 'Please enter the intake name' }]}
                >
                    <Input placeholder="e.g. January 2026" />
                </Form.Item>

                <Form.Item
                    name="date_range"
                    label="Intake Period"
                    rules={[{ required: true, message: 'Please select the intake start and end dates' }]}
                >
                    <DatePicker.RangePicker style={{ width: '100%' }} />
                </Form.Item>
            </Form>
        </Modal>
    );
}

export default EditIntakeModal;
