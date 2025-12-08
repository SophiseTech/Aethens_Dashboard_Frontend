import handleError from "@utils/handleError";
import { del, get, post, put } from "@utils/Requests";
import { notification } from "antd";

class EnquiryService {
  // Create enquiry (optional placeholder)
  async createEnquiry(data) {
    try {
      const response = await post("/v3/enquiry", data);
      if (!response || !response.data)
        throw new Error("An error occurred. Please try again");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }

  // Get paginated enquiry list
  async getEnquiries(offset = 1, limit = 10, filters = {}) {
    try {
      const response = await post(
        `/v3/enquiry/list?page=${offset}&limit=${limit}`,
        { filters }
      );
      if (!response || !response.data)
        throw new Error("An error occurred. Please try again");
      return response.data; // expected: { enquiries, total }
    } catch (error) {
      notification.error({
        message: "Error",
        description: error?.message || error,
        placement: "topRight",
      });
      handleError(error);
    }
  }

  async bookDemoSlot(id, payload) {
    try {
      const response = await post(`/v3/enquiry/${id}/demo/book`, payload);
      if (!response || !response.data)
        throw new Error("An error occurred. Please try again");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }

  async markDemoCompleted(id, payload) {
    try {
      const response = await put(`/v3/enquiry/${id}/demo/complete`, payload);
      if (!response || !response.data)
        throw new Error("An error occurred. Please try again");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }

  // Search enquiries
  async search(offset = 0, limit = 10, filters = {}) {
    try {
      const response = await post(
        `/enquiries/search?offset=${offset}&limit=${limit}`,
        { filters }
      );
      if (!response || !response.data)
        throw new Error("An error occurred. Please try again");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }

  // Get single enquiry details
  async getEnquiryDetails(id) {
    try {
      if (!id) throw new Error("Invalid enquiry ID");
      const response = await get(`/enquiries/${id}`);
      if (!response || !response.data)
        throw new Error("An error occurred. Please try again");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }

  // Check if an enquiry exists based on a field and value
  async enquiryExists(field, value) {
    try {
      if (!field) throw new Error("field is required");
      // encode value to be safe in query string
      const qsValue = encodeURIComponent(value ?? "");
      const response = await get(
        `/v3/enquiry/exists?field=${field}&value=${qsValue}`
      );
      if (!response || response.status >= 400)
        throw new Error("An error occurred. Please try again");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }

  // Transition enquiry to a new stage (e.g., closed) with an optional reason
  async transitionEnquiry(id, stage, reason) {
    try {
      if (!id) throw new Error("Invalid enquiry ID");
      const payload = { stage, reason };
      const response = await post(`/v3/enquiry/${id}/transition`, payload);
      if (!response || !response.data)
        throw new Error("An error occurred. Please try again");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }

  // Update enquiry
  async updateEnquiry(id, updateData) {
    try {
      if (!id || !updateData) throw new Error("Bad Data");
      const response = await put(`/v3/enquiry/${id}`, updateData);
      if (!response || !response.data)
        throw new Error("An error occurred. Please try again");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }

  // Delete enquiry
  async deleteEnquiry(id) {
    try {
      if (!id) throw new Error("Invalid enquiry ID");
      const response = await del(`/enquiries/${id}`);
      if (!response) throw new Error("An error occurred. Please try again");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }

  async getDemoSlots() {
    try {
      const response = await get("/v3/enquiry/demo/slots");
      if (!response) throw new Error("An error occurred. Please try again");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }

  async getEnquiryKPI(period, startDate, endDate) {
    try {
      const response = await get(`/v3/enquiry/kpi?period=${period}&startDate=${startDate}&endDate=${endDate}`);
      if (!response) throw new Error("An error occurred. Please try again");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }
  async getDemoHistory(id) {
    try {
      const response = await get(`v3/${id}/demo/history`);
      if (!response) throw new Error("An error occurred. Please try again");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }

  async addFollowUpDate(id, payload) {
    try {
      const response = await post(`/v3/enquiry/${id}/followup`, payload);
      if (!response) throw new Error("An error occurred. Please try again");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }

  async rescheduleSlot(id, payload) {
    try {
      const response = await put(`/v3/enquiry/${id}/demo/postpone`, payload);
      if (!response) throw new Error("An error occurred. Please try again");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }

  async enrollStudent(id, payload) {
    try {
      const response = await post(`/v3/enquiry/${id}/enroll`, payload);
      if (!response) throw new Error("An error occurred. Please try again");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }
}

const enquiryService = new EnquiryService();
export default enquiryService;
