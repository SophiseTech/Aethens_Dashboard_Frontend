import payslipService from "@/services/Payslip"
import handleInternalError from "@utils/handleInternalError"
import handleSuccess from "@utils/handleSuccess"
import _ from "lodash"
import { create } from "zustand"

const payslipStore = create((set, get) => ({
  payslips: [],
  loading: true,
  createLoading: false,
  lastRefKey: 0,
  total: 0,
  filters: {},
  summary: {},
  getPayslips: async (limit = 10, filters = {}) => {
    try {
      set({ loading: true })
      const { lastRefKey, payslips: prevPayslips, filters: stateFilters } = get()
      const { payslips, total } = await payslipService.getPayslip(
        filters,
        // lastref key should be zero if new filters are applied so that new data won't get skipped
        _.isEqual(stateFilters.query, filters.query) ? lastRefKey : 0,
        limit
      )
      if (payslips) {
        set({
          payslips: _.isEqual(stateFilters.query, filters.query) ? [...prevPayslips, ...payslips] : payslips,
          lastRefKey: lastRefKey + payslips.length,
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
  editPayslip: async (id, updateData) => {
    try {
      set({ createLoading: true })
      if (!id || !updateData) throw new Error("Bad Data")
      const { payslips } = get()
      const updatedRequest = await payslipService.editPayslip(id, updateData)
      if (updatedRequest && payslips) {
        const updatedPayslips = payslips.map(item => (
          item._id === updatedRequest._id ? { ...item, ...updateData } : item
        ))
        set({ payslips: updatedPayslips })
        handleSuccess("Payslip Request Updated Successfully")
      }
    } catch (error) {
      handleInternalError(error)
    } finally {
      set({ createLoading: false })
    }
  },
  deletePayslip: async (id) => {
    try {
      set({ createLoading: true })
      if (!id) throw new Error("Bad Data")
      const { payslips } = get()
      await payslipService.deletePayslip(id)
      if (payslips) {
        const updatedPayslips = payslips.filter(request => request._id !== id)
        set({ payslips: updatedPayslips })
        handleSuccess("Payslip Request Deleted Successfully")
      }
    } catch (error) {
      handleInternalError(error)
    } finally {
      set({ createLoading: false })
    }
  },
  createPayslip: async (data) => {
    try {
      set({ createLoading: true })
      if (!data) throw new Error("Bad Data")
      const newPayslip = await payslipService.createPayslip(data)
      return newPayslip
    } catch (error) {
      handleInternalError(error)
    } finally {
      set({ createLoading: false })
    }
  },
  getSummary: async (filters) => {
    try {
      set({ loading: true })
      const data = await payslipService.getSummary(filters)
      set({
        summary: data
      })
    } catch (error) {
      handleInternalError(error)
    } finally {
      set({ loading: false })
    }
  },

}))

export default payslipStore
