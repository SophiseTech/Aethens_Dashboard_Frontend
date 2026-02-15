import handleError from "@utils/handleError";
import { get, post, put, del } from "@utils/Requests";

class ShopItemService {
  async getAll(params = {}) {
    try {
      const searchParams = new URLSearchParams(params).toString();
      const endpoint = searchParams ? `/v2/shopItem?${searchParams}` : "/v2/shopItem";
      const response = await get(endpoint);
      return response?.data ?? response;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const response = await get(`/v2/shopItem/${id}`);
      return response?.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  async getBySlug(slug) {
    try {
      const response = await get(`/v2/shopItem/slug/${slug}`);
      return response?.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  async create(data) {
    try {
      const response = await post("/v2/shopItem", data);
      return response?.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  async update(id, data) {
    try {
      const response = await put(`/v2/shopItem/${id}`, data);
      return response?.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const response = await del(`/v2/shopItem/${id}`);
      return response?.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }
}

const shopItemService = new ShopItemService();
export default shopItemService;
