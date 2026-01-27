import { create } from 'zustand';
import { notificationService } from '@services/Notification'; // I will create this service

const notificationStore = create((set, get) => ({
  notifications: [],
  loading: false,
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
  markAsRead: async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      // Update the state locally to avoid a refetch
      set(state => ({
        notifications: state.notifications.map(n => 
          n._id === notificationId ? { ...n, is_read: true } : n
        )
      }));
    } catch (error) {
      // Handle error silently for now
      console.error("Failed to mark notification as read", error);
    }
  },
}));

export default notificationStore;
