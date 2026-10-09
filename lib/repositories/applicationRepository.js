import { prisma, isDbOffline, setDbOffline } from '../prisma.js';
import { studentRepository } from './studentRepository.js';

// Pre-seeded authentic mock applications for reliable offline & testing operation
const mockApplications = [
    {
        id: 'app_1',
        jobId: 'job_1',
        studentId: 'std_1',
        companyId: 'comp_1',
        studentName: 'Alex Rivera',
        studentEmail: 'alex.rivera@student.skill2hire.com',
        studentCollege: 'Apex University of Engineering',
        jobTitle: 'Full Stack Software Engineer',
        companyName: 'TechNova Solutions',
        matchPercentage: 91,
        status: 'Applied',
        notes: 'Initial application submitted with verified Python & React credentials.',
        interviewSchedule: null,
        interviewFeedback: null,
        appliedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 3 * 86400000).toISOString()
    },
    {
        id: 'app_2',
        jobId: 'job_1',
        studentId: 'std_2',
        companyId: 'comp_1',
        studentName: 'Samantha Chen',
        studentEmail: 'samantha.chen@student.skill2hire.com',
        studentCollege: 'Apex University of Engineering',
        jobTitle: 'Full Stack Software Engineer',
        companyName: 'TechNova Solutions',
        matchPercentage: 94,
        status: 'Under Review',
        notes: 'High CGPA (9.30) and verified algorithms expertise.',
        interviewSchedule: null,
        interviewFeedback: null,
        appliedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 86400000).toISOString()
    },
    {
        id: 'app_3',
        jobId: 'job_1',
        studentId: 'std_3',
        companyId: 'comp_1',
        studentName: 'Marcus Vance',
        studentEmail: 'marcus.vance@student.skill2hire.com',
        studentCollege: 'Metropolitan Institute of Technology',
        jobTitle: 'Full Stack Software Engineer',
        companyName: 'TechNova Solutions',
        matchPercentage: 72,
        status: 'Applied',
        notes: 'Needs additional verified backend assessments.',
        interviewSchedule: null,
        interviewFeedback: null,
        appliedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 86400000).toISOString()
    },
    {
        id: 'app_4',
        jobId: 'job_1',
        studentId: 'std_4',
        companyId: 'comp_1',
        studentName: 'Priya Sharma',
        studentEmail: 'priya.sharma@student.skill2hire.com',
        studentCollege: 'Apex University of Engineering',
        jobTitle: 'Full Stack Software Engineer',
        companyName: 'TechNova Solutions',
        matchPercentage: 88,
        status: 'Shortlisted',
        notes: 'Strong frontend portfolio and verified React certification.',
        interviewSchedule: null,
        interviewFeedback: null,
        appliedAt: new Date(Date.now() - 6 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 86400000).toISOString()
    },
    {
        id: 'app_5',
        jobId: 'job_2',
        studentId: 'std_2',
        companyId: 'comp_2',
        studentName: 'Samantha Chen',
        studentEmail: 'samantha.chen@student.skill2hire.com',
        studentCollege: 'Apex University of Engineering',
        jobTitle: 'AI / ML Associate Engineer',
        companyName: 'CognitiveScale AI',
        matchPercentage: 96,
        status: 'Shortlisted',
        notes: 'Top tier candidate for foundation model pipeline team.',
        interviewSchedule: null,
        interviewFeedback: null,
        appliedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 86400000).toISOString()
    },
    {
        id: 'app_6',
        jobId: 'job_2',
        studentId: 'std_1',
        companyId: 'comp_2',
        studentName: 'Alex Rivera',
        studentEmail: 'alex.rivera@student.skill2hire.com',
        studentCollege: 'Apex University of Engineering',
        jobTitle: 'AI / ML Associate Engineer',
        companyName: 'CognitiveScale AI',
        matchPercentage: 89,
        status: 'Interview',
        notes: 'Scheduled for Round 1 Technical Coding & Architecture.',
        interviewSchedule: {
            roundType: 'Round 1: Technical Coding & Architecture',
            date: '2026-10-14',
            time: '14:30',
            timezone: 'IST (UTC+5:30)',
            format: 'Google Meet',
            meetingLink: 'https://meet.google.com/cog-algo-live',
            interviewers: 'Dr. Aris Thorne (Principal ML Architect)',
            notes: 'Live coding on distributed queue design & algorithmic complexity.'
        },
        interviewFeedback: null,
        appliedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 86400000).toISOString()
    }
];

