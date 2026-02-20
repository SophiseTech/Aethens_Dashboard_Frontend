import centersStore from "@stores/CentersStore";
import userStore from "@stores/UserStore"
import { ROLES } from "@utils/constants";
import handleError from "@utils/handleError"
import { get, post } from "@utils/Requests"

class AttendanceService {

  constructPath(path, centerVariable) {
    const { user } = userStore.getState();
    const { selectedCenter } = centersStore.getState();

    if (user.role === 'admin' && selectedCenter) {
      return `${path}?${centerVariable}=${selectedCenter}&`
    } else if (user.role === ROLES.MANAGER) {
      return `${path}?${centerVariable}=${user.center_id}&`
    }
    else {
      return `${path}?`;
    }
  }

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

  async getGraphSummary(center_id, startDate, endDate) {
    try {
      const path = this.constructPath("/open/attendance-summary", "center_id");
      const response = await get(`${path}startDate=${startDate}&endDate=${endDate}`)
      if (!response) throw new Error("An error occured. Please try again")
      return response?.report
    } catch (error) {
      handleError(error)
    }
  }

  async getAttendanceRegister({ center_id, course_id, month, year, page, limit }) {
    try {
      const response = await post('/attendance/register', {
        center_id,
        course_id,
        month,
        year,
        page,
        limit
      })
      if (!response) throw new Error("An error occured. Please try again")
      return response?.data
    } catch (error) {
      handleError(error)
    }
  }

}

const attendanceService = new AttendanceService()
export default attendanceService