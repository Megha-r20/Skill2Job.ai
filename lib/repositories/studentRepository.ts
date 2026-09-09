import { prisma } from '../prisma';

export const studentRepository = {
  async findAll() {
    return prisma.student.findMany();
  },

  async findById(id: string) {
    return prisma.student.findUnique({
      where: { id },
      include: {
        skills: true,
        applications: true
      }
    });
  },

  async findByUserId(userId: string) {
    return prisma.student.findUnique({
      where: { userId },
      include: {
        skills: true,
        applications: true
      }
    });
  },

  async update(id: string, data: any) {
    return prisma.student.update({
      where: { id },
      data
    });
  },

  async getApplications(studentId: string) {
    return prisma.application.findMany({
      where: { studentId },
      include: { job: true },
      orderBy: { appliedAt: 'desc' }
    });
  },

  async getSkills(studentId: string) {
    return prisma.studentSkill.findMany({
      where: { studentId }
    });
  }
};
