import axiosClient from "../utils/authorizedAxios";

const shopAPI = {
  getShops: async (endpoint, params = {}) => {
    try {
      const response = await axiosClient.get(`/shops${endpoint}`, { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  updateShop: async (endpoint, data) => {
    try {
      const response = await axiosClient.put(endpoint, data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  getThemes: async (endpoint, params = {}) => {
    try {
      const response = await axiosClient.get(endpoint, { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  createTheme: async (endpoint, data) => {
    try {
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };
      const response = await axiosClient.post(endpoint, data, config);
      return response;
    } catch (error) {
      throw error;
    }
  },

  updateTheme: async (endpoint, data) => {
    try {
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };
      const response = await axiosClient.patch(endpoint, data, config);
      return response;
    } catch (error) {
      throw error;
    }
  },

  deleteTheme: async (endpoint) => {
    try {
      const response = await axiosClient.delete(endpoint);
      return response;
    } catch (error) {
      throw error;
    }
  },

  getAdvertisements: async (endpoint, params = {}) => {
    try {
      const response = await axiosClient.get(endpoint, { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  createAdvertisement: async (endpoint, data) => {
    try {
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };
      const response = await axiosClient.post(endpoint, data, config);
      return response;
    } catch (error) {
      throw error;
    }
  },

  updateAdvertisement: async (endpoint, data) => {
    try {
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };
      const response = await axiosClient.patch(endpoint, data, config);
      return response;
    } catch (error) {
      throw error;
    }
  },

  deleteAdvertisement: async (endpoint) => {
    try {
      const response = await axiosClient.delete(endpoint);
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default shopAPI;
