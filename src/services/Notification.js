import { get, put } from "@utils/Requests";

export const notificationService = {
  getNotifications: () => {
    return get('/notifications');
  },
  getAllNotifications: (params) => {
    const cleanParams = {};
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== "") {
        cleanParams[key] = params[key];
      }
    });
    const queryString = new URLSearchParams(cleanParams).toString();
    return get(`/notifications/all?${queryString}`);
  },
  markAsRead: (notificationId) => {
    return put(`/notifications/${notificationId}/read`);
  },
};
