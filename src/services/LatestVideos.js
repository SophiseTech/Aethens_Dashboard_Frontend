import handleError from "@utils/handleError";
import { get, post, put, del } from "@utils/Requests";

class LatestVideosService {
  async getAll(params = {}) {
    try {
      const searchParams = new URLSearchParams(params).toString();
      const endpoint = searchParams ? `/v2/latestVideos?${searchParams}` : "/v2/latestVideos";
      const response = await get(endpoint);
      return response?.data ?? response;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const response = await get(`/v2/latestVideos/${id}`);
      return response?.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  async create(data) {
    try {
      const response = await post("/v2/latestVideos", data);
      return response?.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  async update(id, data) {
    try {
      const response = await put(`/v2/latestVideos/${id}`, data);
      return response?.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const response = await del(`/v2/latestVideos/${id}`);
      return response?.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }
}

const latestVideosService = new LatestVideosService();
export default latestVideosService;
