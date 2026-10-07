import { prisma } from '../prisma';
export const studentRepository = {
    async findAll() {
        return prisma.student.findMany();
    },
    async findById(id) {
        return prisma.student.findUnique({
            where: { id },
            include: {
                skills: true,
                applications: true
            }
        });
    },
    async findByUserId(userId) {
        return prisma.student.findUnique({
            where: { userId },
            include: {
                skills: true,
                applications: true
            }
        });
    },
    async update(id, data) {
        return prisma.student.update({
            where: { id },
            data
        });
    },
    async getApplications(studentId) {
        return prisma.application.findMany({
            where: { studentId },
            include: { job: true },
            orderBy: { appliedAt: 'desc' }
        });
    },
    async getSkills(studentId) {
        return prisma.studentSkill.findMany({
            where: { studentId }
        });
    }
};
