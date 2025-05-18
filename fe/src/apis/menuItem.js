import axiosClient from "../utils/authorizedAxios";

const menuItemAPI = {
  getMenuItems: async (endpoint, params = {}) => {
    try {
      const response = await axiosClient.get(`/menu-items${endpoint}`, { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  getMenuItem: async (id) => {
    try {
      const response = await axiosClient.get(`/menu-items/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  createMenuItem: async (data) => {
    try {
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };
      const response = await axiosClient.post('/menu-items', data, config);
      return response;
    } catch (error) {
      throw error;
    }
  },

  updateMenuItem: async (id, data) => {
    try {
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };
      const response = await axiosClient.patch(`/menu-items/${id}`, data, config);
      return response;
    } catch (error) {
      throw error;
    }
  },

  deleteMenuItem: async (id) => {
    try {
      const response = await axiosClient.delete(`/menu-items/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  getMenuCategories: async (params = {}) => {
    try {
      const response = await axiosClient.get('/menu-categories', { params });
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  updateMenuItemStatus: async (id, status) => {
    try {
      const response = await axiosClient.patch(`/menu-items/${id}/status`, { status });
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  bulkDeleteMenuItems: async (ids) => {
    try {
      const response = await axiosClient.delete('/menu-items/bulk', { 
        data: { ids } 
      });
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  searchMenuItems: async (query, params = {}) => {
    try {
      const response = await axiosClient.get(`/menu-items/search?q=${query}`, { params });
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default menuItemAPI; 