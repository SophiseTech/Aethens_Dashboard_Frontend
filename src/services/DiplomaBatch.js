import handleError from "@utils/handleError";
import { get, post, put } from "@utils/Requests";

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

  async listBatches({ status, page, limit } = {}) {
    try {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      if (page) params.set("page", page);
      if (limit) params.set("limit", limit);
      const response = await get(`/v2/diploma-batch?${params.toString()}`);
      if (!response?.data) throw new Error("An error occurred. Please try again");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }

  async createBatch(batchData) {
    try {
      const response = await post("/v2/diploma-batch", batchData);
      if (!response?.data) throw new Error("An error occurred. Please try again");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }

  async updateBatch(batchId, batchData) {
    try {
      const response = await put(`/v2/diploma-batch/${batchId}`, batchData);
      if (!response?.data) throw new Error("An error occurred. Please try again");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }
}

const diplomaBatchService = new DiplomaBatchService();
export default diplomaBatchService;
