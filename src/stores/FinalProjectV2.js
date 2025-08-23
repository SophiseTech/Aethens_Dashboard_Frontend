import finalProjectService from "@/services/FinalProject";
import { create } from "zustand";

export const useFinalProjectStore = create((set, get) => ({
  // State
  projects: [],
  phases: [],
  currentSubmission: null,
  currentPhase: null,
  pendingSubmissions: [],
  currentProject: null,
  totalProjects: 0,
  loading: false,
  error: null,
  createLoading: false,
  latestSubmission: null,

  // Filters and Pagination
  filters: {},
  projectPagination: {
    page: 1,
    limit: 10,
    sort: { createdAt: -1 }
  },

  // ===== Actions =====
  fetchPhases: async ({ studentId: studentId, projectId: projectId }) => {
    set({ loading: true, error: null });
    try {
      const data = await finalProjectService.getStudentProjectPhases(studentId, projectId);
      set({ phases: data.phases || [], loading: false, currentProject: data });
    } catch (error) {
      set({ error, loading: false });
    }
  },

  fetchPhaseDetails: async ({ studentId, phaseId, projectId }) => {
    set({ loading: true, error: null });
    try {
      const data = await finalProjectService.getPhaseDetailsWithHistory(studentId, phaseId, projectId);
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
  },

  // Set filters
  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters }
    }));
  },

  // Set pagination
  setProjectPagination: (newPagination) => {
    set((state) => ({
      projectPagination: { ...state.projectPagination, ...newPagination }
    }));
  },

  // Reset filters
  resetFilters: () => {
    set({
      filters: {
        student_id: null,
        course_id: null,
        status: null,
        search: "",
        startDate: null,
        endDate: null
      }
    });
  },

  // Create a new final project
  createProject: async (data) => {
    set({ createLoading: true, error: null });
    try {
      const response = await finalProjectService.create(data);
      set((state) => ({
        projects: [response, ...state.projects],
        totalProjects: state.totalProjects + 1,
        createLoading: false
      }));
      return response;
    } catch (error) {
      set({ error, createLoading: false });
      throw error;
    }
  },

  // Update an existing final project
  updateProject: async (id, data) => {
    set({ createLoading: true, error: null });
    try {
      const response = await finalProjectService.update(id, data);
      set((state) => ({
        projects: state.projects.map(project =>
          project._id === id ? response : project
        ),
        currentProject: state.currentProject?._id === id ? response : state.currentProject,
        createLoading: false
      }));
      return response;
    } catch (error) {
      set({ error, createLoading: false });
      throw error;
    }
  },

  // Get a final project by ID
  getProjectById: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await finalProjectService.getById(id);
      set({
        currentProject: response,
        loading: false
      });
      return response;
    } catch (error) {
      set({ error, loading: false });
      throw error;
    }
  },

  // List final projects with current filters and pagination
  listProjects: async (newFilters = { query: {}, populate: "", pagination: null }) => {
    const { filters, pagination } = get();
    set({ loading: true, error: null });
    try {
      const response = await finalProjectService.list({ ...filters, ...newFilters.query }, newFilters.pagination || pagination, newFilters.populate);
      set({
        projects: response.projects,
        totalProjects: response.pagination.total,
        loading: false
      });
      return response;
    } catch (error) {
      set({ error, loading: false });
      throw error;
    }
  },


  // Get latest submission by filters (only studentId, projectId filter enabled in server)
  getLatestSubmission: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await finalProjectService.getLatestSubmission(filters);
      set({
        latestSubmission: response,
        loading: false
      });
      return response;
    } catch (error) {
      set({ error, loading: false });
      throw error;
    }
  },


  // Clear current project
  clearCurrentProject: () => {
    set({ currentProject: null });
  },

  // Clear store
  clearStore: () => {
    set({
      projects: [],
      currentProject: null,
      totalProjects: 0,
      filters: {
        student_id: null,
        course_id: null,
        status: null,
        search: "",
        startDate: null,
        endDate: null
      },
      pagination: {
        page: 1,
        limit: 10,
        sort: { createdAt: -1 }
      }
    });
  }
}));
