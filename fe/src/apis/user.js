import axiosClient from "../utils/authorizedAxios";

class UserAPI {
  HandleUser = async (url, data, method = "get") => {
    return await axiosClient(`/user${url}`, {
      method: method ?? "get",
      data,
    });
  };
}

const userAPI = new UserAPI();
export default userAPI;
