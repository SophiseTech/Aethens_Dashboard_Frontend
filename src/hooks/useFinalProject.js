import { statusConfig } from "@pages/FinalProject";
import { useFinalProjectStore } from "@stores/FinalProjectV2";
import { PHASE_STATUS } from "@utils/constants";
import { useCallback, useMemo } from "react";

export const useFinalProject = () => {
  const {
    projects,
    phases,
    currentSubmission,
    currentPhase,
    pendingSubmissions,
    loading,
    error,

    fetchProjects,
    fetchPhases,
    fetchSubmissionDetails,
    fetchPhaseDetails,
    fetchPendingSubmissions,
    submitPhase,
    reviewSubmission
  } = useFinalProjectStore();


  const findNextPhaseToSubmit = (phases) => {
    if (!Array.isArray(phases) || phases.length === 0) {
      return null;
    }

    // Priority order for finding next phase to submit:
    // 1. First rejected phase (needs resubmission)
    // 2. First not-started phase (new submission)
    // 3. Return null if all are approved or under review

    // First, look for rejected phases (highest priority)
    const rejectedPhase = phases.find(phase =>
      phase.latestSubmission?.status === PHASE_STATUS.REJECTED
    );

    if (rejectedPhase) {
      return rejectedPhase;
    }

    // Then look for not-started phases
    const notStartedPhase = phases.find(phase =>
      !phase.latestSubmission ||
      phase.latestSubmission?.status === PHASE_STATUS.NOT_STARTED
    );

    return notStartedPhase || null;
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
    const config = statusConfig[status] || statusConfig['not-started'];
    return config
  }

  return {
    projects,
    phases,
    currentSubmission,
    pendingSubmissions,
    loading,
    error,
    fetchProjects,
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
    getStatusConfig
  };
};
