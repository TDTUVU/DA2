import { User } from '../types/user.types';
import { axiosInstance } from './axios.service';

const API_URL = '/api/users';

const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
});

const handleResponse = async (response: Response) => {
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Đã có lỗi xảy ra');
    }
    return data;
};

class UserService {
    async getAllUsers(page = 1, limit = 10, searchTerm = '', role = ''): Promise<{ users: User[], total: number, pages: number }> {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            search: searchTerm,
            role
        });
        const response = await fetch(`${API_URL}?${params.toString()}`, { headers: getAuthHeaders() });
        return handleResponse(response);
    }

    async deleteUser(id: string): Promise<{ message: string }> {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    }
    
    async updateUserRole(id: string, role: 'user' | 'admin'): Promise<User> {
        const response = await fetch(`${API_URL}/role`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ userId: id, role })
        });
        return handleResponse(response);
    }

    async updateUserByAdmin(userId: string, userData: Partial<User>): Promise<User> {
        const response = await fetch(`${API_URL}/${userId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(userData)
        });
        return handleResponse(response);
    }
}

export const userService = new UserService(); 