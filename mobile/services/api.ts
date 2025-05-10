import axios from 'axios';

// Thay đổi IP này thành IP của máy chủ của bạn
const BASE_URL = 'http://192.168.100.207:3000/v1/api'; // Thay x bằng số thích hợp

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authApi = {
  login: async (email: string, password: string) => {
    try {
      const response = await api.post('/user/login', { email, password });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  register: async (userData: {
    full_name: string;
    email: string;
    password: string;
    phone: string;
  }) => {
    try {
      const response = await api.post('/user/sign-up', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};
