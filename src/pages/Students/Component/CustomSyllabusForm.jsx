import CustomCheckbox from '@components/form/CustomCheckBox';
import CustomForm from '@components/form/CustomForm';
import CustomInput from '@components/form/CustomInput';
import CustomSubmit from '@components/form/CustomSubmit';
import facultyRemarksStore from '@stores/FacultyRemarksStore';
import userStore from '@stores/UserStore';
import studentSyllabusStore from '@stores/StudentSyllabusStore';
import { Card, Col, Empty, Form, Image, Row, Spin, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import { useStore } from 'zustand';

const { Text } = Typography;

function CustomSyllabusForm({ student, course }) {
    const [form] = Form.useForm();
    const { createFacultyRemark, createLoading } = useStore(facultyRemarksStore);
    const { user } = useStore(userStore);
    const { syllabus, loading: syllabusLoading, fetchSyllabus } = useStore(studentSyllabusStore);
    const [selectedImage, setSelectedImage] = useState(null);

    const courseId = student?.details_id?.course_id;

    // Fetch the student's personal custom syllabus on mount
    useEffect(() => {
        if (student?._id && courseId) {
            fetchSyllabus(student._id, courseId);
        }
    }, [student?._id, courseId, fetchSyllabus]);

    const onSubmit = async (values) => {
        if (!selectedImage) return;

        const remarkData = {
            module: 'Custom Syllabus',
            unit: null,
            topic: selectedImage.name,
            faculty_id: user._id,
            student_id: student._id,
            course_id: courseId,
            remarks: values.remarks,
            isTopicComplete: values.isTopicComplete || false,
        };

        if (remarkData.isTopicComplete) {
            remarkData.completedOn = new Date();
        }

        await createFacultyRemark(remarkData);
        form.resetFields();
        setSelectedImage(null);
    };

    const initialValues = { remarks: '', isTopicComplete: false };

    // Images to display: personal syllabus only (SyllabusGallery images)
    const images = syllabus?.images || [];
    console.log(images, syllabus);
    if (syllabusLoading) {
        return (
            <div className="flex justify-center py-10">
                <Spin tip="Loading syllabus..." />
            </div>
        );
    }

    return (
        <div>
            {/* Image Selection Grid */}
            <div className="mb-6">
                <Text strong className="block mb-3">
                    Select an image to add remarks:
                </Text>

                {images.length === 0 ? (
                    <Empty
                        description="No custom syllabus assigned to this student yet. Use the Syllabus Gallery to add images."
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                ) : (
                    <Row gutter={[16, 16]}>
                        {images.map((image, idx) => (
                            <Col xs={24} sm={12} md={8} lg={6} key={image.galleryImageId?.toString() || idx}>
                                <Card
                                    hoverable
                                    className={`cursor-pointer transition-all ${selectedImage?.name === image.name
                                        ? 'border-2 border-primary'
                                        : ''
                                        }`}
                                    onClick={() => setSelectedImage(image)}
                                    cover={
                                        <Image
                                            alt={image.name}
                                            src={image.url}
                                            preview={false}
                                            style={{ width: '100%', height: '160px', objectFit: 'cover' }}
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
                )}
            </div>

            {/* Remark Form */}
            {selectedImage && (
                <Card className="bg-blue-50 border-blue-200">
                    <Text strong className="block mb-3">
                        Adding remark for: {selectedImage.name}
                    </Text>
                    <CustomForm form={form} initialValues={initialValues} action={onSubmit}>
                        <CustomInput
                            label="Remarks"
                            name="remarks"
                            placeholder="Any remarks regarding the student's work on this image..."
                            type="textarea"
                            required={false}
                        />
                        <CustomCheckbox
                            label="Mark this image as completed?"
                            name="isTopicComplete"
                        />
                        <CustomSubmit
                            className="bg-primary"
                            label="Submit"
                            loading={createLoading}
                        />
                    </CustomForm>
                </Card>
            )}

            {!selectedImage && images.length > 0 && (
                <Card className="bg-gray-50 text-center text-gray-500">
                    Please select an image above to add remarks
                </Card>
            )}
        </div>
    );
}

export default CustomSyllabusForm;
