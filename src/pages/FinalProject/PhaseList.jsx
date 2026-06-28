import { useFinalProject } from '@hooks/useFinalProject';
import useUser from '@hooks/useUser';
import CourseHeader from '@pages/FinalProject/Components/CourseHeader';
import PhaseList from '@pages/FinalProject/Components/PhaseList';
import ProgressBar from '@pages/FinalProject/Components/ProgressBar';
import { Spin } from 'antd';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// Dummy Data

function PhaseListPage() {
  const navigate = useNavigate();
  const { phases, loading, fetchPhases, submissionInfo, currentProject, skipProject } = useFinalProject();
  const { user } = useUser()
  const courseData = currentProject?.course || {}
  const { projectId } = useParams()

  useEffect(() => {
    fetchPhases({ projectId, studentId: user._id });
  }, []);

  const handleViewPhase = (phase) => {
    navigate(`/student/final-project/${projectId}/phase/${phase._id}`);
  };

  if (loading) {
    return <div className='flex justify-center items-center w-full h-full'><Spin size="large" /></div>
  }

  return (
    <div className="p-6 mx-auto max-w-6xl min-h-screen">
      <CourseHeader course={courseData} />
      <ProgressBar submissionInfo={submissionInfo} />
      <PhaseList phases={phases} onViewPhase={handleViewPhase} submissionInfo={submissionInfo} />
    </div>
  );
}

export default PhaseListPage