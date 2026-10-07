const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
class ApiClient {
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('s2h_token');
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }
        return headers;
    }
    async get(endpoint) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            return await response.json();
        }
        catch (error) {
            console.error(`[API GET ERROR] ${endpoint}:`, error);
            return { success: false, message: error.message || 'Network request failed' };
        }
    }
    async post(endpoint, body) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(body)
            });
            return await response.json();
        }
        catch (error) {
            console.error(`[API POST ERROR] ${endpoint}:`, error);
            return { success: false, message: error.message || 'Network request failed' };
        }
    }
    async put(endpoint, body) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(body)
            });
            return await response.json();
        }
        catch (error) {
            console.error(`[API PUT ERROR] ${endpoint}:`, error);
            return { success: false, message: error.message || 'Network request failed' };
        }
    }
    async delete(endpoint) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });
            return await response.json();
        }
        catch (error) {
            console.error(`[API DELETE ERROR] ${endpoint}:`, error);
            return { success: false, message: error.message || 'Network request failed' };
        }
    }
}
export const api = new ApiClient();
