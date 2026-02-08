import handleError from "@utils/handleError";
import { get, post, patch } from "@utils/Requests";

class LeaveService {
    /**
   * Get leaves for current user (faculty) or all leaves (admin)
   * @param {Object} filters - Optional filters for admin (centerId, facultyId, status, leaveType)
   * @returns {Promise<Array>} Array of leave records
   */
    async getLeaves(filters = {}) {
        try {
            // Build query string from filters
            const params = new URLSearchParams();

            if (filters.centerId) params.append('centerId', filters.centerId);
            if (filters.facultyId) params.append('facultyId', filters.facultyId);
            if (filters.status) params.append('status', filters.status);
            if (filters.leaveType) params.append('leaveType', filters.leaveType);

            const queryString = params.toString();
            const endpoint = queryString ? `/v2/leave/faculty?${queryString}` : '/v2/leave/faculty';

            const response = await get(endpoint);
            return response?.data || [];
        } catch (error) {
            handleError(error);
            throw error;
        }
    }

    /**
     * Apply for a new leave
     * @param {Object} leaveData - Leave application data
     * @param {string} leaveData.fromDate - Start date (YYYY-MM-DD)
     * @param {string} leaveData.toDate - End date (YYYY-MM-DD)
     * @param {string} leaveData.leaveType - CASUAL | SICK | PERMISSION
     * @param {string} leaveData.reason - Reason for leave
     * @returns {Promise} Created leave record
     */
    async applyLeave(leaveData) {
        try {
            const { fromDate, toDate, leaveType, reason } = leaveData;

            if (!fromDate || !toDate || !leaveType) {
                throw new Error("Please fill all required fields");
            }

            const response = await post("/v2/leave/apply", {
                fromDate,
                toDate,
                leaveType,
                reason
            });

            if (!response || !response.data) throw new Error("An error occurred. Please try again");
            return response.data;
        } catch (error) {
            handleError(error);
            throw error;
        }
    }

    /**
     * Approve a leave application (admin only)
     * @param {string} leaveId - ID of the leave to approve
     * @returns {Promise} Updated leave record
     */
    async approveLeave(leaveId) {
        try {
            if (!leaveId) throw new Error("Leave ID is required");

            const response = await patch(`/v2/leave/${leaveId}/approve`);
            if (!response || !response.data) throw new Error("An error occurred. Please try again");
            return response.data;
        } catch (error) {
            handleError(error);
            throw error;
        }
    }

    /**
     * Reject a leave application (admin only)
     * @param {string} leaveId - ID of the leave to reject
     * @returns {Promise} Updated leave record
     */
    async rejectLeave(leaveId) {
        try {
            if (!leaveId) throw new Error("Leave ID is required");

            const response = await patch(`/v2/leave/${leaveId}/reject`);
            if (!response || !response.data) throw new Error("An error occurred. Please try again");
            return response.data;
        } catch (error) {
            handleError(error);
            throw error;
        }
    }

    /**
     * Calculate number of days between two dates
     * @param {Date|string} fromDate 
     * @param {Date|string} toDate 
     * @returns {number} Number of days
     */
    calculateDays(fromDate, toDate) {
        const start = new Date(fromDate);
        const end = new Date(toDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both dates
        return diffDays;
    }
}

const leaveService = new LeaveService();
export default leaveService;
