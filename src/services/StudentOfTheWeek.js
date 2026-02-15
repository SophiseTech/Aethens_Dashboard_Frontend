import handleError from "@utils/handleError";
import { get, post, put, del } from "@utils/Requests";

class StudentOfTheWeekService {
  async getAll(params = {}) {
    try {
      const searchParams = new URLSearchParams(params).toString();
      const endpoint = searchParams ? `/v2/studentOfTheWeek?${searchParams}` : "/v2/studentOfTheWeek";
      const response = await get(endpoint);
      return response?.data ?? response;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const response = await get(`/v2/studentOfTheWeek/${id}`);
      return response?.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  async create(data) {
    try {
      const response = await post("/v2/studentOfTheWeek", data);
      return response?.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  async update(id, data) {
    try {
      const response = await put(`/v2/studentOfTheWeek/${id}`, data);
      return response?.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const response = await del(`/v2/studentOfTheWeek/${id}`);
      return response?.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }
}

const studentOfTheWeekService = new StudentOfTheWeekService();
export default studentOfTheWeekService;
