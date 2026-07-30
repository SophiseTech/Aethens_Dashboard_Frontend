import { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, Select, Button, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useStore } from 'zustand';
import diplomaCourseStore from '@stores/DiplomaCourseStore';
import centerStore from '@stores/CentersStore';
import useFormDraft from '@hooks/useFormDraft';
import SubjectsFormSection from './SubjectsFormSection';

const { Option } = Select;
const DRAFT_STORAGE_KEY = 'draft:addDiplomaCourse';

function AddDiplomaCourseModal() {
    const [visible, setVisible] = useState(false);
    const [form] = Form.useForm();
    const { createCourse, createLoading } = diplomaCourseStore();
    const { centers, getCenters } = useStore(centerStore);
    const { draft, saveDraft, clearDraft } = useFormDraft(DRAFT_STORAGE_KEY);

    useEffect(() => {
        if (visible) getCenters(0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible]);

    const showModal = () => {
        setVisible(true);
        if (draft) form.setFieldsValue(draft);
    };
    const handleCancel = () => {
        setVisible(false);
        form.resetFields();
    };

    const handleValuesChange = (_, allValues) => saveDraft(allValues);

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

            await createCourse(courseData);
            message.success('Diploma course created successfully');
            clearDraft();
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
                Add Diploma Course
            </Button>

            <Modal
                title="Add New Diploma Course"
                open={visible}
                onCancel={handleCancel}
                onOk={handleSubmit}
                confirmLoading={createLoading}
                okText="Create Course"
                width={800}
                style={{ top: 20 }}
            >
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{ duration_type: 'year' }}
                    onValuesChange={handleValuesChange}
                >
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
        </>
    );
}

export default AddDiplomaCourseModal;
