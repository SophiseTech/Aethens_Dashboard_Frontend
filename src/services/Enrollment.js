import handleError from "@utils/handleError";
import { get } from "@utils/Requests";

class EnrollmentService {
  async getMyEnrollment(userId) {
    try {
      const params = new URLSearchParams();
      if (userId) params.set("userId", userId);
      const response = await get(`/enrollment/my-enrollment?${params.toString()}`);
      if (!response) throw new Error("An error occurred. Please try again");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }
}

export default new EnrollmentService();
