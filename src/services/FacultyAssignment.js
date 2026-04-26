import handleError from "@utils/handleError";
import { get, put } from "@utils/Requests";

class FacultyAssignmentService {
  async getCurrentStudents() {
    try {
      const response = await get("/faculty-assignments/today/current-students");
      return response?.data ?? [];
    } catch (error) {
      handleError(error);
      throw error;
    }
  }



  async getStudentAssignment(studentId, centerId, slotId = null) {
    try {
      const params = new URLSearchParams();
      if (centerId) {
        params.append("centerId", centerId);
      }
      if (slotId) {
        params.append("slotId", slotId);
      }
      const query = params.toString() ? `?${params.toString()}` : "";
      const response = await get(`/faculty-assignments/today/student/${studentId}${query}`);
      return response?.data ?? null;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  async reassignStudent(studentId, facultyId, slotId, centerId = null) {
    try {
      const payload = { facultyId, slotId };
      if (centerId && centerId !== "all") {
        payload.centerId = centerId;
      }
      const response = await put(`/faculty-assignments/today/student/${studentId}/reassign`, payload);
      return response?.data ?? null;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  async updateFacultyCap(facultyId, dailyAssignmentCap, centerId = null) {
    try {
      const payload = { dailyAssignmentCap };
      if (centerId && centerId !== "all") {
        payload.centerId = centerId;
      }
      const response = await put(`/faculty-assignments/faculty/${facultyId}/cap`, payload);
      return response?.data ?? null;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }
}

const facultyAssignmentService = new FacultyAssignmentService();
export default facultyAssignmentService;
