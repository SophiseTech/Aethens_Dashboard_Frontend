import handleError from "@utils/handleError"
import { del, post } from "@utils/Requests"

class SlotService {
  async getSlots(filters, lastRefKey, limit) {
    try {
      const response = await post(`/slots/getAll?lastRef=${lastRefKey}&limit=${limit}`, { filters })
      if (!response || !response.data) throw new Error("An error occured. Please try again")
      return response.data
    } catch (error) {
      handleError(error)
    }
  }

  async getCompletedCount(filters = {}) {
    try {
      const response = await post(`/slots/completedCount`, { filters })
      if (!response || !response.data) throw new Error("An error occured. Please try again")
      return response.data
    } catch (error) {
      handleError(error)
    }
  }

  async rescheduleSlot(data) {
    try {
      const response = await post(`/slotRequest/create`, data)
      if (!response || !response.data) throw new Error("An error occured. Please try again")
      return response.data
    } catch (error) {
      handleError(error)
    }
  }

  async getSlotRequests(filters = {}, lastRefKey = 0, limit = 10) {
    try {
      const response = await post(`/slotRequest/list?lastRef=${lastRefKey}&limit=${limit}`, { filters })
      if (!response || !response.data) throw new Error("An error occured. Please try again")
      return response.data
    } catch (error) {
      handleError(error)
    }
  }

  async approveSlot(id) {
    try {
      const response = await post(`/slotRequest/approve/${id}`)
      if (!response) throw new Error("An error occured. Please try again")
      return response.data
    } catch (error) {
      handleError(error)
    }
  }

  async rejectSlot(id) {
    try {
      const response = await post(`/slotRequest/reject/${id}`)
      if (!response) throw new Error("An error occured. Please try again")
      return response.data
    } catch (error) {
      handleError(error)
    }
  }

  async slotStats(userId, course_id) {
    try {
      const response = await post(`/slots/stats/`, { user_id: userId, course_id: course_id })
      if (!response) throw new Error("An error occured. Please try again")
      return response.data
    } catch (error) {
      handleError(error)
    }
  }

  async updateSlotStatus(slotId, status) {
    try {
      const response = await post(`/slots/updateStatus`, { slotId, status })
      if (!response) throw new Error("An error occured. Please try again")
      return response.data
    } catch (error) {
      handleError(error)
    }
  }

  async deleteSlot(slotId) {
    try {
      const response = await del(`/slots/${slotId}`)
      if (!response) throw new Error("An error occured. Please try again")
      return response.data
    } catch (error) {
      handleError(error)
    }
  }

  async syncSlots(student_id) {
    try {
      const response = await post(`/slots/syncSlots`, { student_id })
      if (!response) throw new Error("An error occured. Please try again")
      return response.data
    } catch (error) {
      handleError(error)
    }
  }

  async getAvailableSlotCountByDate(data) {
    try {
      const response = await post(`/sessions/availableSlotCount`, { data })
      if (!response) throw new Error("An error occured. Please try again")
      return response.data
    } catch (error) {
      handleError(error)
    }
  }
}

const slotService = new SlotService()
export default slotService

const dummySlots = [
  {
    "center_id": {
      location: "Banglore"
    },
    "start_date": "2025-01-08:00:00.000Z",
    "start_time": "2025-01-08T08:00:00.000Z",
    "end_date": "2025-01-08T00:00:00.000Z",
    "end_time": "2025-01-08T09:30:00.000Z",
    "status": "attended",
    "booked_student_id": null,
    "course_id": "64b7f0d5bcf86cd799439012",
    "remark": "Morning session"
  },
  {
    "center_id": {
      location: "Banglore"
    },
    "start_date": "2025-01-08T00:00:00.000Z",
    "start_time": "2025-01-08T14:00:00.000Z",
    "end_date": "2025-01-08T00:00:00.000Z",
    "end_time": "2025-01-08T15:30:00.000Z",
    "status": "attended",
    "booked_student_id": "64b7f0d5bcf86cd799439013",
    "course_id": "64b7f0d5bcf86cd799439014",
    "remark": "Afternoon session"
  },
  {
    "center_id": {
      location: "Banglore"
    },
    "start_date": "2025-01-09T00:00:00.000Z",
    "start_time": "2025-01-09T08:00:00.000Z",
    "end_date": "2025-01-09T00:00:00.000Z",
    "end_time": "2025-01-09T09:30:00.000Z",
    "status": "attended",
    "booked_student_id": null,
    "course_id": "64b7f0d5bcf86cd799439015",
    "remark": "Morning session"
  },
  {
    "center_id": {
      location: "Banglore"
    },
    "start_date": "2025-01-09T00:00:00.000Z",
    "start_time": "2025-01-09T14:00:00.000Z",
    "end_date": "2025-01-09T00:00:00.000Z",
    "end_time": "2025-01-09T15:30:00.000Z",
    "status": "requested",
    "booked_student_id": null,
    "course_id": "64b7f0d5bcf86cd799439016",
    "remark": "Afternoon session"
  },
  {
    "center_id": "64b7f0d5bcf86cd799439011",
    "start_date": "2025-02-17T00:00:00.000Z",
    "start_time": "2025-02-17T08:00:00.000Z",
    "end_date": "2025-02-17T00:00:00.000Z",
    "end_time": "2025-02-17T09:30:00.000Z",
    "status": "booked",
    "booked_student_id": "64b7f0d5bcf86cd799439017",
    "course_id": "64b7f0d5bcf86cd799439018",
    "remark": "Morning session"
  },
  {
    "center_id": "64b7f0d5bcf86cd799439011",
    "start_date": "2025-02-17T00:00:00.000Z",
    "start_time": "2025-02-17T14:00:00.000Z",
    "end_date": "2025-02-17T00:00:00.000Z",
    "end_time": "2025-02-17T15:30:00.000Z",
    "status": "pending",
    "booked_student_id": null,
    "course_id": "64b7f0d5bcf86cd799439019",
    "remark": "Afternoon session"
  }
]
