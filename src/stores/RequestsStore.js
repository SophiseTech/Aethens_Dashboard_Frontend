
import requestService from "@/services/Requests"
import userStore from "@stores/UserStore"
import handleInternalError from "@utils/handleInternalError"
import handleSuccess from "@utils/handleSuccess"
import _ from "lodash"
import { create } from "zustand"

const requestsStore = create((set, get) => ({
  requests: [],
  loading: true,
  createLoading: false,
  lastRefKey: 0,
  total: 0,
  filters: {},
  getRequests: async (limit = 10, filters = {}) => {
    try {
      set({ loading: true })
      const { lastRefKey, requests: prevRequests, filters: stateFilters } = get()
      const { requests, total } = await requestService.getRequests(
        filters,
        // lastref key should be zero if new filters are applied so that new data wont get skipped
        _.isEqual(stateFilters.query, filters.query) ? lastRefKey : 0,
        limit
      )
      if (requests) {
        set({
          requests: _.isEqual(stateFilters.query, filters.query) ? [...prevRequests, ...requests] : requests,
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
  editRequest: async (id, updateData) => {
    try {
      set({ createLoading: true })
      if (!id || !updateData) throw new Error("Bad Data")
      const { requests } = get()
      const request = await requestService.editRequest(id, updateData)
      if (request && requests) {
        const updatedRequests = requests.map(item => (
          item._id === request._id ? { ...item, ...updateData } : item
        ))
        set({ requests: updatedRequests })
        handleSuccess("Request Updated Succesfully")
      }
    } catch (error) {
      handleInternalError(error)
    } finally {
      set({ createLoading: false })
    }
  },
  deleteRequest: async (id) => {
    try {
      set({ createLoading: true })
      if (!id) throw new Error("Bad Data")
      const { requests } = get()
      await requestService.deleteRequest(id)
      if (requests) {
        const updatedRequests = requests.filter(request => request._id !== id)
        set({ requests: updatedRequests })
        handleSuccess("Request Deleted Succesfully")
      }
    } catch (error) {
      handleInternalError(error)
    } finally {
      set({ createLoading: false })
    }
  },
  createRequest: async (data) => {
    try {
      set({ createLoading: true })
      if (!data) throw new Error("Bad Data")
      const { requests, invoiceNo } = get()
      const newRequest = await requestService.createRequest(data)
      // if (newRequest) {
      //   const updatedRequests = [newRequest, ...requests]
      //   set({ requests: updatedRequests })
      // }
      handleSuccess("Request Created Succesfully")
      return newRequest
    } catch (error) {
      handleInternalError(error)
    } finally {
      set({ createLoading: false })
    }
  },
  approveRequest: async (id) => {
    try {
      set({ createLoading: true })
      if (!id) throw new Error("Bad Data")
      const { requests } = get()
      const approvedRequest = await requestService.approveRequest(id)
      if (approvedRequest) {
        const updatedRequests = requests.filter(request => request._id !== id)
        set({ requests: updatedRequests })
        handleSuccess("Request Approved Succesfully")
        return approvedRequest
      }
    } catch (error) {
      handleInternalError(error)
    } finally {
      set({ createLoading: false })
    }
  },
  rejectRequest: async (id) => {
    try {
      set({ createLoading: true })
      if (!id) throw new Error("Bad Data")
      const { requests } = get()
      const approvedRequest = await requestService.editRequest(id, { status: "rejected" })
      if (approvedRequest) {
        const updatedRequests = requests.filter(request => request._id !== id)
        set({ requests: updatedRequests })
        handleSuccess("Request rejected Succesfully")
        return approvedRequest
      }
    } catch (error) {
      handleInternalError(error)
    } finally {
      set({ createLoading: false })
    }
  },

}))

export default requestsStore