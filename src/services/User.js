import handleError from "@utils/handleError"
import { post, put } from "@utils/Requests"

class UserService {
  async getByRoleByCenter(role, centerId, lastRefKey = 0, limit = 10) {
    try {
      if (!role || !centerId) throw new Error("Bad Data")
      const response = await post(`/user/getByRoleByCenter?lastRefKey=${lastRefKey}&limit=${limit}`, {
        role: role,
        centerId: centerId
      })
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

  async getCurrentSessionAttendees() {
    try {
      const response = await post(`/user/getCurrentSessionAttendees`,)
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

}

const userService = new UserService()
export default userService