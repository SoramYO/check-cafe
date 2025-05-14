import axiosClient from './axiosClient';

class ReservationAPI {
    HandleReservation = async (
      url = '',
      data,
      method = 'get',
    ) => {
      return await axiosClient(`/reservations${url}`, {
        method: method ?? 'get',
        data,
      });
    };
  }
  
  const reservationAPI = new ReservationAPI();
  export default reservationAPI;