import handleError from "@utils/handleError"
import { post } from "@utils/Requests"

class AttendanceService {
  async getHistory(query = {}, recordQuery = {}, lastRef = 0, limit = 10) {
    try {
      const response = await post(`/attendance/get?lastRef=${lastRef}&limit=${limit}`, { query, recordQuery })
      if (!response || !response.data) throw new Error("An error occured. Please try again")
      return response.data
    } catch (error) {
      handleError(error)
    }
  }

  async getSummary(filter = {}, recordFilter = {}) {
    try {
      const response = await post(`/attendance/summary`, { filter, recordFilter })
      if (!response || !response.data) throw new Error("An error occured. Please try again")
      return response.data
    } catch (error) {
      handleError(error)
    }
  }

  async markAttendance(admissionNumber) {
    try {
      const response = await post(`/attendance/markAttendance`, { admissionNumber })
      if (!response) throw new Error("An error occured. Please try again")
    } catch (error) {
      handleError(error)
    }
  }

  async markFacultyAttendance(email) {
    try {
      const response = await post(`/attendance/markFacultyAttendance`, { email })
      if (!response) throw new Error("An error occured. Please try again")
      return response?.message
    } catch (error) {
      handleError(error)
    }
  }

}

const attendanceService = new AttendanceService()
export default attendanceService

const dummyRecords = [
  {
    date: new Date("2025-01-01T08:00:00.000Z"),
    status: "present",
  },
  {
    date: new Date("2025-01-02T08:00:00.000Z"),
    status: "absent",
  },
  {
    date: new Date("2025-01-03T08:00:00.000Z"),
    status: "excused",
  },
  {
    date: new Date("2025-01-04T08:00:00.000Z"),
    status: "present",
  },
  {
    date: new Date("2025-01-05T08:00:00.000Z"),
    status: "absent",
  },
  {
    date: new Date("2025-01-06T08:00:00.000Z"),
    status: "absent",
  },
];