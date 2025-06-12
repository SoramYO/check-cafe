import axiosClient from './axiosClient';

class CheckinAPI {
  HandleCheckin = async (
    url, 
    data, 
    method = 'get'
  ) => {
    return await axiosClient(`/checkins${url}`, {
      method: method ?? 'get',
      data,
    });
  };
}

const checkinAPI = new CheckinAPI();
export default checkinAPI; 