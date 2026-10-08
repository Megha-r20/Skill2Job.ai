import { prisma } from '../prisma.js';

const mockColleges = [
    { id: 'col_1', userId: 'u_col_1', name: 'Apex University' },
    { id: 'col_apex', userId: 'u_col_apex', name: 'Apex University of Engineering' }
];

export const collegeRepository = {
    async findAll() {
        try {
            return await prisma.college.findMany();
        } catch (e) {
            return mockColleges;
        }
    },
    async findById(id) {
        try {
            return await prisma.college.findUnique({ where: { id } });
        } catch (e) {
            return mockColleges.find(c => c.id === id) || null;
        }
    },
    async findByUserId(userId) {
        try {
            return await prisma.college.findUnique({ where: { userId } });
        } catch (e) {
            return mockColleges.find(c => c.userId === userId) || null;
        }
    }
};
