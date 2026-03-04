
import centersService from "@/services/Centers"
import handleInternalError from "@utils/handleInternalError"
import _ from "lodash"
import { create } from "zustand"

const centersStore = create((set, get) => ({
  centers: [],
  loading: true,
  createLoading: false,
  lastRefKey: 0,
  total: 0,
  selectedCenter: "all",
  setSelectedCenter: (center_id) => {
    set({ selectedCenter: center_id});
  },
  resetCenters: () => {
    set({ centers: [], lastRefKey: 0, total: 0 });
  },
  getCenters: async (limit = 2, filters = {}) => {
    try {
      set({ loading: true })
      const { lastRefKey, centers: prevCenters, total: prevTotal } = get()
      const normalizedLimit = Number(limit)
      const fetchAll = !Number.isFinite(normalizedLimit) || normalizedLimit <= 0
      const hasFilters = Boolean(filters && Object.keys(filters).length)

      // Skip pagination fetch if all centers are already loaded.
      if (!fetchAll && !hasFilters && prevTotal > 0 && prevCenters.length >= prevTotal) {
        return
      }

      const requestLastRef = fetchAll ? 0 : lastRefKey
      const requestLimit = fetchAll ? 0 : normalizedLimit
      const response = await centersService.getCenters(
        filters,
        // lastref key should be zero if new filters are applied so that new data wont get skipped
        requestLastRef,
        requestLimit
      )

      const fetchedCenters = response?.centers || []
      const total = response?.total || 0
      const mergedCenters = fetchAll ? fetchedCenters : [...prevCenters, ...fetchedCenters]
      const uniqueCenters = _.uniqBy(mergedCenters, "_id")

      set({
        centers: uniqueCenters,
        lastRefKey: fetchAll ? uniqueCenters.length : requestLastRef + fetchedCenters.length,
        total
      })
    } catch (error) {
      handleInternalError(error)
    } finally {
      set({ loading: false })
    }
  }
}))

export default centersStore
