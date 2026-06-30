import handleError from "@utils/handleError";
import { get, post } from "@utils/Requests";

class DiplomaPreRegService {
  async submitApplication(data) {
    try {
      const response = await post("/v2/diploma-prereg", data);
      if (!response?.data) throw new Error("An error occurred. Please try again");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }

  async listApplications({ status, search, batchId, dateFrom, dateTo, page = 1, limit = 15 } = {}) {
    try {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      if (search) params.set("search", search);
      if (batchId) params.set("batchId", batchId);
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);
      params.set("page", page);
      params.set("limit", limit);
      const response = await get(`/v2/diploma-prereg?${params.toString()}`);
      if (!response?.data) throw new Error("An error occurred. Please try again");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }

  async approveApplication(id, { batchId, intakeId }) {
    try {
      const response = await post(`/v2/diploma-prereg/${id}/approve`, { batchId, intakeId });
      if (!response?.data) throw new Error("An error occurred. Please try again");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }

  async rejectApplication(id, { reason }) {
    try {
      const response = await post(`/v2/diploma-prereg/${id}/reject`, { reason });
      if (!response?.data) throw new Error("An error occurred. Please try again");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }
}

const diplomaPreRegService = new DiplomaPreRegService();
export default diplomaPreRegService;
