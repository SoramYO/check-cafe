import axiosClient from "../utils/authorizedAxios";

const salesDiscountAPI = {
  getDiscounts: async (endpoint, params = {}) => {
    try {
      const response = await axiosClient.get(`/sales-discounts${endpoint}`, { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  getDiscount: async (id) => {
    try {
      const response = await axiosClient.get(`/sales-discounts/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  createDiscount: async (data) => {
    try {
      const response = await axiosClient.post('/sales-discounts', data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  updateDiscount: async (id, data) => {
    try {
      const response = await axiosClient.patch(`/sales-discounts/${id}`, data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  deleteDiscount: async (id) => {
    try {
      const response = await axiosClient.delete(`/sales-discounts/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  updateDiscountStatus: async (id, status) => {
    try {
      const response = await axiosClient.patch(`/sales-discounts/${id}/status`, { status });
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  bulkDeleteDiscounts: async (ids) => {
    try {
      const response = await axiosClient.delete('/sales-discounts/bulk', { 
        data: { ids } 
      });
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  getActiveDiscounts: async (params = {}) => {
    try {
      const response = await axiosClient.get('/sales-discounts/active', { params });
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  validateDiscountCode: async (code, params = {}) => {
    try {
      const response = await axiosClient.get(`/sales-discounts/validate/${code}`, { params });
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  applyDiscount: async (code, orderData) => {
    try {
      const response = await axiosClient.post(`/sales-discounts/apply/${code}`, orderData);
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default salesDiscountAPI; 