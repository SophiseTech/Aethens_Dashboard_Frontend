
import billService from "@/services/Bills"
import userStore from "@stores/UserStore"
import handleInternalError from "@utils/handleInternalError"
import handleSuccess from "@utils/handleSuccess"
import _ from "lodash"
import { create } from "zustand"

const billStore = create((set, get) => ({
  bills: [],
  loading: true,
  createLoading: false,
  lastRefKey: 0,
  total: 0,
  filters: {},
  invoiceNo: 0,
  summary: {},
  getBills: async (limit = 2, customFilters = {}) => {
    try {
      set({ loading: true })
      const { lastRefKey, bills: prevBills, filters: stateFilters } = get()
      console.log(stateFilters, customFilters);

      const { bills, total } = await billService.getBills(
        customFilters,
        // lastref key should be zero if new filters are applied so that new data wont get skipped
        _.isEqual(stateFilters.query, customFilters.query) ? lastRefKey : 0,
        limit
      )
      if (bills) {
        set({
          bills: _.isEqual(stateFilters.query, customFilters.query) ? [...prevBills, ...bills] : bills,
          lastRefKey: _.isEqual(stateFilters.query, customFilters.query) ? lastRefKey + bills.length : bills.length,
          total: total
        })
      }
      if (customFilters) {
        set({ filters: _.cloneDeep({ ...stateFilters, ...customFilters }) })
      }
    } catch (error) {
      handleInternalError(error)
    } finally {
      set({ loading: false })
    }
  },
  setFilters: (filters) => { set({ filters }) },
  editBill: async (id, updateData) => {
    try {
      set({ createLoading: true })
      if (!id || !updateData) throw new Error("Bad Data")
      const { bills } = get()
      const bill = await billService.editBill(id, updateData)
      if (bill && bills) {
        const updatedBills = bills.map(item => (
          item._id === bill._id ? { ...item, ...updateData } : item
        ))
        set({ bills: updatedBills })
        handleSuccess("Bill Updated Succesfully")
      }
    } catch (error) {
      handleInternalError(error)
    } finally {
      set({ createLoading: false })
    }
  },
  deleteBill: async (id) => {
    try {
      set({ createLoading: true })
      if (!id) throw new Error("Bad Data")
      const { bills } = get()
      await billService.deleteBill(id)
      if (bills) {
        const updatedBills = bills.filter(bill => bill._id !== id)
        set({ bills: updatedBills })
        handleSuccess("Bill Deleted Succesfully")
      }
    } catch (error) {
      handleInternalError(error)
    } finally {
      set({ createLoading: false })
    }
  },
  createBill: async (data) => {
    try {
      set({ createLoading: true })
      if (!data) throw new Error("Bad Data")
      const { bills, invoiceNo } = get()
      const newBill = await billService.createBill(data)
      if (newBill) {
        const updatedBills = [newBill, ...bills]
        set({ bills: updatedBills, invoiceNo: invoiceNo + 1 })
        handleSuccess("Invoice Created Succesfully")
        return newBill
      }
    } catch (error) {
      handleInternalError(error)
    } finally {
      set({ createLoading: false })
    }
  },
  getInvoiceNo: async () => {
    try {
      set({ loading: true })
      const { user } = userStore.getState()
      const invoiceDoc = await billService.getInvoiceNumber(user.center_id)
      if (invoiceDoc && invoiceDoc.invoiceNo) {
        set({ invoiceNo: invoiceDoc.invoiceNo })
        return invoiceDoc.invoiceNo
      }
    } catch (error) {
      handleInternalError(error)
    } finally {
      set({ loading: false })
    }
  },
  getSummary: async (filters) => {
    try {
      set({ loading: true })
      const data = await billService.getSummary(filters)
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

export default billStore