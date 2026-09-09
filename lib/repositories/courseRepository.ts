import { prisma } from '../prisma';

export const courseRepository = {
  async findAll() {
    return prisma.course.findMany({ include: { lessons: true } });
  },
  async findById(id: string) {
    return prisma.course.findUnique({ where: { id }, include: { lessons: true } });
  }
};
