
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
  selectedCenter: null,
  setSelectedCenter: (center_id) => {
    if(center_id === null){
      return;
    }
    set({ selectedCenter: center_id});
  },
  getCenters: async (limit = 2, filters = {}) => {
    try {
      set({ loading: true })
      const { lastRefKey, centers: prevCenters } = get()
      const { centers, total } = await centersService.getCenters(
        filters,
        // lastref key should be zero if new filters are applied so that new data wont get skipped
        lastRefKey,
        limit
      )
      if (centers) {
        set({
          centers: [...prevCenters, ...centers],
          lastRefKey: lastRefKey + centers.length,
          total: total
        })
      }
    } catch (error) {
      handleInternalError(error)
    } finally {
      set({ loading: false })
    }
  }
}))

export default centersStore