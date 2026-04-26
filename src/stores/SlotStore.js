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
  requestLastRefKey: 0,
  slotStats: { totalCounts: {}, monthlyStats: [] },
  createLoading: false,
  getSlots: async (
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
      const { requestLastRefKey, slotRequests: prevSlotRequests } = get()
      const { requests, total } = await slotService.getSlotRequests(
        filters,
        requestLastRefKey,
        limit
      )
      if (requests) {
        set({
          slotRequests: [...prevSlotRequests, ...requests],
          requestLastRefKey: requestLastRefKey + requests.length,
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
        const updatedSlots = slots.map(slot => slot._id === slotId ? { ...slot, status: "absent" } : slot)
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
  requestAdditionalSession: async (requested_slot) => {
    try {
      set({ createLoading: true })
      if (!requested_slot?.date || !requested_slot?.session) throw new Error("Bad Data")

      const { slots } = get()
      const response = await slotService.requestAdditionalSession({ requested_slot })
      const slot = response?.slot
      const request = response?.request
      const autoApproved = Boolean(response?.auto_approved)

      if (slot) {
        set({ slots: [slot, ...slots] })
        handleSuccess("Additional session request auto-approved")
        return { slot, request, auto_approved: autoApproved }
      }
      if (request) {
        handleSuccess("Additional session request submitted for approval")
        return { request, auto_approved: autoApproved }
      }
    } catch (error) {
      handleError(error)
    } finally {
      set({ createLoading: false })
    }
  },
}))

export default slotStore
