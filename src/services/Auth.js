// import handleError from "@utils/handleError"
import handleError from "@utils/handleError"
import { get, post } from "@utils/Requests"

const baseUrl = "/auth"
class AuthService {
  async Login({ email, password }) {
    try {
      const { data } = await post(baseUrl + '/login', { username: email, password })
      if (!data || !data.token || !data.user) throw new Error("An error occured. Please try again")
      return { token: data.token, user: data.user }
    } catch (error) {
      handleError(error)
      throw error
    }
  }

  async checkAuth() {
    try {
      const response = await get(baseUrl + "/authenticated")
      if (!response || !response.data) throw new Error("An error occured. Please try again")
      return response.data
    } catch (error) {
      // handleError(error)
      console.error("Auth check failed: ", error)
      throw error
    }
  }


}

const authService = new AuthService()
export default authService