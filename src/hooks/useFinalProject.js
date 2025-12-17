/* eslint-disable react-hooks/exhaustive-deps */
import { projectStatusConfig, statusConfig } from "@pages/FinalProject";
import { useFinalProjectStore } from "@stores/FinalProjectV2";
import { PHASE_STATUS } from "@utils/constants";
import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

export const useFinalProject = () => {
  const {
    projects,
    phases,
    currentSubmission,
    currentPhase,
    pendingSubmissions,
    loading,
    error,
    filters,
    projectPagination,
    currentProject,
    totalProjects,
    createLoading,
    latestSubmission,

    fetchPhases,
    fetchSubmissionDetails,
    fetchPhaseDetails,
    fetchPendingSubmissions,
    submitPhase,
    reviewSubmission,
    setProjectPagination,
    createProject,
    updateProject,
    getProjectById,
    listProjects,
    getLatestSubmission,
    projectFetchLoading
  } = useFinalProjectStore();


  const findNextPhaseToSubmit = (phases) => {
    if (!Array.isArray(phases) || phases.length === 0) {
      return null;
    }

    // Priority order for finding next phase to submit:
    // 1. Phase immediately after the last approved phase
    // 2. First rejected phase (needs resubmission)
    // 3. First not-started phase (new submission)
    // 4. Return null if all are approved or under review

    // Find the last approved phase
    const lastApprovedPhase = [...phases].reverse().find(phase =>
      phase.latestSubmission?.status === PHASE_STATUS.APPROVED
    );

    if (lastApprovedPhase) {
      const nextPhase = phases.find(phase =>
        phase.phaseNumber === lastApprovedPhase.phaseNumber + 1
      );
      if (nextPhase) {
        return nextPhase;
      }
    }

    // Look for rejected phases (next priority)
    const rejectedPhase = phases.find(phase =>
      phase.latestSubmission?.status === PHASE_STATUS.REJECTED
    );

    if (rejectedPhase) {
      return rejectedPhase;
    }

    // Then look for not-started phases
    const underReviewPhase = phases.find(phase =>
      phase.latestSubmission?.status === PHASE_STATUS.UNDER_REVIEW
    );

    if (underReviewPhase) {
      return underReviewPhase;
    }

    const notStartedPhase = phases.find(phase =>
      !phase.latestSubmission ||
      phase.latestSubmission?.status === PHASE_STATUS.NOT_STARTED)

    return notStartedPhase || null

  };

  const getPhaseSubmissionInfo = (phases) => {
    const nextPhase = findNextPhaseToSubmit(phases);

    const stats = phases.reduce((acc, phase) => {
      const status = phase.latestSubmission?.status || PHASE_STATUS.NOT_STARTED;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const approvedCount = stats[PHASE_STATUS.APPROVED] || 0;
    const totalPhases = phases.length;
    const progressPercentage = totalPhases > 0 ? Math.round((approvedCount / totalPhases) * 100) : 0;

    return {
      nextPhase,
      stats,
      progress: {
        approved: approvedCount,
        total: totalPhases,
        percentage: progressPercentage
      },
      isCompleted: approvedCount === totalPhases,
      hasRejectedPhases: (stats[PHASE_STATUS.REJECTED] || 0) > 0,
      hasUnderReviewPhases: (stats[PHASE_STATUS.UNDER_REVIEW] || 0) > 0
    };
  };

  const getProjectsInfo = () => {
    const transofrmedProjects = projects.map(project => {
      const statusConfig = getProjectStatusConfig(project.status);
      return {
        ...project,
        statusText: statusConfig.text,
        statusColor: statusConfig.color,
        statusIcon: statusConfig.icon,
        course: project.courseId,
        student: project.studentId,
        faculty: project.facultyId
      };
    });

    return {
      total: totalProjects,
      filters: filters,
      pagination: projectPagination,
      projects: transofrmedProjects,
      loading,
    }
  }

  const canSubmitPhase = (phase, allPhases = []) => {
    const status = phase.latestSubmission?.status || PHASE_STATUS.NOT_STARTED;

    // Check if previous phases are approved (sequential submission)
    const previousPhases = allPhases.filter(p => p.phaseNumber < phase.phaseNumber);
    const allPreviousApproved = previousPhases.every(p =>
      p.latestSubmission?.status === PHASE_STATUS.APPROVED
    );

    const canSubmit = (
      status === PHASE_STATUS.NOT_STARTED ||
      status === PHASE_STATUS.REJECTED
    ) && allPreviousApproved;

    return {
      canSubmit,
      reason: !canSubmit ? (
        !allPreviousApproved
          ? 'Previous phases must be approved first'
          : status === PHASE_STATUS.UNDER_REVIEW
            ? 'Phase is currently under review'
            : status === PHASE_STATUS.APPROVED
              ? 'Phase is already approved'
              : 'Unknown reason'
      ) : null,
      status,
      previousPhasesApproved: allPreviousApproved
    };
  };

  const currentPhaseInfo = useMemo(() => {
    if (!currentPhase) {
      return {
        phase: null,
        submissions: [],
        latestSubmission: null,
        canSubmit: false,
        phaseStatus: PHASE_STATUS.NOT_STARTED,
        stats: {
          totalSubmissions: 0,
          totalAttempts: 0,
          hasImages: false,
          totalImages: 0
        },
        timeline: [],
        nextAction: null
      };
    }

    const { submissions = [], ...phase } = currentPhase;

    // Latest submission (first in sorted array)
    const latestSubmission = submissions[0] || null;

    // Phase status determination
    const phaseStatus = latestSubmission?.status || PHASE_STATUS.NOT_STARTED;

    // Can submit logic
    const canSubmit = !latestSubmission ||
      latestSubmission.status === PHASE_STATUS.REJECTED ||
      latestSubmission.status === PHASE_STATUS.NOT_STARTED;

    // Statistics
    const stats = {
      totalSubmissions: submissions.length,
      totalAttempts: submissions.length,
      hasImages: submissions.some(sub => sub.images && sub.images.length > 0),
      totalImages: submissions.reduce((total, sub) => total + (sub.images?.length || 0), 0),
      approvedCount: submissions.filter(sub => sub.status === PHASE_STATUS.APPROVED).length,
      rejectedCount: submissions.filter(sub => sub.status === PHASE_STATUS.REJECTED).length,
      underReviewCount: submissions.filter(sub => sub.status === PHASE_STATUS.UNDER_REVIEW).length,
    };


    // Validation for submission
    const validation = {
      canSubmit,
      reasons: {
        alreadyApproved: phaseStatus === PHASE_STATUS.APPROVED,
        underReview: phaseStatus === PHASE_STATUS.UNDER_REVIEW,
        canResubmit: phaseStatus === PHASE_STATUS.REJECTED,
        isNew: phaseStatus === PHASE_STATUS.NOT_STARTED
      },
      getMessage: () => {
        if (validation.reasons.alreadyApproved) return 'Phase already approved';
        if (validation.reasons.underReview) return 'Submission under review';
        if (validation.reasons.canResubmit) return 'Ready for resubmission';
        if (validation.reasons.isNew) return 'Ready for first submission';
        return 'Cannot submit at this time';
      }
    };



    return {
      // Original data
      phase,
      submissions: submissions,
      latestSubmission,

      // Computed fields
      canSubmit,
      phaseStatus,
      stats,
      validation,


      getImagesBySubmission: (submissionId) =>
        submissions.find(sub => sub._id === submissionId)?.images || [],
      hasBeenRejected: () => stats.rejectedCount > 0,
      isFirstSubmission: () => submissions.length === 0,
      getLatestFeedback: () => latestSubmission?.remark || null
    };
  }, [currentPhase]);

  const submissionInfo = useMemo(() =>
    getPhaseSubmissionInfo(phases),
    [phases]
  );

  const getSubmissionEligibility = useCallback((phase) =>
    canSubmitPhase(phase, phases),
    [phases]
  );

  const getStatusConfig = (status) => {
    const config = statusConfig[status] || statusConfig['not_started'];
    return config
  }

  const getProjectStatusConfig = (status) => {
    const config = projectStatusConfig[status] || projectStatusConfig['not_started'];
    return config
  }

  const fetchProjects = useCallback((page = 1, pageSize = 10, view = 'pending') => {
    listProjects({
      query: { status: view },
      populate: [
        {
          path: "studentId",
          select: "username center_id",
        },
        {
          path: "facultyId",
          select: "username"
        },
        {
          path: 'courseId',
          select: "course_name"
        }
      ],
      pagination: { page, limit: pageSize }
    });
  }, [listProjects]);

  const [searchParams, setSearchParams] = useSearchParams();

  const selectedView = searchParams.get("view") || "pending";

  const setView = (view) => {
    const params = new URLSearchParams(searchParams);
    params.set("view", view);
    setSearchParams(params, { replace: true });
    setProjectPagination({ page: 1, limit: 10 });
  };

  const handlePaginationChange = useCallback((page, pageSize) => {
    const view = searchParams.get("view") || "pending";
    setProjectPagination({ page, limit: pageSize });
    fetchProjects(page, pageSize, view);
  }, [fetchProjects, setProjectPagination, searchParams]);

  const projectsInfo = useMemo(() =>
    getProjectsInfo()
    , [getProjectsInfo]);

  return {
    phases,
    currentSubmission,
    pendingSubmissions,
    loading,
    error,
    fetchPhases,
    fetchSubmissionDetails,
    fetchPendingSubmissions,
    submitPhase,
    reviewSubmission,
    submissionInfo,
    currentPhase,
    fetchPhaseDetails,
    getSubmissionEligibility,
    findNextPhase: () => findNextPhaseToSubmit(phases),
    currentPhaseInfo,
    getStatusConfig,
    currentProject,
    listProjects,
    handlePaginationChange,
    getProjectById,
    updateProject,
    totalProjects,
    projectsInfo,
    getProjectStatusConfig,
    createProject,
    createLoading,
    latestSubmission,
    getLatestSubmission,
    setView,
    selectedView,
    projectFetchLoading
  };
};
