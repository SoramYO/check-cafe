import axios from 'axios';
import axiosClient from './axiosClient';

class ThemeAPI {
  HandleTheme = async (
    url = '',
    data,
    method = 'get',
  ) => {
    return await axiosClient(`/themes${url}`, {
      method: method ?? 'get',
      data,
    });
  };
}

const themeAPI = new ThemeAPI();
export default themeAPI;