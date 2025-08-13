import useCourse from '@hooks/useCourse';
import { useFinalProject } from '@hooks/useFinalProject';
import CourseHeader from '@pages/FinalProject/Components/CourseHeader';
import PhaseList from '@pages/FinalProject/Components/PhaseList';
import ProgressBar from '@pages/FinalProject/Components/ProgressBar';
import { Skeleton, Spin } from 'antd';
import React, { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

function StudentProjectDetails() {
  const { studentId, courseId } = useParams()
  const { phases, loading, fetchPhases, submissionInfo } = useFinalProject();
  const { getCourse, course, loading: courseLoading } = useCourse()

  const navigate = useNavigate();

  useEffect(() => {
    fetchPhases({ courseId: courseId, studentId: studentId });
    getCourse(courseId)
  }, []);

  const handleViewPhase = (phase) => {
    navigate(`/manager/final-project/student/${studentId}/phase/${phase._id}`);
  };

  if (loading) {
    return <div className='w-full h-full flex items-center justify-center'><Spin size="large" /></div>
  }

  return (
    <div className="max-w-6xl mx-auto p-6 min-h-screen">
      {courseLoading ?
        (
          <Skeleton active title={false} className="mb-6" />
        )
        : <CourseHeader course={course} />
      }
      <ProgressBar submissionInfo={submissionInfo} />
      <PhaseList phases={phases} onViewPhase={handleViewPhase} submissionInfo={submissionInfo} />
    </div>
  );
}

export default StudentProjectDetails