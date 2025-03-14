import handleError from "@utils/handleError"
import { post } from "@utils/Requests"

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
}

const centersService = new CentersService()
export default centersService