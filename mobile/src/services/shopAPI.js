import axiosClient from './axiosClient';

class CoffeeShopsAPI {
    HandleCoffeeShops = async (
      url = '',
      data,
      method = 'get',
    ) => {
      return await axiosClient(`/shops${url}`, {
        method: method ?? 'get',
        data,
      });
    };
  }
  
  const shopAPI = new CoffeeShopsAPI();
  export default shopAPI;