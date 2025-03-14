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
      const response = await post(`/finalProject`, data);
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
}

const finalProjectService = new FinalProjectService();
export default finalProjectService;