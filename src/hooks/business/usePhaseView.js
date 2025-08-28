import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useFinalProject } from '@hooks/useFinalProject';
import useUser from '@hooks/useUser';
import { ROLES } from '@utils/constants';

export const usePhaseView = () => {
  const { phaseId, studentId, projectId } = useParams();
  const { fetchPhaseDetails, currentPhaseInfo, submitPhase, submitReview, loading } = useFinalProject();
  const { user } = useUser();

  // Determine view context
  const viewContext = {
    userRole: user.role,
    isManagerView: user.role === ROLES.MANAGER && studentId,
    targetStudentId: studentId || user._id,
    canSubmit: user.role === ROLES.STUDENT,
    isStudent: user.role === ROLES.STUDENT
  };

  useEffect(() => {
    fetchPhaseDetails({
      studentId: viewContext.targetStudentId,
      phaseId,
      projectId,
      viewerRole: user.role
    });
  }, [viewContext.targetStudentId, phaseId, user.role]);

  const handleSubmit = async (data) => {
    if (viewContext.userRole !== ROLES.STUDENT || viewContext.isReadOnly) return;

    const images = data.upload?.map(file => file.response);
    data.studentId = user._id;
    data.images = images || [];
    data.projectId = projectId
    await submitPhase(phaseId, data);
    await fetchPhaseDetails({ studentId: user._id, phaseId, projectId });
  };

  const handleReview = async (reviewData) => {
    if (![ROLES.MANAGER, 'instructor'].includes(viewContext.userRole)) return;

    await submitReview(phaseId, viewContext.targetStudentId, reviewData);
    await fetchPhaseDetails({
      studentId: viewContext.targetStudentId,
      phaseId,
      viewerRole: user.role,
    });
  };

  return {
    currentPhaseInfo: currentPhaseInfo,
    viewContext,
    loading,
    onSubmit: handleSubmit,
    onReview: handleReview
  };
};