import handleError from "@utils/handleError";
import { del, get, post } from "@utils/Requests";

const BASE = "/v2/payment-reconciliation/statements";

class PaymentReconciliationService {
  async getStatements() {
    try {
      const response = await get(BASE);
      return response?.data || [];
    } catch (error) {
      return handleError(error);
    }
  }

  async getStatement(id) {
    try {
      const response = await get(`${BASE}/${id}`);
      if (!response?.data) throw new Error("Statement not found");
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  }

  async uploadStatement(fileName, rows) {
    try {
      const response = await post(BASE, { fileName, rows });
      if (!response?.data) throw new Error("Failed to upload statement");
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  }

  async reconcile(id) {
    try {
      const response = await post(`${BASE}/${id}/reconcile`);
      if (!response?.data) throw new Error("Failed to reconcile statement");
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  }

  async deleteStatement(id) {
    try {
      const response = await del(`${BASE}/${id}`);
      return response?.data;
    } catch (error) {
      return handleError(error);
    }
  }
}

export default new PaymentReconciliationService();
