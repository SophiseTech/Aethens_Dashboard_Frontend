import handleError from "@utils/handleError";
import { get, post, put } from "@utils/Requests";

class DiplomaCourseService {
  async listCourses({ centerId, page, limit } = {}) {
    try {
      const params = new URLSearchParams();
      if (centerId) params.set("centerId", centerId);
      if (page) params.set("page", page);
      if (limit) params.set("limit", limit);
      const response = await get(`/v2/diploma-course?${params.toString()}`);
      if (!response?.data) throw new Error("An error occurred. Please try again");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }

  async getById(id) {
    try {
      const response = await get(`/v2/diploma-course/${id}`);
      if (!response?.data) throw new Error("An error occurred. Please try again");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }

  async createCourse(courseData) {
    try {
      const response = await post("/v2/diploma-course", courseData);
      if (!response?.data) throw new Error("An error occurred. Please try again");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }

  async updateCourse(courseId, courseData) {
    try {
      const response = await put(`/v2/diploma-course/${courseId}`, courseData);
      if (!response?.data) throw new Error("An error occurred. Please try again");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }

  async getStudentSyllabus(userId, filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.status && filters.status !== "all") params.append("status", filters.status);
      if (filters.search) params.append("search", filters.search);

      const queryString = params.toString();
      const url = `/v2/diploma-course/getStudentSyllabus${queryString ? "?" + queryString : ""}`;
      const response = await post(url, { userId });
      if (!response?.data) throw new Error("An error occurred. Please try again");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }
}

export default new DiplomaCourseService();
