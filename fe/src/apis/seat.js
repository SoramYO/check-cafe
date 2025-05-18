import axiosClient from "../utils/authorizedAxios";

const seatAPI = {
  getSeats: async (endpoint, params = {}) => {
    try {
      const response = await axiosClient.get(`/seats${endpoint}`, { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  getSeat: async (id) => {
    try {
      const response = await axiosClient.get(`/seats/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  createSeat: async (data) => {
    try {
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };
      const response = await axiosClient.post('/seats', data, config);
      return response;
    } catch (error) {
      throw error;
    }
  },

  updateSeat: async (id, data) => {
    try {
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };
      const response = await axiosClient.patch(`/seats/${id}`, data, config);
      return response;
    } catch (error) {
      throw error;
    }
  },

  deleteSeat: async (id) => {
    try {
      const response = await axiosClient.delete(`/seats/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  updateSeatStatus: async (id, status) => {
    try {
      const response = await axiosClient.patch(`/seats/${id}/status`, { status });
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  bulkDeleteSeats: async (ids) => {
    try {
      const response = await axiosClient.delete('/seats/bulk', { 
        data: { ids } 
      });
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  getSeatsByLocation: async (location, params = {}) => {
    try {
      const response = await axiosClient.get(`/seats/by-location/${location}`, { params });
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  getSeatsByType: async (type, params = {}) => {
    try {
      const response = await axiosClient.get(`/seats/by-type/${type}`, { params });
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  getAvailableSeats: async (date, timeSlot, partySize, params = {}) => {
    try {
      const response = await axiosClient.get(`/seats/available?date=${date}&timeSlot=${timeSlot}&partySize=${partySize}`, { params });
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default seatAPI; 