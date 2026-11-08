import handleError from "@utils/handleError";
import { del, get, post, put } from "@utils/Requests";

const BASE = "/v2/payment-links";

// Amount → payment link mappings used by the fee reminder (admin only)
class PaymentLinksService {
  async list() {
    try {
      const response = await get(BASE);
      return response?.data || [];
    } catch (error) {
      return handleError(error);
    }
  }

  async create({ amount, link }) {
    try {
      const response = await post(BASE, { amount, link });
      if (!response?.data) throw new Error("Failed to add payment link");
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  }

  async update(id, { amount, link }) {
    try {
      const response = await put(`${BASE}/${id}`, { amount, link });
      if (!response?.data) throw new Error("Failed to update payment link");
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  }

  async remove(id) {
    try {
      await del(`${BASE}/${id}`);
    } catch (error) {
      return handleError(error);
    }
  }
}

export default new PaymentLinksService();
