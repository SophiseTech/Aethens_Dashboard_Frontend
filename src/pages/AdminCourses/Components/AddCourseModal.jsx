import { useState } from 'react';
import { Modal, Form, Input, InputNumber, Select, Button, Radio, Tabs, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import courseStore from '@stores/CourseStore';
import ModulesFormSection from './ModulesFormSection';
import ImagesSelector from './ImagesSelector';
import MaterialItemsSelector from './MaterialItemsSelector';

const { Option } = Select;
const { TabPane } = Tabs;

function AddCourseModal() {
    const [visible, setVisible] = useState(false);
    const [form] = Form.useForm();
    const { createCourse, createLoading } = courseStore();
    const [syllabusType, setSyllabusType] = useState('general');

    const showModal = () => setVisible(true);
    const handleCancel = () => {
        setVisible(false);
        form.resetFields();
        setSyllabusType('general');
    };

    // Helper to normalize modules — ensures topics are stored as [{name, sessionsRequired}]
    const normalizeModules = (modules) => {
        if (!modules || modules.length === 0) return modules;

        return modules.map(module => ({
            ...module,
            units: module.units?.map(unit => ({
                ...unit,
                topics: (unit.topics || []).map(topic => {
                    if (typeof topic === 'string') {
                        // Legacy: plain string -> object
                        return { name: topic.trim(), sessionsRequired: 0 };
                    }
                    return { name: topic.name || '', sessionsRequired: topic.sessionsRequired || 0 };
                }).filter(t => t.name)
            })) || []
        }));
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            const courseData = {
                course_name: values.course_name,
                total_session: values.total_session,
                rate: values.rate,
                duration: {
                    count: values.duration_count,
                    type: values.duration_type,
                },
                syllabusType: values.syllabusType || 'general',
            };

            // Add optional fields only if they have values
            if (values.syllabusType === 'custom' && values.images && values.images.length > 0) {
                courseData.images = values.images.map(img => ({
                    name: img.name,
                    url: img.url,
                    sessionsRequired: img.sessionsRequired || 0
                }));
            }

            if (values.modules && values.modules.length > 0) {
                courseData.modules = normalizeModules(values.modules);
            }

            if (values.defaultMaterialItems && values.defaultMaterialItems.length > 0) {
                courseData.defaultMaterialItems = values.defaultMaterialItems;
            }

            await createCourse(courseData);
            message.success('Course created successfully');
            handleCancel();
        } catch (error) {
            if (error.errorFields) {
                message.error('Please fill in all required fields');
            }
        }
    };

    return (
        <>
            <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={showModal}
            >
                Add Course
            </Button>

            <Modal
                title="Add New Course"
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
                    initialValues={{
                        duration_type: 'month',
                        syllabusType: 'general',
                    }}
                >
                    <Tabs defaultActiveKey="1">
                        {/* Basic Information Tab */}
                        <TabPane tab="Basic Info" key="1">
                            <Form.Item
                                name="course_name"
                                label="Course Name"
                                rules={[{ required: true, message: 'Please enter course name' }]}
                            >
                                <Input placeholder="Enter course name" />
                            </Form.Item>

                            <Form.Item
                                name="total_session"
                                label="Total Sessions"
                                rules={[{ required: true, message: 'Please enter total sessions' }]}
                            >
                                <InputNumber
                                    min={1}
                                    placeholder="Enter number of sessions"
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>

                            <Form.Item
                                name="rate"
                                label="Rate (₹)"
                                rules={[{ required: true, message: 'Please enter course rate' }]}
                            >
                                <InputNumber
                                    min={0}
                                    placeholder="Enter course rate"
                                    style={{ width: '100%' }}
                                    prefix="₹"
                                />
                            </Form.Item>

                            <div className="flex gap-4">
                                <Form.Item
                                    name="duration_count"
                                    label="Duration Count"
                                    rules={[{ required: true, message: 'Please enter duration' }]}
                                    style={{ flex: 1 }}
                                >
                                    <InputNumber
                                        min={1}
                                        placeholder="Enter duration"
                                        style={{ width: '100%' }}
                                    />
                                </Form.Item>

                                <Form.Item
                                    name="duration_type"
                                    label="Duration Type"
                                    rules={[{ required: true, message: 'Please select duration type' }]}
                                    style={{ flex: 1 }}
                                >
                                    <Select placeholder="Select type">
                                        <Option value="day">Day(s)</Option>
                                        <Option value="month">Month(s)</Option>
                                    </Select>
                                </Form.Item>
                            </div>
                        </TabPane>

                        {/* Syllabus Configuration Tab */}
                        <TabPane tab="Syllabus" key="2">
                            <Form.Item
                                name="syllabusType"
                                label="Syllabus Type"
                            >
                                <Radio.Group onChange={(e) => setSyllabusType(e.target.value)}>
                                    <Radio value="general">General</Radio>
                                    <Radio value="custom">Custom</Radio>
                                </Radio.Group>
                            </Form.Item>

                            {syllabusType === 'custom' && (
                                <Form.Item
                                    name="images"
                                    label="Syllabus Images"
                                >
                                    <ImagesSelector />
                                </Form.Item>
                            )}
                        </TabPane>

                        {/* Modules Tab - Only for General Type */}
                        {syllabusType === 'general' && (
                            <TabPane tab="Modules" key="3">
                                <Form.Item
                                    name="modules"
                                    label="Course Modules"
                                >
                                    <ModulesFormSection />
                                </Form.Item>
                            </TabPane>
                        )}

                        {/* Materials Tab */}
                        <TabPane tab="Materials" key="4">
                            <Form.Item
                                name="defaultMaterialItems"
                                label="Default Materials"
                            >
                                <MaterialItemsSelector />
                            </Form.Item>
                        </TabPane>
                    </Tabs>
                </Form>
            </Modal>
        </>
    );
}

export default AddCourseModal;
