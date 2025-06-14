import { Flight } from '../types/flight.types';

const API_URL = '/api/flights';

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

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || err.message || 'Đã có lỗi xảy ra');
    }
    return response.json();
};

export const flightService = {
    async getAllFlights(page = 1, limit = 10, searchTerm = ''): Promise<{ flights: Flight[], total: number, pages: number }> {
        const params = new URLSearchParams({
            page: String(page),
            limit: String(limit),
            search: searchTerm,
        });
        const response = await fetch(`${API_URL}?${params.toString()}`, { headers: getAuthHeaders() });
        return handleResponse(response);
    },

    async toggleFlightVisibility(id: string): Promise<Flight> {
        const response = await fetch(`${API_URL}/${id}/toggle-visibility`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
        });
        return handleResponse(response);
    },

    async createFlight(formData: FormData): Promise<Flight> {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: getAuthHeaders(true),
            body: formData,
        });
        return handleResponse(response);
    },

    async updateFlight(id: string, formData: FormData): Promise<Flight> {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PATCH',
            headers: getAuthHeaders(true),
            body: formData,
        });
        return handleResponse(response);
    },

    async deleteFlight(id: string): Promise<{ message: string }> {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        return handleResponse(response);
    }
}; 