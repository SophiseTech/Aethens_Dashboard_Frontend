import handleError from "@utils/handleError";
import { get } from "@utils/Requests";

class DiplomaCourseService {
  async listCourses({ centerId } = {}) {
    try {
      const params = new URLSearchParams();
      if (centerId) params.set("centerId", centerId);
      const response = await get(`/v2/diploma-course?${params.toString()}`);
      if (!response?.data) throw new Error("An error occurred. Please try again");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }
}

export default new DiplomaCourseService();
