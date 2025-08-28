import handleError from "@utils/handleError";
import { del, get, post, put } from "@utils/Requests";

class FinalProjectService {
  async getProjectByFilter(filters = {}) {
    try {
      const response = await post(`/finalProject/get`, { filters });
      if (!response) throw new Error("An error occurred. Please try again");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }

  async createFinalProject(data) {
    try {
      const response = await post(`/v2/finalProject`, data);
      if (!response) throw new Error("An error occurred. Please try again");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }

  async editFinalProject(id, updateData) {
    try {
      const response = await put(`/finalProject/${id}`, updateData);
      if (!response || !response.data) throw new Error("An error occurred. Please try again");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }

  async deleteFinalProject(id) {
    try {
      const response = await del(`/finalProject/${id}`);
      if (!response) throw new Error("An error occurred. Please try again");
      return response;
    } catch (error) {
      handleError(error);
    }
  }


  // =========================
  // V2 Methods (Student)
  // =========================

  async getStudentProjectPhases(studentId, projectId) {
    try {
      const response = await get(`/v2/finalProject/student/${studentId}/project/${projectId}/phases`);
      if (!response) throw new Error("An error occurred while fetching phases");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }

  async getPhaseDetailsWithHistory(studentId, phaseId, projectId) {
    try {
      const response = await get(`/v2/finalProject/${projectId}/student/${studentId}/phase/${phaseId}/details`);
      if (!response) throw new Error("An error occurred while fetching phase details");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }

  async submitPhaseAttempt(phaseId, data) {
    try {
      const response = await post(`/v2/finalProject/phase/${phaseId}/submit`, data);
      if (!response) throw new Error("An error occurred while submitting phase attempt");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }

  // =========================
  // V2 Methods (Manager)
  // =========================

  async getPendingSubmissions(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await get(`/v2/finalProject/pending-submissions${queryString ? `?${queryString}` : ""}`);
      if (!response) throw new Error("An error occurred while fetching submissions");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }

  async getSubmissionDetails(submissionId) {
    try {
      const response = await get(`/v2/finalProject/submission/${submissionId}/details`);
      if (!response) throw new Error("An error occurred while fetching submission details");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }

  async create(data) {
    try {
      const response = await post(`/v2/finalProject`, data);
      if (!response) throw new Error("An error occurred while creating final project");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }

  async update(id, updateData) {
    try {
      const response = await put(`/v2/finalProject/${id}`, updateData);
      if (!response) throw new Error("An error occurred while updating final project");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }

  async getById(id) {
    try {
      const response = await get(`/v2/finalProject/${id}`);
      if (!response) throw new Error("An error occurred while fetching final project");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }

  async list(filters = {}, pagination = { page: 1, limit: 10 }, populate) {
    try {
      const queryParams = new URLSearchParams({

        ...filters,
        page: pagination.page,
        limit: pagination.limit,
        sort: JSON.stringify(pagination.sort || { createdAt: -1 })
      }).toString();

      const response = await post(`/v2/finalProject/list?${queryParams}`, { populate });
      if (!response) throw new Error("An error occurred while fetching final projects");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }

  async reviewSubmission(submissionId, data) {
    try {
      const response = await post(`/v2/finalProject/submission/${submissionId}/review`, data);
      if (!response) throw new Error("An error occurred while reviewing submission");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }


  async getLatestSubmission(filters = {}) {
    try {
      const response = await post(`/v2/finalProject/submissions/latest`, filters);
      if (!response) throw new Error("An error occurred while fetching latest submission");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }

}

const finalProjectService = new FinalProjectService();
export default finalProjectService;