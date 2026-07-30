import { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, message } from 'antd';
import { useStore } from 'zustand';
import diplomaCourseStore from '@stores/DiplomaCourseStore';
import centerStore from '@stores/CentersStore';
import SubjectsFormSection from './SubjectsFormSection';

const { Option } = Select;

function EditDiplomaCourseModal({ course, visible, onCancel, onSave }) {
    const [form] = Form.useForm();
    const { updateCourse, loading } = diplomaCourseStore();
    const { centers, getCenters } = useStore(centerStore);

    useEffect(() => {
        if (visible) getCenters(0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible]);

    useEffect(() => {
        if (visible && course) {
            form.setFieldsValue({
                name: course.name,
                center_id: course.center_id?._id || course.center_id,
                fee: course.fee,
                numberOfTerms: course.numberOfTerms,
                duration_count: course.duration?.count,
                duration_type: course.duration?.type || 'year',
                subjects: course.subjects || [],
            });
        }
    }, [visible, course, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            const courseData = {
                name: values.name,
                center_id: values.center_id,
                fee: values.fee,
                numberOfTerms: values.numberOfTerms,
                duration: {
                    count: values.duration_count,
                    type: values.duration_type,
                },
                subjects: values.subjects || [],
            };

            await updateCourse(course._id, courseData);
            message.success('Diploma course updated successfully');
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
            title="Edit Diploma Course"
            open={visible}
            onCancel={handleCancel}
            onOk={handleSubmit}
            confirmLoading={loading}
            okText="Update Course"
            width={800}
            style={{ top: 20 }}
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="name"
                    label="Diploma Name"
                    rules={[{ required: true, message: 'Please enter the diploma name' }]}
                >
                    <Input placeholder="Enter diploma name" />
                </Form.Item>

                <Form.Item
                    name="center_id"
                    label="Center"
                    rules={[{ required: true, message: 'Please select a center' }]}
                >
                    <Select placeholder="Select center" showSearch optionFilterProp="children">
                        {centers?.map((center) => (
                            <Option key={center._id} value={center._id}>{center.center_name}</Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    name="fee"
                    label="Course Fee"
                    rules={[{ required: true, message: 'Please enter the course fee' }]}
                >
                    <InputNumber min={0} placeholder="Enter total course fee" style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item
                    name="numberOfTerms"
                    label="Number of Terms"
                    rules={[{ required: true, message: 'Please enter the number of terms' }]}
                >
                    <InputNumber min={1} placeholder="Enter number of terms" style={{ width: '100%' }} />
                </Form.Item>

                <div className="flex gap-4">
                    <Form.Item
                        name="duration_count"
                        label="Duration Count"
                        rules={[{ required: true, message: 'Please enter duration' }]}
                        style={{ flex: 1 }}
                    >
                        <InputNumber min={1} placeholder="Enter duration" style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        name="duration_type"
                        label="Duration Type"
                        rules={[{ required: true, message: 'Please select duration type' }]}
                        style={{ flex: 1 }}
                    >
                        <Select placeholder="Select type">
                            <Option value="month">Month(s)</Option>
                            <Option value="year">Year(s)</Option>
                        </Select>
                    </Form.Item>
                </div>

                <Form.Item name="subjects" label="Subjects">
                    <SubjectsFormSection />
                </Form.Item>
            </Form>
        </Modal>
    );
}

export default EditDiplomaCourseModal;
