import handleError from "@utils/handleError";
import { del, get, post, put } from "@utils/Requests";

class HolidayService {
  async createHoliday({
    centerId,
    title,
    isRecurring = true,
    startDate,
    endDate,
    status = "published"
  }) {
    try {
      // Validation
      if (!centerId) throw new Error("Center ID is required");
      if (!title || title.trim() === "") throw new Error("Title is required");
      if (!startDate || !endDate) throw new Error("Both dates are required");

      const payload = {
        centerId,
        title: title.trim(),
        isRecurring,
        startDate,
        endDate,
        status
      };

      const response = await post("/v2/holidays", payload);
      if (!response || !response.data) {
        throw new Error("Failed to create holiday");
      }
      return response;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  async fetchHolidays({
    skip = 0,
    limit = 10,
    centerId,
    status = null,
    isRecurring = null,
    startDate = null,
    endDate = null,
    search = null
  } = {}) {
    try {
      // Build query parameters
      const params = new URLSearchParams();
      params.append("skip", skip);
      params.append("limit", limit);

      if (centerId) params.append("centerId", centerId);
      if (status) params.append("status", status);
      if (isRecurring !== null) params.append("isRecurring", isRecurring);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      if (search) params.append("search", search);

      const response = await get(`/v2/holidays?${params.toString()}`);

      if (!response) {
        throw new Error("Failed to fetch holidays");
      }

      // API returns array directly, so we need to wrap it
      let holidays = [];
      let total = 0;

      if (Array.isArray(response.data)) {
        // If response.data is an array, use it directly
        holidays = response.data;
        total = holidays.length;
      } else if (response.data && response.data.holidays) {
        // If response.data has holidays property
        holidays = response.data.holidays;
        total = response.data.total || holidays.length;
      } else if (response.data) {
        // Fallback - treat as array if it's the whole response
        holidays = Array.isArray(response.data) ? response.data : [];
        total = holidays.length;
      }

      return { holidays, total };
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  async getHolidayById(holidayId) {
    try {
      if (!holidayId) throw new Error("Holiday ID is required");

      const response = await get(`/v2/holidays/${holidayId}`);
      if (!response || !response.data) {
        throw new Error("Failed to fetch holiday");
      }
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  async updateHoliday(holidayId, data) {
    try {
      if (!holidayId) throw new Error("Holiday ID is required");

      // Build update payload (only include fields that are provided)
      const payload = {};
      if (data.title !== undefined) payload.title = data.title.trim();
      if (data.isRecurring !== undefined) payload.isRecurring = data.isRecurring;
      if (data.startDate !== undefined) payload.startDate = data.startDate;
      if (data.endDate !== undefined) payload.endDate = data.endDate;
      if (data.status !== undefined) payload.status = data.status;

      const response = await put(`/v2/holidays/${holidayId}`, payload);
      if (!response || !response.data) {
        throw new Error("Failed to update holiday");
      }
      return response;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  async deleteHoliday(holidayId) {
    try {
      if (!holidayId) throw new Error("Holiday ID is required");

      const response = await del(`/v2/holidays/${holidayId}`);
      if (!response) {
        throw new Error("Failed to delete holiday");
      }
      return response;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }
}

export default new HolidayService();
