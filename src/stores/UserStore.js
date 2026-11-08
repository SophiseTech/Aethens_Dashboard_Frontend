import authService from "@/services/Auth";
import userService from "@/services/User";
import { create } from "zustand";
import handleInternalError from "@utils/handleInternalError";
import { ROLES } from "@utils/constants";
import studentStore from "@stores/StudentStore";

const userStore = create((set, get) => ({
  user: null,
  loading: false,
  authLoading: true,
  submitLoading: false,
  isAuthenticated: false,
  summary: {},
  // Filters of the last getSummary call, so the "Enrolled Students" list matches the count
  summaryFilters: null,
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
      if (user.role === ROLES.STUDENT) {
        studentStore.getState().setActiveStudent(user)
      }
    } catch (error) {
      set({ user: null, isAuthenticated: false })
      console.error('Failed to check authentication:', error);
    } finally {
      set({ authLoading: false })
    }
  },
  // Must NOT touch push: don't call subscription.unsubscribe() or remove the server
  // link. The browser's push endpoint is shared by every account that has logged in
  // here, and each keeps receiving (labelled by account) after logging out.
  logOut: async () => {
    localStorage.removeItem("jwt_token")
    set({
      user: null,
      isAuthenticated: false
    })
  },
  getSummary: async (filters) => {
    try {
      set({ loading: true, summaryFilters: filters })
      const data = await userService.getSummary(filters)
      set({
        summary: data
      })
    } catch (error) {
      handleInternalError(error)
    } finally {
      set({ loading: false })
    }
  },
  // Paged list of the students counted in the summary. Kept out of the shared
  // loading flag — the caller (useEnrolledStudents) tracks its own loading state.
  getSummaryStudents: async (params) => {
    return userService.getSummaryStudents(params)
  }
}))

export default userStore