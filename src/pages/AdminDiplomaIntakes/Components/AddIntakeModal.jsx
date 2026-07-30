import { useState } from 'react';
import { Modal, Form, Input, Select, Button, DatePicker, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import diplomaIntakeStore from '@stores/DiplomaIntakeStore';
import useDiplomaCourses from '@hooks/useDiplomaCourses';

function AddIntakeModal() {
    const [visible, setVisible] = useState(false);
    const [form] = Form.useForm();
    const { createIntake, createLoading } = diplomaIntakeStore();
    const { courseOptions, loading: loadingCourses } = useDiplomaCourses({ enabled: visible });

    const showModal = () => setVisible(true);
    const handleCancel = () => {
        setVisible(false);
        form.resetFields();
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            const intakeData = {
                courseId: values.courseId,
                name: values.name,
                startDate: values.date_range?.[0]?.toDate(),
                endDate: values.date_range?.[1]?.toDate(),
            };

            await createIntake(intakeData);
            message.success('Diploma intake created successfully');
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
                Add Diploma Intake
            </Button>

            <Modal
                title="Add New Diploma Intake"
                open={visible}
                onCancel={handleCancel}
                onOk={handleSubmit}
                confirmLoading={createLoading}
                okText="Create Intake"
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
        </>
    );
}

export default AddIntakeModal;
