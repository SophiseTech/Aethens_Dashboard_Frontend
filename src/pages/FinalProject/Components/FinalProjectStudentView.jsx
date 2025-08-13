import { ArrowLeftOutlined, LoadingOutlined } from '@ant-design/icons';
import { useFinalProject } from '@hooks/useFinalProject';
import useUser from '@hooks/useUser';
import CourseHeader from '@pages/FinalProject/Components/CourseHeader'
import PhaseList from '@pages/FinalProject/Components/PhaseList';
import ProgressBar from '@pages/FinalProject/Components/ProgressBar'
import { Button, Spin } from 'antd';
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom';

// Dummy Data

export const phasesData = [
  {
    _id: 1,
    title: "Project Planning & Requirements",
    phaseNumber: 1,
    requiresSubject: true,
    status: 'approved',
    lastSubmittedDate: '2024-01-15',
    description: "Define project scope, requirements, and create detailed project plan"
  },
  {
    _id: 2,
    title: "UI/UX Design & Wireframes",
    phaseNumber: 2,
    requiresSubject: true,
    status: 'approved',
    lastSubmittedDate: '2024-01-22',
    description: "Create user interface designs and wireframes for the application"
  },
  {
    _id: 3,
    title: "Backend Development",
    phaseNumber: 3,
    requiresSubject: false,
    status: 'under-review',
    lastSubmittedDate: '2024-01-30',
    description: "Develop backend APIs, database design, and server infrastructure"
  },
  {
    _id: 4,
    title: "Frontend Development",
    phaseNumber: 4,
    requiresSubject: true,
    status: 'not-started',
    lastSubmittedDate: null,
    description: "Build the frontend application using modern frameworks"
  },
  {
    _id: 5,
    title: "Testing & Deployment",
    phaseNumber: 5,
    requiresSubject: false,
    status: 'not-started',
    lastSubmittedDate: null,
    description: "Comprehensive testing and production deployment"
  }
];

function FinalProjectStudentView() {
  const navigate = useNavigate();
  const { phases, loading, fetchPhases, submissionInfo } = useFinalProject();
  const { user } = useUser()
  const courseData = user?.details_id?.course

  useEffect(() => {
    fetchPhases({ courseId: courseData?._id, studentId: user._id });
  }, []);

  const handleViewPhase = (phase) => {
    navigate(`/student/final-project/phase/${phase._id}`);
  };

  if (loading) {
    return <div className='w-full h-full flex items-center justify-center'><Spin size="large" /></div>
  }
  
  return (
    <div className="max-w-6xl mx-auto p-6 min-h-screen">
      <CourseHeader course={courseData} />
      <ProgressBar submissionInfo={submissionInfo} />
      <PhaseList phases={phases} onViewPhase={handleViewPhase} submissionInfo={submissionInfo} />
    </div>
  );
}

export default FinalProjectStudentView