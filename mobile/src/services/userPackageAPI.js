import axiosClient from './axiosClient';

class UserPackageAPI {
  HandleUserPackage = async (
    url,
    data,
    method = 'get',
  ) => {
    return await axiosClient(`/user-packages${url}`, {
      method: method ?? 'get',
      data,
    });
  };
}

const userPackageAPI = new UserPackageAPI();
export default userPackageAPI;