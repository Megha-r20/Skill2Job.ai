import { api } from './api';
export const collegeApi = {
    getProfile: () => {
        return api.get('/colleges/profile');
    },
    getStudents: () => {
        return api.get('/colleges/students');
    },
    getPlacements: () => {
        return api.get('/colleges/placements');
    }
};
