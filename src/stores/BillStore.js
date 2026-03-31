
import billService from "@/services/Bills"
import userStore from "@stores/UserStore"
import handleInternalError from "@utils/handleInternalError"
import handleSuccess from "@utils/handleSuccess"
import _ from "lodash"
import { create } from "zustand"
import centersStore from "./CentersStore"

const billStore = create((set, get) => ({
  bills: [],
  loading: true,
  createLoading: false,
  lastRefKey: 0,
  total: 0,
  filters: {},
  invoiceNo: 0,
  center_initial: '',
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
        const filters = _.cloneDeep({ ...stateFilters, ...customFilters })
        if (filters.generated_on) {
          if (!filters.generated_on.$lte) {
            delete filters.generated_on.$lte
          }
          if (!filters.generated_on.$gte) {
            delete filters.generated_on.$gte
          }
        }
        set({ filters })
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
      const { bills } = get()
      const newBill = await billService.createBill(data)
      if (newBill) {
        set({
          bills: [newBill, ...bills],
          invoiceNo: data.saveAsDraft ? get().invoiceNo : (newBill.invoiceNo || get().invoiceNo)
        })
        handleSuccess(data.saveAsDraft ? "Draft Saved Successfully" : "Invoice Created Succesfully")
        return newBill
      }
    } catch (error) {
      handleInternalError(error)
    } finally {
      set({ createLoading: false })
    }
  },
  finalizeBill: async (id, data) => {
    try {
      set({ createLoading: true });
      if (!id || !data) throw new Error("Bad Data");
      const { bills } = get();
      const finalizedBill = await billService.finalizeBill(id, data);
      if (finalizedBill) {
        const updatedBills = bills.map(item =>
          item._id === finalizedBill._id ? finalizedBill : item
        );
        set({
          bills: updatedBills,
          invoiceNo: finalizedBill.invoiceNo || get().invoiceNo
        });
        handleSuccess("Draft Finalized Successfully");
        return finalizedBill;
      }
    } catch (error) {
      handleInternalError(error);
    } finally {
      set({ createLoading: false });
    }
  },
  getInvoiceNo: async () => {
    try {
      set({ loading: true })
      const invoiceDoc = await billService.getInvoiceNumber()
      if (invoiceDoc && invoiceDoc.invoiceNo) {
        set({
          invoiceNo: invoiceDoc.invoiceNo,
          center_initial: ''
        })
        return {
          invoiceNo: invoiceDoc.invoiceNo,
          currentFY: invoiceDoc.currentFY,
        }
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