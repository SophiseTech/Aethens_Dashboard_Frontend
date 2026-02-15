import handleError from "@utils/handleError";
import { get, post, put, del } from "@utils/Requests";

class NewsletterService {
  async getAll(params = {}) {
    try {
      const searchParams = new URLSearchParams(params).toString();
      const endpoint = searchParams ? `/v2/newsletter?${searchParams}` : "/v2/newsletter";
      const response = await get(endpoint);
      return response?.data ?? response;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const response = await get(`/v2/newsletter/${id}`);
      return response?.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  async create(data) {
    try {
      const response = await post("/v2/newsletter", data);
      return response?.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  async update(id, data) {
    try {
      const response = await put(`/v2/newsletter/${id}`, data);
      return response?.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const response = await del(`/v2/newsletter/${id}`);
      return response?.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }
}

const newsletterService = new NewsletterService();
export default newsletterService;
