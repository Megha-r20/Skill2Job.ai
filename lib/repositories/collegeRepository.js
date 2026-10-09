import { prisma, isDbOffline, setDbOffline } from '../prisma.js';

const mockColleges = [
    { id: 'col_1', userId: 'u_col_1', name: 'Apex University' },
    { id: 'col_apex', userId: 'u_col_apex', name: 'Apex University of Engineering' }
];

export const collegeRepository = {
    async findAll() {
        if (!isDbOffline()) {
            try {
                return await prisma.college.findMany();
            } catch (e) {
                setDbOffline();
            }
        }
        return mockColleges;
    },
    async findById(id) {
        if (!isDbOffline()) {
            try {
                return await prisma.college.findUnique({ where: { id } });
            } catch (e) {
                setDbOffline();
            }
        }
        return mockColleges.find(c => c.id === id) || null;
    },
    async findByUserId(userId) {
        if (!isDbOffline()) {
            try {
                return await prisma.college.findUnique({ where: { userId } });
            } catch (e) {
                setDbOffline();
            }
        }
        return mockColleges.find(c => c.userId === userId) || null;
    }
};
