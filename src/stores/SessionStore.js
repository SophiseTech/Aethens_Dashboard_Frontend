
import sessionService from "@/services/Session"
import slotStore from "@stores/SlotStore"
import handleInternalError from "@utils/handleInternalError"
import handleSuccess from "@utils/handleSuccess"
import { notification } from "antd"
import { create } from "zustand"

const SessionStore = create((set, get) => ({
  availableSessions: [],
  loading: false,
  sessions: [],
  getAllSessions: async (date) => {
    try {
      set({ loading: true })
      const data = await sessionService.getAllSessions(date)
      set({ sessions: data })
      return data
    } catch (error) {
      handleInternalError(error)
    } finally {
      set({ loading: false })
    }
  },
  getAvailableSessions: async (date) => {
    try {
      set({ loading: true })
      const { data } = await sessionService.getAvailableSessionByDate(date)
      set({ availableSessions: data })
    } catch (error) {
      handleInternalError(error)
    } finally {
      set({ loading: false })
    }
  },
  bookSession: async (data) => {
    try {
      set({ loading: true })
      console.log(data);

      if (!data || !data.sessions) throw new Error("Bad Data")
      const slots = await sessionService.bookSession(data)
      const { slots: prevSlots } = slotStore.getState()
      slotStore.setState({ slots: [...prevSlots, ...slots] })
      handleSuccess("Slot(s) booked succesfully.")
    } catch (error) {
      handleInternalError(error)
    } finally {
      set({ loading: false })
    }
  },
  bookAdditionalSession: async (data) => {
    try {
      set({ loading: true })
      console.log(data);

      if (!data || !data.sessions) throw new Error("Bad Data")
      const slot = await sessionService.bookAdditionalSession(data)
      const { slots: prevSlots } = slotStore.getState()
      slotStore.setState({ slots: [...prevSlots, slot] })
      handleSuccess("Slot(s) booked succesfully.")
    } catch (error) {
      handleInternalError(error)
    } finally {
      set({ loading: false })
    }
  }
}))

export default SessionStore