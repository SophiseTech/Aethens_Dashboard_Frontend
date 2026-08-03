import inventoryTransactionsService from "@/services/InventoryTransactions"
import handleInternalError from "@utils/handleInternalError"
import { create } from "zustand"

const inventoryTransactionsStore = create((set) => ({
  transactions: [],
  loading: true,
  total: 0,
  getTransactions: async (page = 1, pageSize = 12, filters = {}) => {
    try {
      set({ loading: true })
      const lastRefKey = (page - 1) * pageSize
      const { transactions, total } = await inventoryTransactionsService.getTransactions(filters, lastRefKey, pageSize)
      set({ transactions: transactions || [], total: total || 0 })
    } catch (error) {
      handleInternalError(error)
    } finally {
      set({ loading: false })
    }
  },
}))

export default inventoryTransactionsStore
