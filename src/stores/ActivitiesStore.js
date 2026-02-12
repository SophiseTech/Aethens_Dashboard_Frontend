import activitiesService from "@/services/Activiies"
import handleInternalError from "@utils/handleInternalError"
import handleSuccess from "@utils/handleSuccess"
import _ from "lodash"
import { create } from "zustand"

const activitiesStore = create((set, get) => ({
  activities: [],
  lastRefKey: 0,
  total: 0,
  loading: true,
  createLoading: false,
  filters: {},
  getActivities: async (limit = 10, filters) => {
    try {
      set({ loading: true })
      const { lastRefKey, activities: prevActivities, filters: stateFilters } = get()
      const { activities, total } = await activitiesService.getActivities(
        filters,
        _.isEqual(stateFilters.query, filters.query) ? lastRefKey : 0,
        limit)
      if (activities) {
        set({
          lastRefKey: lastRefKey + activities.length,
          total: total,
          activities: _.isEqual(stateFilters.query, filters.query) ? [...prevActivities, ...activities] : activities,
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
  createActivity: async (data) => {
    try {
      set({ createLoading: true })
      if (!data) throw new Error("Bad Data")
      const { activities } = get()
      const newActivity = await activitiesService.createActivity(data)
      if (newActivity) {
        const updatedBills = [newActivity, ...activities]
        set({ activities: updatedBills })
        handleSuccess("Activity Created Succesfully")
        return newActivity
      }
    } catch (error) {
      handleInternalError(error)
    } finally {
      set({ createLoading: false })
    }
  },
  deleteActivity: async (id) => {
    try {
      set({ createLoading: true })
      if (!id) throw new Error("Bad Data")
      const { activities } = get()
      await activitiesService.deleteActivity(id)
      if (activities) {
        const updatedActivity = activities.filter(activity => activity._id !== id)
        set({ activities: updatedActivity })
        handleSuccess("Activity Deleted Succesfully")
      }
    } catch (error) {
      handleInternalError(error)
    } finally {
      set({ createLoading: false })
    }
  }
}))

export default activitiesStore