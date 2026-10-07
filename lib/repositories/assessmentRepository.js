import { prisma } from '../prisma';
export const assessmentRepository = {
    async findAll() {
        return prisma.assessment.findMany();
    },
    async findById(id) {
        return prisma.assessment.findUnique({ where: { id } });
    },
    async getQuestions(assessmentId) {
        return prisma.assessmentQuestion.findMany({ where: { assessmentId } });
    }
};
