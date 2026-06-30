import handleError from "@utils/handleError";
import { get } from "@utils/Requests";

class DiplomaIntakeService {
  async listIntakes({ courseId } = {}) {
    try {
      const params = new URLSearchParams();
      if (courseId) params.set("courseId", courseId);
      const response = await get(`/v2/diploma-intake?${params.toString()}`);
      if (!response?.data) throw new Error("An error occurred. Please try again");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }
}

const diplomaIntakeService = new DiplomaIntakeService();
export default diplomaIntakeService;
