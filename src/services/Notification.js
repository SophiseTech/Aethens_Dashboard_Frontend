import { get, put } from "@utils/Requests";

export const notificationService = {
  getNotifications: () => {
    return get('/notifications');
  },
  markAsRead: (notificationId) => {
    return put(`/notifications/${notificationId}/read`);
  },
};
