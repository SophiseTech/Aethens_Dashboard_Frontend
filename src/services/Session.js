import handleError from "@utils/handleError"
import { post } from "@utils/Requests"

class SessionService {
  async getAvailableSessionByDate() {
    try {
      const response = await post("/sessions/availableSessions", {})
      if (!response || !response.data) throw new Error("An error occured. Please try again")
      return response
    } catch (error) {
      handleError(error)
    }
  }

  async bookSession(data) {
    try {
      const response = await post("/sessions/bookSession", data)
      if (!response) throw new Error("An error occured. Please try again")
      return response.data
    } catch (error) {
      handleError(error)
    }
  }

  async bookAdditionalSession(data) {
    try {
      const response = await post("/sessions/bookAdditionalSession", data)
      if (!response) throw new Error("An error occured. Please try again")
      return response.data
    } catch (error) {
      handleError(error)
    }
  }


}

const sessionService = new SessionService()
export default sessionService