import handleError from "@utils/handleError";
import { del, post, put } from "@utils/Requests";

class FacultyDevelopmentProgramService {
  async getPrograms(filters = {}, lastRefKey = 0, limit = 10) {
    try {
      const response = await post(`/facultyDevProgram/list?lastRef=${lastRefKey}&limit=${limit}`, { filters });
      if (!response || !response.data) throw new Error("An error occurred. Please try again");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }

  async createProgram(data) {
    try {
      const response = await post(`/facultyDevProgram/create`, data);
      if (!response) throw new Error("An error occurred. Please try again");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }

  async editProgram(id, updateData) {
    try {
      const response = await put(`/facultyDevProgram/${id}`, updateData);
      if (!response || !response.data) throw new Error("An error occurred. Please try again");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }

  async deleteProgram(id) {
    try {
      const response = await del(`/facultyDevProgram/${id}`);
      if (!response) throw new Error("An error occurred. Please try again");
      return response;
    } catch (error) {
      handleError(error);
    }
  }
}

const facultyDevelopmentProgramService = new FacultyDevelopmentProgramService();
export default facultyDevelopmentProgramService;