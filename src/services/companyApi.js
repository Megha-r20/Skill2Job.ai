import { api } from './api';
export const companyApi = {
    getProfile: () => {
        return api.get('/companies/profile');
    },
    getJobs: () => {
        return api.get('/companies/jobs');
    },
    createJob: (payload) => {
        return api.post('/companies/jobs', payload);
    },
    getJobApplications: (jobId) => {
        return api.get(`/companies/jobs/${jobId}/applications`);
    },
    updateApplicationStatus: (applicationId, status, notes) => {
        return api.put(`/companies/applications/${applicationId}/status`, { status, notes });
    }
};
