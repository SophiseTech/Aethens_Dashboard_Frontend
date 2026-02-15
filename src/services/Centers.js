import handleError from "@utils/handleError"
import { post, put, del } from "@utils/Requests"

class CentersService {
  async getCenters(filters = {}, lastRefKey = 0, limit = 10) {
    try {
      const response = await post(`/centers/getAll?lastRef=${lastRefKey}&limit=${limit}`, { filters })
      if (!response || !response.data) throw new Error("An error occured. Please try again")
      return response.data
    } catch (error) {
      handleError(error)
    }
  }

  async create(data) {
    try {
      const response = await post("/centers", data)
      if (!response || !response.data) throw new Error("An error occurred. Please try again")
      return response.data
    } catch (error) {
      handleError(error)
      throw error
    }
  }

  async update(id, data) {
    try {
      const response = await put(`/centers/${id}`, data)
      if (!response || !response.data) throw new Error("An error occurred. Please try again")
      return response.data
    } catch (error) {
      handleError(error)
      throw error
    }
  }

  async delete(id) {
    try {
      const response = await del(`/centers/${id}`)
      return response
    } catch (error) {
      handleError(error)
      throw error
    }
  }
}

const centersService = new CentersService()
export default centersService