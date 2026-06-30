import handleError from "@utils/handleError";
import { get } from "@utils/Requests";

class DiplomaBatchService {
  async getActiveBatches() {
    try {
      const response = await get("/v2/diploma-batch/active");
      if (!response?.data) throw new Error("An error occurred. Please try again");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }
}

const diplomaBatchService = new DiplomaBatchService();
export default diplomaBatchService;
