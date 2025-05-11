import axios, { AxiosError } from 'axios';

// Thay đổi IP này thành IP của máy chủ của bạn
export const BASE_URL = 'http://192.168.100.207:3000/api/v1'; // Thay x bằng số thích hợp

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optional: Interceptor để xử lý lỗi hoặc token tự động
api.interceptors.response.use(
  response => response,
  error => {
    // Xử lý lỗi chung ở đây nếu muốn
    return Promise.reject(error);
  }
);