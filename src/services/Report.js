import handleError from "@utils/handleError"
import { post } from "@utils/Requests"

class ReportService {
  async downloadFinancialAuditReport({ month, year, centerId }) {
    try {
      const response = await post('/v2/reports/financial/audit-report/download', {
        filters: { query: { month, year, center_id: centerId } }
      }, { responseType: 'blob' })
      if (!response) throw new Error("An error occured. Please try again")

      return response
    } catch (error) {
      handleError(error)
    }
  }

  async getDeactivatedStudentsReport({ startDate, endDate, centerId }) {
    try {
      const response = await post('/v2/reports/students/deactivated', {
        filters: { query: { startDate, endDate, center_id: centerId } }
      })
      if (!response || !response.data) throw new Error("An error occured. Please try again")

      return response.data
    } catch (error) {
      handleError(error)
    }
  }

  async downloadDeactivatedStudentsReport({ startDate, endDate, centerId }) {
    try {
      const response = await post('/v2/reports/students/deactivated/download', {
        filters: { query: { startDate, endDate, center_id: centerId } }
      }, { responseType: 'blob' })
      if (!response) throw new Error("An error occured. Please try again")

      return response
    } catch (error) {
      handleError(error)
    }
  }
}

const reportService = new ReportService()
export default reportService
