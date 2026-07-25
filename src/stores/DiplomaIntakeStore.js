import diplomaIntakeService from "@/services/DiplomaIntake"
import handleInternalError from "@utils/handleInternalError"
import { create } from "zustand"

const diplomaIntakeStore = create((set, get) => ({
  intakes: [],
  loading: true,
  createLoading: false,
  total: 0,

  getIntakesForAdmin: async (limit = 10, page = 1) => {
    try {
      set({ loading: true })
      const { intakes, total } = await diplomaIntakeService.listIntakes({ page, limit })
      if (intakes) {
        set({ intakes, total })
      }
    } catch (error) {
      handleInternalError(error)
    } finally {
      set({ loading: false })
    }
  },

  createIntake: async (intakeData) => {
    try {
      set({ createLoading: true })
      const response = await diplomaIntakeService.createIntake(intakeData)
      if (response) {
        await get().getIntakesForAdmin(10, 1)
      }
      return response
    } catch (error) {
      handleInternalError(error)
      throw error
    } finally {
      set({ createLoading: false })
    }
  },

  updateIntake: async (intakeId, intakeData) => {
    try {
      set({ loading: true })
      const response = await diplomaIntakeService.updateIntake(intakeId, intakeData)
      if (response) {
        await get().getIntakesForAdmin(10, 1)
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

export default diplomaIntakeStore
