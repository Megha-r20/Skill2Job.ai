import { api } from './api';
export const authApi = {
    register: (payload) => {
        return api.post('/auth/register', payload);
    },
    login: (payload) => {
        return api.post('/auth/login', payload);
    },
    sendOtp: (payload) => {
        return api.post('/auth/send-otp', payload);
    },
    verifyOtp: (payload) => {
        return api.post('/auth/verify-otp', payload);
    },
    getMe: () => {
        return api.get('/auth/me');
    },
    logout: () => {
        return api.post('/auth/logout', {});
    }
};
