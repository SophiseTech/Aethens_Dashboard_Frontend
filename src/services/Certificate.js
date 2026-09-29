import handleError from "@utils/handleError";
import { get, post, put, del } from "@utils/Requests";

class CertificateService {
  async getCertificates(filters = {}, lastRefKey = 0, limit = 20) {
    try {
      const response = await post(`/v2/certificates/list?lastRefKey=${lastRefKey}&limit=${limit}`, { filters });
      if (!response || !response.data) throw new Error("An error occurred. Please try again");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }

  async checkDuplicate(studentId, courseId) {
    try {
      const response = await get(`/v2/certificates/check-duplicate?studentId=${studentId}&courseId=${courseId}`);
      if (!response || !response.data) throw new Error("An error occurred. Please try again");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }

  async createCertificate(data) {
    try {
      const response = await post(`/v2/certificates`, data);
      if (!response || !response.data) throw new Error("An error occurred. Please try again");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }

  async updateStatus(id, status) {
    try {
      const response = await put(`/v2/certificates/${id}/status`, { status });
      if (!response || !response.data) throw new Error("An error occurred. Please try again");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }

  async deleteCertificate(id) {
    try {
      const response = await del(`/v2/certificates/${id}`);
      if (!response || !response.data) throw new Error("An error occurred. Please try again");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }

  async exportCertificates(filters = {}) {
    try {
      const response = await post(`/v2/certificates/export`, { filters });
      if (!response || !response.data) throw new Error("An error occurred. Please try again");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }
}

const certificateService = new CertificateService();
export default certificateService;
