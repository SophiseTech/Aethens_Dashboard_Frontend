import { create } from 'zustand';
import { notificationService } from '@services/Notification'; // I will create this service

const notificationStore = create((set, get) => ({
  notifications: [],
  allNotifications: [],
  totalNotifications: 0,
  loading: false,
  loadingAll: false,
  error: null,
  getNotifications: async () => {
    set({ loading: true, error: null });
    try {
      const response = await notificationService.getNotifications();
      set({ notifications: response.data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
  fetchAllNotifications: async (params = {}) => {
    set({ loadingAll: true, error: null });
    try {
      const response = await notificationService.getAllNotifications(params);
      set({
        allNotifications: response.data.notifications,
        totalNotifications: response.data.total,
        loadingAll: false
      });
    } catch (error) {
      set({ error: error.message, loadingAll: false });
    }
  },
  markAsRead: async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      // Remove from notifications list (for bell popover) since we only show unread
      // Update allNotifications to reflect the change
      set(state => ({
        notifications: state.notifications.filter(n => n._id !== notificationId),
        allNotifications: state.allNotifications.map(n =>
          n._id === notificationId ? { ...n, is_read: true } : n
        )
      }));
    } catch (error) {
      // Handle error silently for now
      console.error("Failed to mark notification as read", error);
    }
  },
  toggleReadStatus: async (notificationId) => {
    try {
      const response = await notificationService.toggleReadStatus(notificationId);
      const updatedNotification = response.data;
      // Update both notifications (for bell popover) and allNotifications (for listing)
      set(state => ({
        notifications: state.notifications.map(n =>
          n._id === notificationId ? { ...n, is_read: updatedNotification.is_read } : n
        ),
        allNotifications: state.allNotifications.map(n =>
          n._id === notificationId ? { ...n, is_read: updatedNotification.is_read } : n
        )
      }));
    } catch (error) {
      console.error("Failed to toggle notification status", error);
    }
  },
}));

export default notificationStore;

