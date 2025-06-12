import axiosClient from './axiosClient';

class FriendAPI {
  HandleFriend = async (
    url,
    data,
    method = 'get'
  ) => {
    return await axiosClient(`/friends${url}`, {
      method: method ?? 'get',
      data,
    });
  };
}

const friendAPI = new FriendAPI();
export default friendAPI; 