export const applicationRepository = {
    /**
     * Finds applications matching filters with graceful offline in-memory fallback.
     */
    async findAll(params = {}) {
        if (!isDbOffline()) {
            try {
                const where = {};
                if (params.companyId) where.companyId = params.companyId;
                if (params.jobId) where.jobId = params.jobId;
                if (params.status && params.status !== 'All') where.status = params.status;

                const list = await prisma.application.findMany({
                    where,
                    include: {
                        student: {
                            include: { skills: true }
                        }
                    },
                    orderBy: { appliedAt: 'desc' }
                });

                if (list && list.length > 0) return list;
            } catch (error) {
                setDbOffline();
            }
        }

        // Offline / In-memory querying
        let results = [...mockApplications];

        if (params.companyId) {
            results = results.filter(a => a.companyId === params.companyId);
        }
        if (params.jobId) {
            results = results.filter(a => a.jobId === params.jobId);
        }
        if (params.status && params.status !== 'All') {
            results = results.filter(a => a.status.toLowerCase() === params.status.toLowerCase());
        }

        // Attach student details & verified skills from studentRepository
        const enriched = await Promise.all(results.map(async app => {
            const student = await studentRepository.findById(app.studentId);
            const skills = student?.skills || [
                { skillName: 'Python 3', level: 'Advanced', score: 90, status: 'Verified' },
                { skillName: 'React.js', level: 'Intermediate', score: 85, status: 'Verified' }
            ];
            const verifiedSkills = skills.filter(s => s.status === 'Verified');

            return {
                ...app,
                verifiedSkills,
                student: student ? {
                    id: student.id,
                    fullName: student.fullName,
                    email: student.email,
                    phone: student.phone,
                    collegeName: student.collegeName,
                    degree: student.degree,
                    department: student.department,
                    graduationYear: student.graduationYear,
                    cgpa: student.cgpa,
                    resumeUrl: student.resumeUrl,
                    skills
                } : {
                    id: app.studentId,
                    fullName: app.studentName,
                    email: app.studentEmail,
                    collegeName: app.studentCollege,
                    skills
                }
            };
        }));

        return enriched;
    },

    /**
     * Finds single application by ID.
     */
    async findById(id) {
        if (!isDbOffline()) {
            try {
                const app = await prisma.application.findUnique({
                    where: { id },
                    include: {
                        student: {
                            include: { skills: true }
                        }
                    }
                });
                if (app) {
                    const skills = app.student?.skills || [];
                    return {
                        ...app,
                        verifiedSkills: skills.filter(s => s.status === 'Verified')
                    };
                }
            } catch (error) {
                setDbOffline();
            }
        }

        const found = mockApplications.find(a => a.id === id);
        if (!found) return null;

        const student = await studentRepository.findById(found.studentId);
        const skills = student?.skills || [
            { skillName: 'Python 3', level: 'Advanced', score: 90, status: 'Verified' }
        ];

        return {
            ...found,
            verifiedSkills: skills.filter(s => s.status === 'Verified'),
            student: student || null
        };
    },

    /**
     * Updates an application status, optional notes, and optional interview schedule.
     */
    async updateStatus(id, status, notes = '', interviewSchedule = null) {
        const updatePayload = {
            status,
            updatedAt: new Date().toISOString()
        };
        if (notes !== undefined && notes !== null) updatePayload.notes = notes;
        if (interviewSchedule !== undefined && interviewSchedule !== null) {
            updatePayload.interviewSchedule = interviewSchedule;
        }

        if (!isDbOffline()) {
            try {
                const updated = await prisma.application.update({
                    where: { id },
                    data: {
                        status,
                        notes: notes || undefined
                    }
                });
                if (updated) {
                    // If interviewSchedule was provided, attach to response
                    return { ...updated, interviewSchedule: interviewSchedule || null };
                }
            } catch (error) {
                setDbOffline();
            }
        }

        const idx = mockApplications.findIndex(a => a.id === id);
        if (idx !== -1) {
            mockApplications[idx] = {
                ...mockApplications[idx],
                ...updatePayload
            };
            return { ...mockApplications[idx] };
        }

        return null;
    },

    /**
     * Updates multiple applications in bulk.
     */
    async bulkUpdateStatus(applicationIds, status, notes = '', interviewSchedule = null) {
        if (!Array.isArray(applicationIds) || applicationIds.length === 0) {
            return [];
        }

        const updatedList = [];
        for (const id of applicationIds) {
            const updated = await this.updateStatus(id, status, notes, interviewSchedule);
            if (updated) updatedList.push(updated);
        }

        return updatedList;
    },

    /**
     * Schedules an interview for an application.
     */
    async scheduleInterview(id, interviewDetails) {
        const status = 'Interview';
        const notes = interviewDetails.notes || `Interview scheduled: ${interviewDetails.roundType || 'Technical Round'}`;
        return this.updateStatus(id, status, notes, interviewDetails);
    },

    /**
     * Creates an application (useful for demo/apply workflows).
     */
    async create(data) {
        const newApp = {
            id: `app_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            jobId: data.jobId,
            studentId: data.studentId,
            companyId: data.companyId,
            studentName: data.studentName || 'Alex Rivera',
            studentEmail: data.studentEmail || 'alex.rivera@student.skill2hire.com',
            studentCollege: data.studentCollege || 'Apex University of Engineering',
            jobTitle: data.jobTitle || 'Software Engineer',
            companyName: data.companyName || 'TechNova',
            matchPercentage: data.matchPercentage || 88,
            status: data.status || 'Applied',
            notes: data.notes || '',
            interviewSchedule: null,
            interviewFeedback: null,
            appliedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        if (!isDbOffline()) {
            try {
                const created = await prisma.application.create({ data });
                if (created) return created;
            } catch (err) {
                setDbOffline();
            }
        }

        mockApplications.unshift(newApp);
        return newApp;
    }
};
