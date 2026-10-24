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

  async createOrder(billId) {
    try {
      const response = await post("/v1/payment/create-order", { billId });
      if (!response || !response.data) {
        throw new Error("Failed to create payment order");
      }
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }

  async initiatePayment(billId) {
    return this.createOrder(billId);
  }

  async verifyPayment(paymentDetails) {
    try {
      const response = await post("/v1/payment/verify-payment", paymentDetails);
      if (!response || !response.data) {
        throw new Error("Failed to verify payment");
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
