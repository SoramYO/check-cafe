import axiosClient from './axiosClient';

class NotificationAPI {
  HandleNotification = async (
    url,
    data,
    method = 'get'
  ) => {
    return await axiosClient(`/notifications${url}`, {
      method: method ?? 'get',
      data,
    });
  };
}

const notificationAPI = new NotificationAPI();
export default notificationAPI; 