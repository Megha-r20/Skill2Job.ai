import { api } from './api';
export const studentApi = {
    getProfile: () => {
        return api.get('/students/profile');
    },
    getSkills: () => {
        return api.get('/students/skills');
    },
    getApplications: () => {
        return api.get('/students/applications');
    },
    getRecommendations: () => {
        return api.get('/students/recommendations');
    },
    applyForJob: (jobId, payload) => {
        return api.post(`/jobs/${jobId}/apply`, payload || {});
    }
};
