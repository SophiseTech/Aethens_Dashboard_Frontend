import handleError from "@utils/handleError"
import { del, get, post, put } from "@utils/Requests"

class PayslipRequestService {
  async getPayslipRequests(filters = {}, lastRefKey = 0, limit = 10) {
    try {
      const response = await post(`/payslipRequest/list?lastRef=${lastRefKey}&limit=${limit}`, { filters })
      if (!response || !response.data) throw new Error("An error occured. Please try again")
      return response.data
    } catch (error) {
      handleError(error)
    }
  }

  async createPayslipRequest(data) {
    try {
      const response = await post(`/payslipRequest/create`, data)
      if (!response) throw new Error("An error occured. Please try again")
      return response.data
    } catch (error) {
      handleError(error)
    }
  }

  async editPayslipRequest(id, updateData) {
    try {
      const response = await put(`/payslipRequest/edit/${id}`, updateData)
      if (!response || !response.data) throw new Error("An error occured. Please try again")
      return response.data
    } catch (error) {
      handleError(error)
    }
  }

  async deletePayslipRequest(id) {
    try {
      const response = await del(`/payslipRequest/delete/${id}`)
      if (!response) throw new Error("An error occured. Please try again")
      return response
    } catch (error) {
      handleError(error)
    }
  }

  async approvePayslipRequest(id) {
    try {
      const response = await post(`/payslipRequest/approve/${id}`)
      if (!response) throw new Error("An error occured. Please try again")
      return response.data
    } catch (error) {
      handleError(error)
    }
  }

  async rejectPayslipRequest(id) {
    try {
      const response = await post(`/payslipRequest/reject/${id}`)
      if (!response) throw new Error("An error occured. Please try again")
      return response.data
    } catch (error) {
      handleError(error)
    }
  }
}

const payslipRequestService = new PayslipRequestService()
export default payslipRequestService
