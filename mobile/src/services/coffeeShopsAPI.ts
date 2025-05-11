import { api } from './api';

export const coffeeShopsApi = {
    getCoffeeShops: async (page: number, size: number, categories?: string[]) => {
        const params = new URLSearchParams({ page: String(page), size: String(size) });
        if (categories) {
            categories.forEach(cat => params.append('categories', cat));
        }
        const res = await api.get(`/coffee-shops?${params.toString()}`);
        return res.data;
    }
}