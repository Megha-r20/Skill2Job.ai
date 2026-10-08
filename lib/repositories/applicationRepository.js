import { prisma } from '../prisma.js';
export const applicationRepository = {
    async findAll(params) {
        const where = {};
        if (params.companyId)
            where.companyId = params.companyId;
        if (params.jobId)
            where.jobId = params.jobId;
        if (params.status && params.status !== 'All')
            where.status = params.status;
        return prisma.application.findMany({
            where,
            include: {
                student: {
                    include: { skills: true }
                }
            },
            orderBy: { appliedAt: 'desc' }
        });
    },
    async findById(id) {
        return prisma.application.findUnique({
            where: { id }
        });
    },
    async updateStatus(id, status, notes) {
        return prisma.application.update({
            where: { id },
            data: { status, notes }
        });
    }
};
