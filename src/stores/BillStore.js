
import billService from "@/services/Bills"
import userStore from "@stores/UserStore"
import handleInternalError from "@utils/handleInternalError"
import handleSuccess from "@utils/handleSuccess"
import _ from "lodash"
import { create } from "zustand"
import centersStore from "./CentersStore"

// Keeps a deep-linked `selectedBill` (one not in the paginated `bills` slice) in step
// with mutations. Returns a partial `set` payload — `{}` when nothing to sync.
const syncSelectedBill = (get, updatedBill) =>
  get().selectedBill?._id === updatedBill?._id ? { selectedBill: updatedBill } : {}

const billStore = create((set, get) => ({
  bills: [],
  selectedBill: null,
  selectedBillLoading: false,
  loading: true,
  createLoading: false,
  invoiceLoading: false,
  lastRefKey: 0,
  total: 0,
  filters: {},
  invoiceNo: 0,
  center_initial: '',
  summary: {},
  zohoOrgConfig: null,
  getBills: async (limit = 2, customFilters = {}) => {
    try {
      set({ loading: true })
      const { lastRefKey, bills: prevBills, filters: stateFilters } = get()

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
        // `populate` is a request concern, not a filter — keep it out of persisted state
        // so `_.isEqual(stateFilters.query, customFilters.query)` paging checks stay clean.
        const { populate, ...persistableFilters } = { ...stateFilters, ...customFilters }
        const filters = _.cloneDeep(persistableFilters)
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
          item._id === bill._id ? bill : item
        ))
        set({ bills: updatedBills, ...syncSelectedBill(get, bill) })
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
        const clearSelected = get().selectedBill?._id === id ? { selectedBill: null } : {}
        set({ bills: updatedBills, ...clearSelected })
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
          invoiceNo: finalizedBill.invoiceNo || get().invoiceNo,
          ...syncSelectedBill(get, finalizedBill)
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
  getZohoOrgConfig: async () => {
    try {
      const { zohoOrgConfig } = get()
      if (zohoOrgConfig) return zohoOrgConfig
      const config = await billService.getZohoConfig()
      if (config) set({ zohoOrgConfig: config })
      return config
    } catch (error) {
      handleInternalError(error)
    }
  },
  resyncZoho: async (id) => {
    try {
      set({ createLoading: true })
      if (!id) throw new Error("Bad Data")
      const { bills } = get()
      const bill = await billService.resyncBillZoho(id)
      if (bill) {
        const updatedBills = bills.map(item => (
          item._id === bill._id ? bill : item
        ))
        set({ bills: updatedBills, ...syncSelectedBill(get, bill) })
        if (bill.zoho?.syncStatus === "synced") {
          handleSuccess("Bill synced to Zoho successfully")
        } else {
          handleInternalError(new Error(bill.zoho?.errorMessage || "Zoho sync failed again"))
        }
      }
    } catch (error) {
      handleInternalError(error)
    } finally {
      set({ createLoading: false })
    }
  },
  getInvoiceNo: async () => {
    try {
      // Own flag — must not toggle the bills-list `loading` and flash a spinner over it.
      set({ invoiceLoading: true })
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
      set({ invoiceLoading: false })
    }
  },
  getBillById: async (id) => {
    try {
      if (!id) return
      set({ selectedBillLoading: true })
      const bill = await billService.getBillById(id)
      // Only touch `selectedBill` — never `bills` / `lastRefKey` / `total` / `filters`,
      // so the paginated list is left exactly as the user loaded it.
      if (bill) set({ selectedBill: bill })
      return bill
    } catch (error) {
      handleInternalError(error)
    } finally {
      set({ selectedBillLoading: false })
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