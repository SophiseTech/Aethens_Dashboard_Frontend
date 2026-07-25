import handleError from "@utils/handleError";
import { get, post, put } from "@utils/Requests";

class DiplomaIntakeService {
  async listIntakes({ courseId, page, limit } = {}) {
    try {
      const params = new URLSearchParams();
      if (courseId) params.set("courseId", courseId);
      if (page) params.set("page", page);
      if (limit) params.set("limit", limit);
      const response = await get(`/v2/diploma-intake?${params.toString()}`);
      if (!response?.data) throw new Error("An error occurred. Please try again");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }

  async createIntake(intakeData) {
    try {
      const response = await post("/v2/diploma-intake", intakeData);
      if (!response?.data) throw new Error("An error occurred. Please try again");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }

  async updateIntake(intakeId, intakeData) {
    try {
      const response = await put(`/v2/diploma-intake/${intakeId}`, intakeData);
      if (!response?.data) throw new Error("An error occurred. Please try again");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }
}

const diplomaIntakeService = new DiplomaIntakeService();
export default diplomaIntakeService;
