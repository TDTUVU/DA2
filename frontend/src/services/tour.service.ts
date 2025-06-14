import { Tour } from '../types/tour.types';

const API_URL = '/api/tours';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
    };
};

// Hàm fetch tours với các tham số tìm kiếm và phân trang
export const tourService = {
    async getAllTours(page = 1, limit = 10, searchTerm = ''): Promise<{ tours: Tour[], total: number, pages: number }> {
        const params = new URLSearchParams({
            page: String(page),
            limit: String(limit),
            search: searchTerm,
        });

        try {
            const response = await fetch(`${API_URL}?${params.toString()}`, {
                headers: getAuthHeaders()
            });
            if (!response.ok) {
                throw new Error('Không thể tải danh sách tour');
            }
            const data = await response.json();
            return {
                tours: data.tours,
                total: data.total,
                pages: data.pages,
            };
        } catch (error) {
            console.error("Lỗi khi tải tour:", error);
            throw error;
        }
    },

    async toggleTourVisibility(id: string): Promise<Tour> {
        try {
            const response = await fetch(`${API_URL}/${id}/toggle-visibility`, {
                method: 'PATCH',
                headers: getAuthHeaders(),
            });
            if (!response.ok) {
                throw new Error('Không thể thay đổi trạng thái hiển thị');
            }
            return await response.json();
        } catch (error) {
            console.error("Lỗi khi thay đổi trạng thái:", error);
            throw error;
        }
    },

    async createTour(formData: FormData): Promise<Tour> {
        try {
            const headers = getAuthHeaders();
            delete (headers as any)['Content-Type']; // Xóa header để browser tự set

            const response = await fetch(`${API_URL}`, {
                method: 'POST',
                headers,
                body: formData,
            });
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || 'Không thể tạo tour');
            }
            return await response.json();
        } catch (error) {
            console.error("Lỗi khi tạo tour:", error);
            throw error;
        }
    },

    async updateTour(id: string, formData: FormData): Promise<Tour> {
        try {
            const headers = getAuthHeaders();
            delete (headers as any)['Content-Type']; // Xóa header để browser tự set

            const response = await fetch(`${API_URL}/${id}`, {
                method: 'PATCH',
                headers,
                body: formData,
            });
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || 'Không thể cập nhật tour');
            }
            return await response.json();
        } catch (error) {
            console.error("Lỗi khi cập nhật tour:", error);
            throw error;
        }
    },

    // Thêm các hàm create, update, delete ở đây nếu cần
}; 