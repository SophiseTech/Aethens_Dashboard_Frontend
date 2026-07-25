import handleError from "@utils/handleError";
import { get, post, put } from "@utils/Requests";

class BatchScheduleService {
  async listByBatch(batchId) {
    try {
      const response = await get(`/v2/batch-schedule/batch/${batchId}`);
      if (!response?.data) throw new Error("An error occurred. Please try again");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }

  async create(data) {
    try {
      const response = await post("/v2/batch-schedule", data);
      if (!response?.data) throw new Error("An error occurred. Please try again");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }

  async update(id, data) {
    try {
      const response = await put(`/v2/batch-schedule/${id}`, data);
      if (!response?.data) throw new Error("An error occurred. Please try again");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }

  async listBatchesForIntake(intakeId) {
    try {
      const response = await get(`/v2/batch-schedule/intake/${intakeId}/batches`);
      if (!response?.data) throw new Error("An error occurred. Please try again");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }

  async generateSlots(id, { fromDate, toDate }) {
    try {
      const response = await post(`/v2/batch-schedule/${id}/generate-slots`, { fromDate, toDate });
      if (!response?.data) throw new Error("An error occurred. Please try again");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }
}

export default new BatchScheduleService();
