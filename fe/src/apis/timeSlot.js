import axiosClient from "../utils/authorizedAxios";

const timeSlotAPI = {
  getTimeSlots: async (endpoint, params = {}) => {
    try {
      const response = await axiosClient.get(`/time-slots${endpoint}`, { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  getTimeSlot: async (id) => {
    try {
      const response = await axiosClient.get(`/time-slots/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  createTimeSlot: async (data) => {
    try {
      const response = await axiosClient.post('/time-slots', data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  updateTimeSlot: async (id, data) => {
    try {
      const response = await axiosClient.patch(`/time-slots/${id}`, data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  deleteTimeSlot: async (id) => {
    try {
      const response = await axiosClient.delete(`/time-slots/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  updateTimeSlotStatus: async (id, status) => {
    try {
      const response = await axiosClient.patch(`/time-slots/${id}/status`, { status });
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  bulkDeleteTimeSlots: async (ids) => {
    try {
      const response = await axiosClient.delete('/time-slots/bulk', { 
        data: { ids } 
      });
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  getTimeSlotsByDay: async (day, params = {}) => {
    try {
      const response = await axiosClient.get(`/time-slots/by-day/${day}`, { params });
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  getAvailableSeatsForTimeSlot: async (timeSlotId, date, params = {}) => {
    try {
      const response = await axiosClient.get(`/time-slots/${timeSlotId}/available-seats?date=${date}`, { params });
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default timeSlotAPI; 