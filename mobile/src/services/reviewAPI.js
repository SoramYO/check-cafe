import axiosClient from './axiosClient';

class ReviewAPI {
    HandleReview = async (
      url = '',
      data,
      method = 'get',
    ) => {
      return await axiosClient(`/reviews${url}`, {
        method: method ?? 'get',
        data,
      });
    };
  }
  
  const reviewAPI = new ReviewAPI();
  export default reviewAPI;