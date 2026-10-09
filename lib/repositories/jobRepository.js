import { prisma, isDbOffline, setDbOffline } from '../prisma.js';

const mockJobs = [
    {
        id: 'job_1',
        title: 'Full Stack Software Engineer',
        companyId: 'comp_1',
        companyName: 'TechNova Solutions',
        companyLogo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=150&auto=format&fit=crop&q=80',
        department: 'Engineering',
        description: 'Build robust cloud applications with React, Node.js, and Python services.',
        responsibilities: ['Architect microservices', 'Build performant UI in Next.js', 'Collaborate with product designers'],
        requirements: ['Strong knowledge of Data Structures', 'Hands-on React & Node.js experience'],
        requiredSkills: [
            { skillName: 'React.js', minLevel: 'Intermediate' },
            { skillName: 'Python 3', minLevel: 'Intermediate' },
            { skillName: 'Data Structures & Algorithms', minLevel: 'Intermediate' }
        ],
        location: 'Bangalore, India (Hybrid)',
        workMode: 'Hybrid',
        salary: '$95,000 - $125,000 / year',
        employmentType: 'Full-time',
        minCgpa: 7.0,
        branch: 'Computer Science & Engineering',
        degree: 'B.Tech',
        graduationYear: 2026,
        matchScore: 94,
        isEligible: true,
        createdAt: new Date().toISOString()
    },
    {
        id: 'job_2',
        title: 'AI / ML Associate Engineer',
        companyId: 'comp_2',
        companyName: 'CognitiveScale AI',
        companyLogo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=150&auto=format&fit=crop&q=80',
        department: 'Machine Learning',
        description: 'Develop and fine-tune foundation models, LLM retrieval pipelines, and NLP systems.',
        responsibilities: ['Build RAG pipelines', 'Evaluate model performance', 'Implement vector database indexing'],
        requirements: ['Python proficiency', 'Deep understanding of linear algebra and statistics'],
        requiredSkills: [
            { skillName: 'Python 3', minLevel: 'Advanced' },
            { skillName: 'Data Structures & Algorithms', minLevel: 'Advanced' }
        ],
        location: 'Remote / US & India',
        workMode: 'Remote',
        salary: '$105,000 - $135,000 / year',
        minCgpa: 7.5,
        branch: 'Artificial Intelligence & Data Science, Computer Science',
        degree: 'B.Tech',
        graduationYear: 2026,
        matchScore: 89,
        isEligible: true,
        createdAt: new Date().toISOString()
    },
    {
        id: 'job_3',
        title: 'Frontend UI Platform Specialist',
        companyId: 'comp_3',
        companyName: 'Apex Cloud Digital',
        companyLogo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150&auto=format&fit=crop&q=80',
        department: 'Product Engineering',
        description: 'Lead design system implementations and user experience refinements for SaaS products.',
        responsibilities: ['Implement high-performance UI components', 'Ensure WCAG AA accessibility', 'Maintain Tailwind design tokens'],
        requirements: ['Mastery of modern JavaScript/TypeScript', 'Experience with responsive design'],
        requiredSkills: [
            { skillName: 'React.js', minLevel: 'Advanced' },
            { skillName: 'Tailwind CSS', minLevel: 'Advanced' }
        ],
        location: 'Hyderabad, India',
        workMode: 'Onsite',
        salary: '$85,000 - $110,000 / year',
        minCgpa: 6.5,
        branch: 'All Branches',
        degree: 'B.Tech',
        graduationYear: 2026,
        matchScore: 91,
        isEligible: true,
        createdAt: new Date().toISOString()
    }
];

export const jobRepository = {
    async findAll() {
        if (!isDbOffline()) {
            try {
                const jobs = await prisma.job.findMany();
                if (jobs && jobs.length > 0) return jobs;
            } catch (e) {
                setDbOffline();
                console.warn('[jobRepository] DB offline, using mock jobs:', e.message);
            }
        }
        return mockJobs;
    },
    async findById(id) {
        if (!isDbOffline()) {
            try {
                const job = await prisma.job.findUnique({
                    where: { id },
                    include: { applications: true }
                });
                if (job) return job;
            } catch (e) {
                setDbOffline();
                console.warn('[jobRepository] DB offline:', e.message);
            }
        }
        return mockJobs.find(j => j.id === id) || mockJobs[0];
    },
    async findByCompanyId(companyId) {
        if (!isDbOffline()) {
            try {
                return await prisma.job.findMany({
                    where: { companyId },
                    orderBy: { createdAt: 'desc' }
                });
            } catch (e) {
                setDbOffline();
                return mockJobs.filter(j => j.companyId === companyId);
            }
        }
        return mockJobs.filter(j => j.companyId === companyId);
    },
    async create(data) {
        if (!isDbOffline()) {
            try {
                return await prisma.job.create({ data });
            } catch (e) {
                setDbOffline();
                const newJob = { id: 'job_' + Date.now(), ...data, matchScore: 85, isEligible: true };
                mockJobs.push(newJob);
                return newJob;
            }
        }
        const newJob = { id: 'job_' + Date.now(), ...data, matchScore: 85, isEligible: true };
        mockJobs.push(newJob);
        return newJob;
    },
    async update(id, data) {
        if (!isDbOffline()) {
            try {
                return await prisma.job.update({ where: { id }, data });
            } catch (e) {
                setDbOffline();
                const job = await this.findById(id);
                Object.assign(job, data);
                return job;
            }
        }
        const job = await this.findById(id);
        Object.assign(job, data);
        return job;
    },
    async search(params = {}) {
        if (!isDbOffline()) {
            try {
                const where = {};
                if (params.companyId)
                    where.companyId = params.companyId;
                if (params.location && params.location !== 'All') {
                    where.location = { contains: params.location, mode: 'insensitive' };
                }
                if (params.workMode && params.workMode !== 'All') {
                    where.workMode = params.workMode;
                }
                if (params.employmentType && params.employmentType !== 'All') {
                    where.employmentType = params.employmentType;
                }
                if (params.query) {
                    where.title = { contains: params.query, mode: 'insensitive' };
                }
                return await prisma.job.findMany({
                    where,
                    orderBy: { createdAt: 'desc' }
                });
            } catch (e) {
                setDbOffline();
                console.warn('[jobRepository] DB offline, using mock jobs search fallback:', e.message);
                return mockJobs;
            }
        }
        return mockJobs;
    }
};
