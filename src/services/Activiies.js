import handleError from "@utils/handleError"
import { del, post } from "@utils/Requests"

class ActivitiesService {
  async getActivities(filters = {}, lastRefKey = 0, limit = 10) {
    try {
      const response = await post(`/activities/getAll?lastRef=${lastRefKey}&limit=${limit}`, { filters })
      if (!response || !response.data) throw new Error("An error occured. Please try again")
      return response.data
    } catch (error) {
      handleError(error)
    }
  }

  async createActivity(data) {
    try {
      const response = await post(`/activities`, data)
      if (!response) throw new Error("An error occured. Please try again")
      return response.data
    } catch (error) {
      handleError(error)
    }
  }

  async deleteActivity(id) {
    try {
      const response = await del(`/activities/${id}`)
      if (!response) throw new Error("An error occured. Please try again")
      return response
    } catch (error) {
      handleError(error)
    }
  }

}

const activitiesService = new ActivitiesService()
export default activitiesService

const dummyActivities = [
  {
    "student_id": "64f1c0f1e4a7e5aefc123456",
    "faculty_id": {
      name: "Steffy",
      avatar: "https://i.pravatar.cc/300"
    },
    "title": "Project Proposal Submission",
    "remarks": "Please review and provide feedback.",
    "assigned_date": "2025-01-12T00:00:00.000Z",
    "assigned_deadline": "2025-01-20T00:00:00.000Z"
  },
  {
    "student_id": "64f1c0f1e4a7e5aefc123458",
    "faculty_id": {
      name: "Steffy",
      avatar: "https://i.pravatar.cc/300"
    },
    "resource": {
      "filename": "final_report.pdf",
      "filesize": "1.2MB",
      "filetype": "PDF"
    },
    "assigned_date": "2025-01-12T00:00:00.000Z",
    "assigned_deadline": "2025-01-15T00:00:00.000Z"
  },
  {
    "student_id": "64f1c0f1e4a7e5aefc123460",
    "faculty_id": {
      name: "Steffy",
      avatar: "https://i.pravatar.cc/300"
    },
    "title": "Midterm Review Submission",
    "remarks": "Ensure all sections are completed.",
    "assigned_date": "2025-01-09T00:00:00.000Z",
    "assigned_deadline": "2025-01-14T00:00:00.000Z"
  },
  {
    "student_id": "64f1c0f1e4a7e5aefc123462",
    "faculty_id": {
      name: "Steffy",
      avatar: "https://i.pravatar.cc/300"
    },
    "resource": {
      "filename": "research_notes.docx",
      "filesize": "500KB",
      "filetype": "PDF"
    },
    "assigned_date": "2025-01-08T00:00:00.000Z",
    "assigned_deadline": "2025-01-13T00:00:00.000Z"
  }
]
