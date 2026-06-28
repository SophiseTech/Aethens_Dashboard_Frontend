import useProjectsView from '@hooks/business/useProjectsView';
import useCourse from '@hooks/useCourse';
import { useFinalProject } from '@hooks/useFinalProject';
import CourseHeader from '@pages/FinalProject/Components/CourseHeader';
import PhaseList from '@pages/FinalProject/Components/PhaseList';
import ProgressBar from '@pages/FinalProject/Components/ProgressBar';
import { Skeleton, Spin } from 'antd';
import React, { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

function StudentProjectDetails() {
  const { studentId, projectId } = useParams()
  const { phases, loading, fetchPhases, submissionInfo, currentProject, skipProject, createLoading } = useFinalProject();
  const { viewContext } = useProjectsView()
  const course = currentProject?.course || {}

  const navigate = useNavigate();

  useEffect(() => {
    fetchPhases({ projectId, studentId });
  }, []);

  const handleViewPhase = (phase) => {
    console.log(viewContext);

    if (viewContext.isManagerView) {
      navigate(`/manager/final-project/${projectId}/student/${studentId}/phase/${phase._id}`);
    } else if (viewContext.isFacultyView) {
      navigate(`/faculty/final-project/${projectId}/student/${studentId}/phase/${phase._id}`);
    }
  };

  if (loading) {
    return <div className='flex justify-center items-center w-full h-full'><Spin size="large" /></div>
  }

  const onSkipPhase = (phase) => {
    skipProject({ phaseId: phase._id, studentId: studentId, projectId: projectId })
  }

  return (
    <div className="p-6 mx-auto max-w-6xl min-h-screen">
      {loading ?
        (
          <Skeleton active title={false} className="mb-6" />
        )
        : <CourseHeader course={course} />
      }
      <ProgressBar submissionInfo={submissionInfo} />
      <PhaseList phases={phases} onViewPhase={handleViewPhase} submissionInfo={submissionInfo} onSkipPhase={onSkipPhase} createLoading={createLoading} />
    </div>
  );
}

export default StudentProjectDetails