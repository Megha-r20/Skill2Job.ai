import { prisma } from '../prisma';
export const collegeRepository = {
    async findAll() {
        return prisma.college.findMany();
    },
    async findById(id) {
        return prisma.college.findUnique({ where: { id } });
    },
    async findByUserId(userId) {
        return prisma.college.findUnique({ where: { userId } });
    }
};
