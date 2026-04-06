import facultyAssignmentService from "@services/FacultyAssignment";
import userService from "@services/User";
import handleInternalError from "@utils/handleInternalError";
import handleSuccess from "@utils/handleSuccess";
import { create } from "zustand";

const facultyAssignmentStore = create((set, get) => ({
  currentStudents: [],
  currentAssignment: null,
  assignments: [],
  facultyCandidates: [],
  facultyStats: [],
  loading: false,
  submitLoading: false,
  getCurrentStudents: async () => {
    try {
      set({ loading: true });
      const currentStudents = await facultyAssignmentService.getCurrentStudents();
      set({ currentStudents: currentStudents || [] });
    } catch (error) {
      handleInternalError(error);
    } finally {
      set({ loading: false });
    }
  },

  getStudentAssignment: async (studentId, centerId, slotId = null) => {
    try {
      set({ loading: true });
      const response = await facultyAssignmentService.getStudentAssignment(studentId, centerId, slotId);
      set({
        currentAssignment: response?.assignment || null,
        assignments: response?.assignments || [],
        facultyCandidates: response?.facultyCandidates || [],
      });
      return response;
    } catch (error) {
      handleInternalError(error);
      return null;
    } finally {
      set({ loading: false });
    }
  },
  reassignStudent: async (studentId, facultyId, slotId, centerId = null) => {
    try {
      set({ submitLoading: true });
      const response = await facultyAssignmentService.reassignStudent(studentId, facultyId, slotId, centerId);
      set({
        currentAssignment: response?.assignment || null,
        assignments: response?.assignments || [],
        facultyCandidates: response?.facultyCandidates || [],
      });
      handleSuccess("Faculty assignment updated");
      return response;
    } catch (error) {
      handleInternalError(error);
      return null;
    } finally {
      set({ submitLoading: false });
    }
  },
  getFacultyStats: async (centerId) => {
    try {
      set({ loading: true });
      const response = await userService.getFacultyAssignmentStats(centerId);
      set({ facultyStats: response || [] });
    } catch (error) {
      handleInternalError(error);
    } finally {
      set({ loading: false });
    }
  },
  updateFacultyCap: async (facultyId, dailyAssignmentCap, centerId) => {
    try {
      set({ submitLoading: true });
      const response = await facultyAssignmentService.updateFacultyCap(facultyId, dailyAssignmentCap, centerId);
      const facultyStats = get().facultyStats.map((item) =>
        item._id === facultyId
          ? { ...item, dailyAssignmentCap: response?.dailyAssignmentCap ?? dailyAssignmentCap, assignedCount: response?.assignedCount ?? item.assignedCount }
          : item
      );
      set({ facultyStats });
      handleSuccess("Faculty cap updated");
      return response;
    } catch (error) {
      handleInternalError(error);
      return null;
    } finally {
      set({ submitLoading: false });
    }
  },
  resetAssignment: () => set({ currentAssignment: null, assignments: [], facultyCandidates: [] }),
}));

export default facultyAssignmentStore;
