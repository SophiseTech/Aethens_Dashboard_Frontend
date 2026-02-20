import handleError from "@utils/handleError";
import { get } from "@utils/Requests";

class AttendanceService {
    /**
     * Get daily swipes and attendance summary for a specific date
     * @param {string} date - Date in format YYYY-MM-DD (e.g., "2026-02-02")
     * @param {string} facultyId - Optional faculty ID (admin use), defaults to logged-in user
     * @returns {Promise} Daily swipes data with summary
     */
    async getDailySwipes(date, facultyId = null) {
        try {
            if (!date) throw new Error("Date is required");

            const params = new URLSearchParams({ date });
            if (facultyId) {
                params.append('facultyId', facultyId);
            }

            const response = await get(`/attendance/day?${params.toString()}`);
            if (!response || !response.data) throw new Error("An error occurred. Please try again");
            return response.data;
        } catch (error) {
            handleError(error);
        }
    }

    /**
     * Get monthly attendance summary with statistics
     * @param {string} month - Month in format YYYY-MM (e.g., "2026-02")
     * @param {string} facultyId - Optional faculty ID (admin use), defaults to logged-in user
     * @returns {Promise} Monthly attendance data with records and stats
     */
    async getMonthlyAttendance(month, facultyId = null) {
        try {
            if (!month) throw new Error("Month is required (format: YYYY-MM)");

            const params = new URLSearchParams({ month });
            if (facultyId) {
                params.append('facultyId', facultyId);
            }

            const response = await get(`/attendance/month?${params.toString()}`);
            if (!response || !response.data) throw new Error("An error occurred. Please try again");
            return response.data;
        } catch (error) {
            handleError(error);
        }
    }

    /**
     * Get current month attendance (helper method)
     * @param {string} facultyId - Optional faculty ID
     * @returns {Promise} Current month attendance data
     */
    async getCurrentMonthAttendance(facultyId = null) {
        try {
            const now = new Date();
            const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            return await this.getMonthlyAttendance(month, facultyId);
        } catch (error) {
            handleError(error);
        }
    }

    /**
     * Get today's swipes (helper method)
     * @param {string} facultyId - Optional faculty ID
     * @returns {Promise} Today's attendance data
     */
    async getTodaySwipes(facultyId = null) {
        try {
            const now = new Date();
            const date = now.toISOString().split('T')[0]; // YYYY-MM-DD
            return await this.getDailySwipes(date, facultyId);
        } catch (error) {
            handleError(error);
        }
    }
}

const attendanceService = new AttendanceService();
export default attendanceService;
