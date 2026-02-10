import CustomCheckbox from '@components/form/CustomCheckBox';
import CustomForm from '@components/form/CustomForm';
import CustomInput from '@components/form/CustomInput';
import CustomSubmit from '@components/form/CustomSubmit';
import facultyRemarksStore from '@stores/FacultyRemarksStore';
import userStore from '@stores/UserStore';
import { Card, Col, Form, Image, Row, Typography } from 'antd';
import React, { useState } from 'react';
import { useStore } from 'zustand';

const { Text } = Typography;

function CustomSyllabusForm({ student, course }) {
    const [form] = Form.useForm();
    const { createFacultyRemark, createLoading } = useStore(facultyRemarksStore);
    const { user } = useStore(userStore);
    const [selectedImage, setSelectedImage] = useState(null);

    const onSubmit = async (values) => {
        if (!selectedImage) {
            return;
        }

        // Prepare remark data
        const remarkData = {
            module: "Custom Syllabus", // Fixed module name for custom syllabus
            unit: null,
            topic: selectedImage.name, // Store image name in topic field
            faculty_id: user._id,
            student_id: student._id,
            course_id: student.details_id.course_id,
            remarks: values.remarks,
            isTopicComplete: values.isTopicComplete || false,
        };

        if (remarkData.isTopicComplete) {
            remarkData.completedOn = new Date();
        }

        await createFacultyRemark(remarkData);

        // Reset form and selection
        form.resetFields();
        setSelectedImage(null);
    };

    const initialValues = {
        remarks: "",
        isTopicComplete: false,
    };

    return (
        <div>
            {/* Image Selection Grid */}
            <div className="mb-6">
                <Text strong className="block mb-3">
                    Select an image to add remarks:
                </Text>
                <Row gutter={[16, 16]}>
                    {(course?.images || []).map((image) => (
                        <Col xs={24} sm={12} md={8} lg={6} key={image._id}>
                            <Card
                                hoverable
                                className={`cursor-pointer ${selectedImage?._id === image._id
                                        ? 'border-2 border-blue-500'
                                        : ''
                                    }`}
                                onClick={() => setSelectedImage(image)}
                                cover={
                                    <Image
                                        alt={image.name}
                                        src={image.url}
                                        preview={false}
                                        className="h-40 object-cover"
                                    />
                                }
                            >
                                <Card.Meta
                                    title={image.name}
                                    description={`Required: ${image.sessionsRequired || 0} sessions`}
                                />
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>

            {/* Remark Form */}
            {selectedImage && (
                <Card className="bg-blue-50 border-blue-200">
                    <Text strong className="block mb-3">
                        Adding remark for: {selectedImage.name}
                    </Text>
                    <CustomForm form={form} initialValues={initialValues} action={onSubmit}>
                        <CustomInput
                            label={"Remarks"}
                            name={"remarks"}
                            placeholder={"Any remarks regarding the student's work on this image..."}
                            type="textarea"
                            required={false}
                        />
                        <CustomCheckbox
                            label={"Mark this image as completed?"}
                            name={"isTopicComplete"}
                        />
                        <CustomSubmit
                            className="bg-primary"
                            label="Submit"
                            loading={createLoading}
                        />
                    </CustomForm>
                </Card>
            )}

            {!selectedImage && (
                <Card className="bg-gray-50 text-center text-gray-500">
                    Please select an image above to add remarks
                </Card>
            )}
        </div>
    );
}

export default CustomSyllabusForm;
