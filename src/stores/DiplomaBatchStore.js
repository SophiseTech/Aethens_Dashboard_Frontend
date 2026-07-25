import diplomaBatchService from "@/services/DiplomaBatch"
import handleInternalError from "@utils/handleInternalError"
import { create } from "zustand"

const diplomaBatchStore = create((set, get) => ({
  batches: [],
  loading: true,
  createLoading: false,
  total: 0,

  getBatchesForAdmin: async (limit = 10, page = 1) => {
    try {
      set({ loading: true })
      const { batches, total } = await diplomaBatchService.listBatches({ page, limit })
      if (batches) {
        set({ batches, total })
      }
    } catch (error) {
      handleInternalError(error)
    } finally {
      set({ loading: false })
    }
  },

  createBatch: async (batchData) => {
    try {
      set({ createLoading: true })
      const response = await diplomaBatchService.createBatch(batchData)
      if (response) {
        await get().getBatchesForAdmin(10, 1)
      }
      return response
    } catch (error) {
      handleInternalError(error)
      throw error
    } finally {
      set({ createLoading: false })
    }
  },

  updateBatch: async (batchId, batchData) => {
    try {
      set({ loading: true })
      const response = await diplomaBatchService.updateBatch(batchId, batchData)
      if (response) {
        await get().getBatchesForAdmin(10, 1)
      }
      return response
    } catch (error) {
      handleInternalError(error)
      throw error
    } finally {
      set({ loading: false })
    }
  },
}))

export default diplomaBatchStore
