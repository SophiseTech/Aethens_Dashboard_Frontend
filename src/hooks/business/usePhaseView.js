import { useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useFinalProject } from '@hooks/useFinalProject';
import useUser from '@hooks/useUser';
import { ROLES } from '@utils/constants';

export const usePhaseView = () => {
  const { phaseId, studentId, projectId } = useParams();
  const { fetchPhaseDetails, currentPhaseInfo, submitPhase, submitReview, loading } = useFinalProject();
  const { user } = useUser();
  const { pathname } = useLocation();
  // Student, faculty and manager routes all end in /phase/:phaseId with a sibling /phases list.
  const allPhasesPath = pathname.replace(/\/phase\/[^/]+\/?$/, '/phases');

  // Determine view context
  const viewContext = {
    userRole: user.role,
    isManagerView: (user.role === ROLES.MANAGER || user.role === ROLES.ACADEMIC_MANAGER || user.role === ROLES.OPERATIONS_MANAGER || user.role === ROLES.ADMIN) && studentId,
    isFacultyView: (user.role === ROLES.FACULTY) && studentId,
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
    allPhasesPath,
    onSubmit: handleSubmit,
    onReview: handleReview
  };
};