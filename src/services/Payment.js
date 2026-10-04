import handleError from "@utils/handleError";
import { get, post } from "@utils/Requests";

class PaymentService {
  async getConfig() {
    try {
      const response = await get("/v1/payment/config");
      if (!response || !response.data) {
        throw new Error("Failed to load payment configuration");
      }
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }

  async initiatePayment(billId) {
    try {
      const response = await post("/v1/payment/initiate", { billId });
      if (!response || !response.data) {
        throw new Error("Failed to initiate payment");
      }
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }

  async getPaymentStatus(orderId) {
    try {
      const response = await get(`/v1/payment/status/${orderId}`);
      if (!response || !response.data) {
        throw new Error("Failed to fetch payment status");
      }
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }
}

const paymentService = new PaymentService();
export default paymentService;
