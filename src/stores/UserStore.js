import authService from "@/services/Auth";
import userService from "@/services/User";
import { create } from "zustand";

const userStore = create((set, get) => ({
  user: null,
  loading: false,
  authLoading: true,
  submitLoading: false,
  isAuthenticated: false,
  summary: {},
  login: async ({ email, password }) => {
    try {
      if (!email || !password) throw new Error("Please provide username or password")
      set({ loading: true })
      const { user, token } = await authService.Login({ email, password })
      localStorage.setItem('jwt_token', token);
      set({ user: user, isAuthenticated: true })
    } catch (error) {
      throw new Error(error)
    } finally {
      set({ loading: false })
    }
  },
  checkAuth: async () => {
    try {
      set({ authLoading: true })
      const { user, loggedIn } = await authService.checkAuth()
      set({ user: user, isAuthenticated: loggedIn })
    } catch (error) {
      set({ user: null, isAuthenticated: false })
      console.error('Failed to check authentication:', error);
    } finally {
      set({ authLoading: false })
    }
  },
  logOut: async () => {
    localStorage.setItem("jwt_token", null)
    set({
      user: null,
      isAuthenticated: false
    })
  },
  getSummary: async (filters) => {
    try {
      set({ loading: true })
      const data = await userService.getSummary(filters)
      set({
        summary: data
      })
    } catch (error) {
      handleInternalError(error)
    } finally {
      set({ loading: false })
    }
  }
}))

export default userStore