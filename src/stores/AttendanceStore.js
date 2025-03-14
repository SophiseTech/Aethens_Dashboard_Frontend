import attendanceService from "@/services/Attendance"
import handleInternalError from "@utils/handleInternalError"
import handleSuccess from "@utils/handleSuccess"
import { create } from "zustand"

const attendanceStore = create((set, get) => ({
  records: [],
  lastRefKey: 0,
  total: 0,
  loading: true,
  submitLoading: false,
  summary: {},
  getHistory: async (query, recordQuery, limit = 10) => {
    set({ loading: true })
    const { lastRefKey, total, records: prevRecords } = get()
    const { record, total: totalCount } = await attendanceService.getHistory(query, recordQuery, lastRefKey, limit)
    if (record.attendance_record) {
      set({
        lastRefKey: lastRefKey + record.attendance_record.length,
        total: totalCount,
        records: lastRefKey > 0 ? [...prevRecords, ...record.attendance_record] : record.attendance_record,
        loading: false
      })
    }
  },
  getSummary: async (filter, recordFilter) => {
    try {
      set({ loading: true })
      const data = await attendanceService.getSummary(filter, recordFilter)
      set({
        summary: data
      })
    } catch (error) {
      handleInternalError(error)
    } finally {
      set({ loading: false })
    }
  },
  markAttendance: async (admissionNumber) => {
    try {
      set({ submitLoading: true })
      const data = await attendanceService.markAttendance(admissionNumber)
      handleSuccess("Attendance marked Succesfully!")
    } catch (error) {
      handleInternalError(error)
    } finally {
      set({ submitLoading: false })
    }
  },
  markFacultyAttendance: async (email) => {
    try {
      set({ submitLoading: true })
      const message = await attendanceService.markFacultyAttendance(email)
      handleSuccess(message)
    } catch (error) {
      handleInternalError(error)
    } finally {
      set({ submitLoading: false })
    }
  },
}))

export default attendanceStore