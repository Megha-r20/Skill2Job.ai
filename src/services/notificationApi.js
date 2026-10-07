import { api } from './api';
export const notificationApi = {
    getNotifications: () => {
        return api.get('/notifications');
    }
};
