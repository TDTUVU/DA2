import { Hotel } from '../types/hotel.types';

const API_URL = '/api/hotels';

const getAuthHeaders = (isFormData: boolean = false) => {
    const headers = new Headers();
    const token = localStorage.getItem('token');
    
    if (!isFormData) {
        headers.append('Content-Type', 'application/json');
    }
    if (token) {
        headers.append('Authorization', `Bearer ${token}`);
    }
    return headers;
};

export const hotelService = {
    async getAllHotels(page = 1, limit = 10, searchTerm = ''): Promise<{ hotels: Hotel[], total: number, pages: number }> {
        const params = new URLSearchParams({
            page: String(page),
            limit: String(limit),
            search: searchTerm,
        });
        const response = await fetch(`${API_URL}?${params.toString()}`, { headers: getAuthHeaders() });
        if (!response.ok) throw new Error('Không thể tải danh sách khách sạn');
        const data = await response.json();
        return {
            hotels: data.hotels,
            total: data.total,
            pages: data.pages,
        };
    },

    async toggleHotelVisibility(id: string): Promise<Hotel> {
        const response = await fetch(`${API_URL}/${id}/toggle-visibility`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Không thể thay đổi trạng thái hiển thị');
        return response.json();
    },

    async createHotel(formData: FormData): Promise<Hotel> {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: getAuthHeaders(true),
            body: formData,
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || err.message || 'Không thể tạo khách sạn');
        }
        return response.json();
    },

    async updateHotel(id: string, formData: FormData): Promise<Hotel> {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PATCH',
            headers: getAuthHeaders(true),
            body: formData,
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || err.message || 'Không thể cập nhật khách sạn');
        }
        return response.json();
    },
}; 