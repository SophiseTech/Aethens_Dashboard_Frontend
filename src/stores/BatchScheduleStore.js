import batchScheduleService from "@/services/BatchSchedule"
import handleInternalError from "@utils/handleInternalError"
import { create } from "zustand"

const batchScheduleStore = create((set, get) => ({
  batchSchedules: [],
  loading: true,
  createLoading: false,

  getByBatch: async (batchId) => {
    try {
      set({ loading: true })
      const batchSchedules = await batchScheduleService.listByBatch(batchId)
      set({ batchSchedules: batchSchedules || [] })
    } catch (error) {
      handleInternalError(error)
    } finally {
      set({ loading: false })
    }
  },

  create: async (data) => {
    try {
      set({ createLoading: true })
      const response = await batchScheduleService.create(data)
      if (response && data.diplomaBatch_id) {
        await get().getByBatch(data.diplomaBatch_id)
      }
      return response
    } catch (error) {
      handleInternalError(error)
      throw error
    } finally {
      set({ createLoading: false })
    }
  },

  update: async (id, data, batchId) => {
    try {
      set({ loading: true })
      const response = await batchScheduleService.update(id, data)
      if (response && batchId) {
        await get().getByBatch(batchId)
      }
      return response
    } catch (error) {
      handleInternalError(error)
      throw error
    } finally {
      set({ loading: false })
    }
  },

  generateSlots: async (id, dateRange) => {
    try {
      set({ loading: true })
      return await batchScheduleService.generateSlots(id, dateRange)
    } catch (error) {
      handleInternalError(error)
      throw error
    } finally {
      set({ loading: false })
    }
  },
}))

export default batchScheduleStore
