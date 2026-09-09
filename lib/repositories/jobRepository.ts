import { prisma } from '../prisma';

export const jobRepository = {
  async findAll() {
    return prisma.job.findMany();
  },

  async findById(id: string) {
    return prisma.job.findUnique({
      where: { id },
      include: { applications: true }
    });
  },

  async findByCompanyId(companyId: string) {
    return prisma.job.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' }
    });
  },

  async create(data: any) {
    return prisma.job.create({ data });
  },

  async update(id: string, data: any) {
    return prisma.job.update({ where: { id }, data });
  },

  async search(params: any) {
    const where: any = {};
    if (params.companyId) where.companyId = params.companyId;
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
    return prisma.job.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
  }
};
