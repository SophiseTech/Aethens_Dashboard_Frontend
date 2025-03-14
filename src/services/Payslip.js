import handleError from "@utils/handleError"
import { del, get, post, put } from "@utils/Requests"

class PayslipService {
  async getPayslip(filters = {}, lastRefKey = 0, limit = 10) {
    try {
      const response = await post(`/payslip/list?lastRef=${lastRefKey}&limit=${limit}`, { filters })
      if (!response || !response.data) throw new Error("An error occured. Please try again")
      return response.data
    } catch (error) {
      handleError(error)
    }
  }

  async createPayslip(data) {
    try {
      const response = await post(`/payslip/create`, data)
      if (!response) throw new Error("An error occured. Please try again")
      return response.data
    } catch (error) {
      handleError(error)
    }
  }

  async editPayslip(id, updateData) {
    try {
      const response = await put(`/payslip/edit/${id}`, updateData)
      if (!response || !response.data) throw new Error("An error occured. Please try again")
      return response.data
    } catch (error) {
      handleError(error)
    }
  }

  async deletePayslip(id) {
    try {
      const response = await del(`/payslip/delete/${id}`)
      if (!response) throw new Error("An error occured. Please try again")
      return response
    } catch (error) {
      handleError(error)
    }
  }

  async approvePayslip(id) {
    try {
      const response = await post(`/payslip/approve/${id}`)
      if (!response) throw new Error("An error occured. Please try again")
      return response.data
    } catch (error) {
      handleError(error)
    }
  }

  async rejectPayslip(id) {
    try {
      const response = await post(`/payslip/reject/${id}`)
      if (!response) throw new Error("An error occured. Please try again")
      return response.data
    } catch (error) {
      handleError(error)
    }
  }

  async getSummary(filters = {}) {
    try {
      const response = await post(`/payslip/summary`, { filters })
      if (!response || !response.data) throw new Error("An error occured. Please try again")
      return response.data
    } catch (error) {
      handleError(error)
    }
  }
}

const payslipService = new PayslipService()
export default payslipService
