import axiosClient from './axiosClient';

class AdvertisementAPI {
    HandleAdvertisement = async (
        url = '',
        data,
        method = 'get',
    ) => {
        return await axiosClient(`/advertisements${url}`, {
            method: method ?? 'get',
            data,
        });
    };
}

const advertisementAPI = new AdvertisementAPI();
export default advertisementAPI;