import { ArrowLeftOutlined } from '@ant-design/icons';
import Title from '@components/layouts/Title';
import { useFinalProject } from '@hooks/useFinalProject';
import useUser from '@hooks/useUser';
import CourseHeader from '@pages/FinalProject/Components/CourseHeader';
import PhaseList from '@pages/FinalProject/Components/PhaseList';
import ProgressBar from '@pages/FinalProject/Components/ProgressBar';
import { Button, Spin } from 'antd';
import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

function PhaseListPage() {
  const navigate = useNavigate();
  const { phases, loading, fetchPhases, submissionInfo, currentProject } = useFinalProject();
  const { user } = useUser()
  const courseData = currentProject?.course || {}
  const { projectId } = useParams()

  useEffect(() => {
    fetchPhases({ projectId, studentId: user._id });
  }, []);

  const handleViewPhase = (phase) => {
    navigate(`/student/final-project/${projectId}/phase/${phase._id}`);
  };

  return (
    <Title
      title="Final Project"
      button={
        <Link to="/student/final-project">
          <Button icon={<ArrowLeftOutlined />} variant="outlined">My projects</Button>
        </Link>
      }
    >
      {loading
        ? <div className='flex justify-center items-center w-full h-full'><Spin size="large" /></div>
        : (
          <div className="mx-auto w-full max-w-6xl">
            <CourseHeader course={courseData} />
            <ProgressBar submissionInfo={submissionInfo} />
            <PhaseList phases={phases} onViewPhase={handleViewPhase} submissionInfo={submissionInfo} />
          </div>
        )}
    </Title>
  );
}

export default PhaseListPage
