import axiosClient from './axiosClient';

class AnalyticsAPI {
    HandleAnalytics = async (
        url = '',
        data,
        method = 'get',
    ) => {
        return await axiosClient(`/analytics${url}`, {
            method: method ?? 'get',
            data,
        });
    };
}

const analyticsAPI = new AnalyticsAPI();
export default analyticsAPI;