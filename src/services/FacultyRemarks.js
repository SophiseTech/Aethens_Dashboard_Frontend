import handleError from "@utils/handleError";
import { del, get, post, put } from "@utils/Requests";

class FacultyRemarksService {
  async getFacultyRemarks(filters = {}, skip = 0, limit = 10) {
    try {
      const response = await post(`/facultyRemarks/getAll?skip=${skip}&limit=${limit}`, { filters });
      if (!response || !response.data) throw new Error("An error occurred. Please try again");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }

  async createFacultyRemark(data) {
    try {
      const response = await post(`/facultyRemarks/`, data);
      if (!response) throw new Error("An error occurred. Please try again");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }

  async editFacultyRemark(id, updateData) {
    try {
      const response = await put(`/facultyRemarks/${id}`, updateData);
      if (!response || !response.data) throw new Error("An error occurred. Please try again");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }

  async deleteFacultyRemark(id) {
    try {
      const response = await del(`/facultyRemarks/${id}`);
      if (!response) throw new Error("An error occurred. Please try again");
      return response;
    } catch (error) {
      handleError(error);
    }
  }
}

const facultyRemarksService = new FacultyRemarksService();
export default facultyRemarksService;
