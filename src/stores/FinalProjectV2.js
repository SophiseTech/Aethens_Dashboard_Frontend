import finalProjectService from "@/services/FinalProject";
import { create } from "zustand";

export const useFinalProjectStore = create((set, get) => ({
  projects: [],
  phases: [],
  currentSubmission: null,
  currentPhase: null,
  pendingSubmissions: [],
  loading: false,
  error: null,

  // ===== Actions =====
  fetchPhases: async ({ studentId: studentId, courseId: courseId }) => {
    set({ loading: true, error: null });
    try {
      const data = await finalProjectService.getStudentProjectPhases(studentId, courseId);
      set({ phases: data.phases || [], loading: false });
    } catch (error) {
      set({ error, loading: false });
    }
  },

  fetchPhaseDetails: async ({ studentId, phaseId }) => {
    set({ loading: true, error: null });
    try {
      const data = await finalProjectService.getPhaseDetailsWithHistory(studentId, phaseId);
      set({ currentPhase: data || null, loading: false });
    } catch (error) {
      set({ error, loading: false });
    }
  },

  fetchSubmissionDetails: async (submissionId) => {
    set({ loading: true, error: null });
    try {
      const data = await finalProjectService.getSubmissionDetails(submissionId);
      set({ currentSubmission: data || null, loading: false });
    } catch (error) {
      set({ error, loading: false });
    }
  },

  fetchPendingSubmissions: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const data = await finalProjectService.getPendingSubmissions(params);
      set({ pendingSubmissions: data || [], loading: false });
    } catch (error) {
      set({ error, loading: false });
    }
  },

  submitPhase: async (phaseId, data) => {
    set({ loading: true, error: null });
    try {
      await finalProjectService.submitPhaseAttempt(phaseId, data);
      set({ loading: false });
    } catch (error) {
      set({ error, loading: false });
    }
  },

  reviewSubmission: async (submissionId, reviewData) => {
    set({ loading: true, error: null });
    try {
      await finalProjectService.reviewSubmission(submissionId, reviewData);
      set({ loading: false });
    } catch (error) {
      set({ error, loading: false });
    }
  }
}));
