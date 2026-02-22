import centersStore from "@stores/CentersStore"
import userStore from "@stores/UserStore"
import handleError from "@utils/handleError"
import { get, post } from "@utils/Requests"

class SessionService {
  async getAvailableSessionByDate(date, center_id) {
    try {
      const response = await post("/sessions/availableSessions", { date, center_id })
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

  async deallocateSessions(userId) {
    try {
      await post("/sessions/deallocateSessions", { userId })
    } catch (error) {
      handleError(error)
    }
  }

  async getAllSessions(date) {
    try {
      const { user } = userStore.getState();
      const { selectedCenter } = centersStore.getState();

      let constructedPath;
      if ((user.role === 'admin' || user.role === 'operations_manager') && selectedCenter) {
        constructedPath = `/sessions/getAll?centerId=${selectedCenter}&slotDate=${date || ""}`;
      } else {
        constructedPath = `/sessions/getAll?slotDate=${date || ""}`;
      }
      const response = await get(constructedPath);
      if (!response || !response.data) throw new Error("An error occured. Please try again")
      return response.data
    } catch (error) {
      handleError(error)
    }
  }

  async getStudentsBySessionId(sessionId, slotDate) {
    try {
      const { user } = userStore.getState();
      const { selectedCenter } = centersStore.getState();

      let constructedPath;
      if (user.role === 'admin' && selectedCenter) {
        constructedPath = `/sessions/getStudentsBySessionId?centerId=${selectedCenter}`;
      } else {
        constructedPath = `/sessions/getStudentsBySessionId`;
      }
      const response = await post(constructedPath, { sessionId, slotDate })
      if (!response || !response.data) throw new Error("An error occured. Please try again")
      return response.data
    } catch (error) {
      handleError(error)
    }
  }


}

const sessionService = new SessionService()
export default sessionService