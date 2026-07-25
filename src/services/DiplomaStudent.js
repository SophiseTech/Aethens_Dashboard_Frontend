import handleError from "@utils/handleError";
import { post } from "@utils/Requests";

class DiplomaStudentService {
  async listDiplomaStudents({ view, courseId, search, page, limit, centerId } = {}) {
    try {
      const response = await post("/v2/students/diploma-students", {
        view,
        courseId,
        search,
        page,
        limit,
        centerId,
      });
      if (!response?.data) throw new Error("An error occurred. Please try again");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }
}

const diplomaStudentService = new DiplomaStudentService();
export default diplomaStudentService;
