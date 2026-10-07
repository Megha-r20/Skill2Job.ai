import { api } from './api';
export const jobApi = {
    getJobs: (params) => {
        const query = new URLSearchParams(params).toString();
        return api.get(`/jobs${query ? `?${query}` : ''}`);
    },
    getJobById: (id) => {
        return api.get(`/jobs/${id}`);
    },
    applyForJob: (id, coverLetter) => {
        return api.post(`/jobs/${id}/apply`, { coverLetter });
    }
};
