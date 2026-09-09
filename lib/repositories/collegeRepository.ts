import { prisma } from '../prisma';

export const collegeRepository = {
  async findAll() {
    return prisma.college.findMany();
  },
  async findById(id: string) {
    return prisma.college.findUnique({ where: { id } });
  },
  async findByUserId(userId: string) {
    return prisma.college.findUnique({ where: { userId } });
  }
};
