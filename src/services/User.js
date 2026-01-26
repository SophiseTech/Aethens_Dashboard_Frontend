import handleError from "@utils/handleError"
import { post, put } from "@utils/Requests"

class UserService {
  async getByRoleByCenter(role, centerId, lastRefKey = 0, limit = 10, status = null, courseIds = null, fromBranch = null, toBranch = null) {
    try {
      if (!role || !centerId) throw new Error("Bad Data")
      const payload = {
        role: role,
        centerId: centerId === null ? 'all' : centerId
      }

      // Add status filter if provided
      if (status) {
        payload.status = status;
      }

      // Add course filter if provided (can be array or single value)
      if (courseIds && (Array.isArray(courseIds) ? courseIds.length > 0 : courseIds)) {
        payload.course_ids = Array.isArray(courseIds) ? courseIds : [courseIds];
      }

      // Add migration filters if provided
      if (fromBranch) {
        payload.fromBranch = fromBranch;
      }

      if (toBranch) {
        payload.toBranch = toBranch;
      }

      const response = await post(`/user/getByRoleByCenter?lastRefKey=${lastRefKey}&limit=${limit}`, payload)
      if (!role) throw new Error("Bad Data")

      if (!response || !response.data) throw new Error("An error occured. Please try again")
      return response.data
    } catch (error) {
      handleError(error)
    }
  }

  async getSummary(filters = {}) {
    try {
      const response = await post(`/user/summary`, { filters })
      if (!response || !response.data) throw new Error("An error occured. Please try again")
      return response.data
    } catch (error) {
      handleError(error)
    }
  }

  async getCurrentSessionAttendees(centerId) {
    try {
      const response = !centerId ? await post(`/user/getCurrentSessionAttendees`,) : await post(`/user/getCurrentSessionAttendees`, { centerId })
      if (!response || !response.data) throw new Error("An error occured. Please try again")
      return response.data
    } catch (error) {
      handleError(error)
    }
  }

  async edit(id, data) {
    try {
      const response = await put(`/user/edit/${id}`, data)
      if (!response || !response.data) throw new Error("An error occured. Please try again")
      return response.data
    } catch (error) {
      handleError(error)
    }
  }

  async search(lastRef = 0, limit = 10, filters) {
    try {
      const response = await post(`/user/search?lastRefKey=${lastRef}&limit=${limit}`, {
        filters
      })
      if (!response || !response.data) throw new Error("An error occured. Please try again")
      return response.data
    } catch (error) {
      handleError(error)
    }
  }

  async deactivateUsers(userId) {
    try {
      await post(`/user/deactivateUser`, { userId })
    } catch (error) {
      handleError(error)
    }
  }

  async activateUsers(userId) {
    try {
      await post(`/user/activateUser`, { userId })
    } catch (error) {
      handleError(error)
    }
  }

  async getUsers(filters = {}) {
    try {
      // Use dedicated getManagers endpoint
      const response = await post(`/user/getManagers`, {
        centerId: filters.center_id || "all"
      })
      if (!response || !response.data) throw new Error("An error occurred. Please try again")
      return response.data
    } catch (error) {
      handleError(error)
    }
  }
}

const userService = new UserService()
export default userService