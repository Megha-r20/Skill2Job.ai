import { prisma } from '../prisma';

export const applicationRepository = {
  async findAll(params: { companyId?: string | null, jobId?: string | null, status?: string | null }) {
    const where: any = {};
    if (params.companyId) where.companyId = params.companyId;
    if (params.jobId) where.jobId = params.jobId;
    if (params.status && params.status !== 'All') where.status = params.status;

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

  async findById(id: string) {
    return prisma.application.findUnique({
      where: { id }
    });
  },

  async updateStatus(id: string, status: string, notes?: string) {
    return prisma.application.update({
      where: { id },
      data: { status, notes }
    });
  }
};
