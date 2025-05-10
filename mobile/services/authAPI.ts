import { AxiosError } from 'axios';
import { api } from './api';

export const authApi = {
    login: async (email: string, password: string) => {
      try {
        const response = await api.post('/user/login', { email, password });
        return response.data;
      } catch (error) {
        // Xử lý lỗi typescript: error là unknown
        if (error instanceof AxiosError && error.response) {
          throw error.response.data;
        }
        throw (error as Error).message;
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
        if (error instanceof AxiosError && error.response) {
          throw error.response.data;
        }
        throw (error as Error).message;
      }
    },
  };
  