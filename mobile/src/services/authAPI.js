import { AxiosError } from "axios";
import { api } from "./api";

export const authApi = {
  login: async (email, password) => {
    try {
      const response = await api.post("/access/sign-in", { email, password });
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        throw error.response.data;
      }
      throw error.message;
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post("/access/sign-up", userData);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        throw error.response.data;
      }
      throw error.message;
    }
  },
};
