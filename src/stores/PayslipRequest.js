import payslipRequestService from "@/services/PayslipRequest"
import handleInternalError from "@utils/handleInternalError"
import handleSuccess from "@utils/handleSuccess"
import _ from "lodash"
import { create } from "zustand"

const payslipRequestStore = create((set, get) => ({
  payslipRequests: [],
  loading: true,
  createLoading: false,
  lastRefKey: 0,
  total: 0,
  filters: {},
  getPayslipRequests: async (limit = 10, filters = {}) => {
    try {
      set({ loading: true })
      const { lastRefKey, payslipRequests: prevPayslipRequests, filters: stateFilters } = get()
      const { requests, total } = await payslipRequestService.getPayslipRequests(
        filters,
        // lastref key should be zero if new filters are applied so that new data won't get skipped
        _.isEqual(stateFilters.query, filters.query) ? lastRefKey : 0,
        limit
      )
      if (requests) {
        set({
          payslipRequests: _.isEqual(stateFilters.query, filters.query) ? [...prevPayslipRequests, ...requests] : requests,
          lastRefKey: lastRefKey + requests.length,
          total: total
        })
      }
      if (filters) {
        set({ filters: { ...stateFilters, ...filters } })
      }
    } catch (error) {
      handleInternalError(error)
    } finally {
      set({ loading: false })
    }
  },
  editPayslipRequest: async (id, updateData) => {
    try {
      set({ createLoading: true })
      if (!id || !updateData) throw new Error("Bad Data")
      const { payslipRequests } = get()
      const updatedRequest = await payslipRequestService.editPayslipRequest(id, updateData)
      if (updatedRequest && payslipRequests) {
        const updatedPayslipRequests = payslipRequests.map(item => (
          item._id === updatedRequest._id ? { ...item, ...updateData } : item
        ))
        set({ payslipRequests: updatedPayslipRequests })
        handleSuccess("Payslip Request Updated Successfully")
      }
    } catch (error) {
      handleInternalError(error)
    } finally {
      set({ createLoading: false })
    }
  },
  deletePayslipRequest: async (id) => {
    try {
      set({ createLoading: true })
      if (!id) throw new Error("Bad Data")
      const { payslipRequests } = get()
      await payslipRequestService.deletePayslipRequest(id)
      if (payslipRequests) {
        const updatedPayslipRequests = payslipRequests.filter(request => request._id !== id)
        set({ payslipRequests: updatedPayslipRequests })
        handleSuccess("Payslip Request Deleted Successfully")
      }
    } catch (error) {
      handleInternalError(error)
    } finally {
      set({ createLoading: false })
    }
  },
  createPayslipRequest: async (data) => {
    try {
      set({ createLoading: true })
      if (!data) throw new Error("Bad Data")
      const newPayslipRequest = await payslipRequestService.createPayslipRequest(data)
      handleSuccess("Payslip request submitted succesfully")
      return newPayslipRequest
    } catch (error) {
      handleInternalError(error)
    } finally {
      set({ createLoading: false })
    }
  },
  approvePayslipRequest: async (id) => {
    try {
      set({ createLoading: true })
      if (!id) throw new Error("Bad Data")
      const { payslipRequests } = get()
      const { request, paymentDetails } = await payslipRequestService.approvePayslipRequest(id)
      if (request) {
        const updatedPayslipRequests = payslipRequests.filter(request => request._id !== id)
        set({ payslipRequests: updatedPayslipRequests })
        handleSuccess("Payslip Request Approved Successfully")
        return request
      }
    } catch (error) {
      handleInternalError(error)
    } finally {
      set({ createLoading: false })
    }
  },
  rejectPayslipRequest: async (id) => {
    try {
      set({ createLoading: true })
      if (!id) throw new Error("Bad Data")
      const { payslipRequests } = get()
      const rejectedRequest = await payslipRequestService.rejectPayslipRequest(id)
      if (rejectedRequest) {
        const updatedPayslipRequests = payslipRequests.filter(request => request._id !== id)
        set({ payslipRequests: updatedPayslipRequests })
        handleSuccess("Payslip Request Rejected Successfully")
        return rejectedRequest
      }
    } catch (error) {
      handleInternalError(error)
    } finally {
      set({ createLoading: false })
    }
  },

}))

export default payslipRequestStore
