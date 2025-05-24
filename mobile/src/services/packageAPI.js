import axiosClient from './axiosClient';

class PackageAPI {
  HandlePackage = async (
    url,
    data,
    method = 'get',
  ) => {
    return await axiosClient(`/packages${url}`, {
      method: method ?? 'get',
      data,
    });
  };
}

const packageAPI = new PackageAPI();
export default packageAPI;