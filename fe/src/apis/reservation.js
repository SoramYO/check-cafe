import axiosClient from "../utils/authorizedAxios";

const reservationAPI = {
  getReservations: async (endpoint, params = {}) => {
    try {
      const response = await axiosClient.get(`/reservations${endpoint}`, { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  getReservation: async (id) => {
    try {
      const response = await axiosClient.get(`/reservations/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  createReservation: async (data) => {
    try {
      const response = await axiosClient.post('/reservations', data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  updateReservation: async (id, data) => {
    try {
      const response = await axiosClient.patch(`/reservations/${id}`, data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  deleteReservation: async (id) => {
    try {
      const response = await axiosClient.delete(`/reservations/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  updateReservationStatus: async (id, status) => {
    try {
      const response = await axiosClient.patch(`/reservations/${id}/status`, { status });
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  bulkDeleteReservations: async (ids) => {
    try {
      const response = await axiosClient.delete('/reservations/bulk', { 
        data: { ids } 
      });
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  getAvailableTimeSlots: async (date, params = {}) => {
    try {
      const response = await axiosClient.get(`/reservations/available-slots?date=${date}`, { params });
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  getAvailableSeats: async (date, timeSlot, partySize, params = {}) => {
    try {
      const response = await axiosClient.get(`/reservations/available-seats?date=${date}&timeSlot=${timeSlot}&partySize=${partySize}`, { params });
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  searchReservations: async (query, params = {}) => {
    try {
      const response = await axiosClient.get(`/reservations/search?q=${query}`, { params });
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  getReservationStatistics: async (startDate, endDate) => {
    try {
      const response = await axiosClient.get(`/reservations/statistics?startDate=${startDate}&endDate=${endDate}`);
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default reservationAPI; 