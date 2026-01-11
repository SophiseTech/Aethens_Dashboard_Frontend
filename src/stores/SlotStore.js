import slotService from "@/services/Slot"
import handleError from "@utils/handleError"
import handleInternalError from "@utils/handleInternalError"
import handleSuccess from "@utils/handleSuccess"
import _ from "lodash"
import { create } from "zustand"

const slotStore = create((set, get) => ({
  slots: [],
  loading: true,
  lastRefKey: 0,
  total: 0,
  completedCount: 0,
  filters: {},
  reschedulingSlot: {},
  slotRequests: [],
  requestLoading: true,
  slotStats: { totalCounts: {}, monthlyStats: [] },
  createLoading: false,
  getSlots: async (
    // start_date = new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    // end_date = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
    limit = 10,
    filters,
  ) => {
    try {
      set({ loading: true })
      const { lastRefKey, slots: prevSlots, filters: stateFilters } = get()
      const { slots, total } = await slotService.getSlots(
        filters,
        _.isEqual(stateFilters.query, filters.query) ? lastRefKey : 0,
        limit
      )
      if (slots) {
        set({
          slots: _.isEqual(stateFilters.query, filters.query) ? [...prevSlots, ...slots] : slots,
          lastRefKey: lastRefKey + slots.length,
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
  getCompletedCount: async (
    filters = {},
  ) => {
    try {
      set({ loading: true })
      const { count } = await slotService.getCompletedCount(filters)
      if (count) {
        set({ completedCount: count })
      }
    } catch (error) {
      handleInternalError(error)
    } finally {
      set({ loading: false })
    }
  },
  reshceduleSlot: async (data) => {
    try {
      set({ loading: true })
      const { slots } = get()
      const slotRequest = await slotService.rescheduleSlot(data)
      if (slotRequest) {
        const updatedSlots = slots.map(slot => slot._id === slotRequest.current_slot ? { ...slot, status: "requested" } : slot)
        set({ slots: updatedSlots })
      }
    } catch (error) {
      handleInternalError(error)
    } finally {
      set({ loading: false })
    }
  },
  setReschedulingSlot: (slot) => set({ reschedulingSlot: slot }),
  getSlotRequests: async (limit = 10, filters = {}) => {
    try {
      set({ requestLoading: true })
      const { lastRefKey, slotRequests: prevSlotRequests } = get()
      const { requests, total } = await slotService.getSlotRequests(
        filters,
        lastRefKey,
        limit
      )
      if (requests) {
        set({
          slotRequests: [...prevSlotRequests, ...requests],
          lastRefKey: lastRefKey + requests.length,
          total: total
        })
      }
    } catch (error) {
      handleInternalError(error)
    } finally {
      set({ requestLoading: false })
    }
  },
  approveSlotRequest: async (id) => {
    try {
      set({ createLoading: true })
      if (!id) throw new Error("Bad Data")
      const { slotRequests } = get()
      const { request } = await slotService.approveSlot(id)
      if (request) {
        const updatedSlotRequests = slotRequests.filter(request => request._id !== id)
        set({ slotRequests: updatedSlotRequests })
        handleSuccess("Slot Request Approved Successfully")
        return request
      }
    } catch (error) {
      handleError(error)
    } finally {
      set({ createLoading: false })
    }
  },
  rejectSlotRequest: async (id) => {
    try {
      set({ createLoading: true })
      if (!id) throw new Error("Bad Data")
      const { slotRequests } = get()
      const rejectedRequest = await slotService.rejectSlot(id)
      if (rejectedRequest) {
        const updatedSlotRequests = slotRequests.filter(request => request._id !== id)
        set({ slotRequests: updatedSlotRequests })
        handleSuccess("Slot Request Rejected Successfully")
        return rejectedRequest
      }
    } catch (error) {
      handleInternalError(error)
    } finally {
      set({ createLoading: false })
    }
  },
  getSlotStats: async (user_id, course_id) => {
    try {
      set({ createLoading: true })
      const stats = await slotService.slotStats(user_id, course_id)
      if (stats) {
        set({ slotStats: stats })
        return stats
      }
    } catch (error) {
      handleInternalError(error)
    } finally {
      set({ createLoading: false })
    }
  },
  markAbsent: async (slotId, status) => {
    try {
      set({ createLoading: true })
      const stats = await slotService.updateSlotStatus(slotId, status)
      if (stats) {
        const { slots } = get()
        const updatedSlots = slots.map(slot => slot._id === slotId ? { ...slot, status: "cancelled" } : slot)
        set({ slots: updatedSlots })
        handleSuccess("Slot Marked Absent Successfully")
        return stats
      }
    } catch (error) {
      handleInternalError(error)
    } finally {
      set({ createLoading: false })
    }
  },
}))

export default slotStore