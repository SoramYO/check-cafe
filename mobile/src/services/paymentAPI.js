import axiosClient from './axiosClient';

class PaymentAPI {
  HandlePayment = async (
    url,
    data,
    method = 'get',
  ) => {
    return await axiosClient(`/payments${url}`, {
      method: method ?? 'get',
      data,
    });
  };
}

const paymentAPI = new PaymentAPI();
export default paymentAPI;