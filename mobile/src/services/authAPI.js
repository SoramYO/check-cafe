import axiosClient from './axiosClient';

class AuthAPI {
  HandleAuthentication = async (
    url,
    data,
    method = 'get',
  ) => {
    return await axiosClient(`/access${url}`, {
      method: method ?? 'get',
      data,
    });
  };
}

const authenticationAPI = new AuthAPI();
export default authenticationAPI;