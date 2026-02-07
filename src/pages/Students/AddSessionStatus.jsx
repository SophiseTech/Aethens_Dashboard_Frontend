import SessionStatusTable from '@pages/Students/Component/SessionStatusTable';
import SessionStautsForm from '@pages/Students/Component/SessionStautsForm';
import Title from '@components/layouts/Title';
import facultyRemarksStore from '@stores/FacultyRemarksStore';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button, Card, Spin, Tag } from 'antd';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { isUserActive } from '@utils/helper';
import handleInternalError from '@utils/handleInternalError';
import { useStore } from 'zustand';

function AddSessionStatus() {
    const { studentId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const { getFacultyRemarks } = useStore(facultyRemarksStore);

    useEffect(() => {
        const fetchStudent = async () => {
            try {
                setLoading(true);

                // Check if student data was passed via navigation state
                if (location.state?.student) {
                    const studentData = location.state.student;
                    setStudent(studentData);
                    // Fetch faculty remarks for this student (same as drawer logic)
                    getFacultyRemarks({
                        query: {
                            student_id: studentData._id,
                            course_id: studentData?.details_id?.course_id?._id || studentData?.details_id?.course_id
                        },
                        populate: "faculty_id"
                    });
                } else {
                    // Fallback: redirect back to students list if no student data
                    navigate('/');
                }
            } catch (error) {
                handleInternalError(error);
                navigate('/');
            } finally {
                setLoading(false);
            }
        };

        if (studentId) {
            fetchStudent();
        }
    }, [studentId, navigate, getFacultyRemarks, location.state]);

    const handleBack = () => {
        navigate('/');
    };

    if (loading || !student) {
        return (
            <div className="w-full h-screen flex items-center justify-center">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <Title
            title="Add Session Status"
            button={
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={handleBack}
                    variant="outlined"
                >
                    Back to Students
                </Button>
            }
        >
            {/* Student Info Card */}
            <Card className="mb-4">
                <div className="flex items-center gap-4">
                    <img
                        className="rounded-full aspect-square w-16 border border-border"
                        src={student?.profile_img || '/images/default.jpg'}
                        alt="Profile"
                    />
                    <div>
                        <h2 className="text-xl font-semibold">
                            {student?.username}
                            {!isUserActive(student) && (
                                <Tag color="red" className="ml-2">
                                    Inactive
                                </Tag>
                            )}
                        </h2>
                        <p className="text-gray-600">
                            {student?.details_id?.course?.course_name ||
                                student?.details_id?.course_id?.course_name ||
                                'No course assigned'}
                        </p>
                        <p className="text-sm text-gray-500">
                            Admission No: {student?.details_id?.admissionNumber || 'N/A'}
                        </p>
                    </div>
                </div>
            </Card>

            {/* Session Form */}
            <Card title="Add New Session" className="mb-4">
                <SessionStautsForm student={student} />
            </Card>

            {/* Session History Table */}
            <Card title="Session History">
                <SessionStatusTable student={student} />
            </Card>
        </Title>
    );
}

export default AddSessionStatus;
