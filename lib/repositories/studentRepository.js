import { prisma } from '../prisma.js';

const mockStudents = [
    {
        id: 'std_1',
        userId: 'u_student_1',
        fullName: 'Alex Rivera',
        email: 'alex.rivera@student.skill2hire.com',
        phone: '+91 98765 43210',
        collegeId: 'col_1',
        collegeName: 'Apex University of Engineering',
        department: 'Computer Science & Engineering',
        degree: 'B.Tech',
        graduationYear: 2026,
        cgpa: 8.85,
        placementStatus: 'Verified Candidate',
        placementReadiness: 88,
        skills: [
            { id: 'sk_1', skillName: 'Python 3', level: 'Advanced', score: 92, status: 'Verified' },
            { id: 'sk_2', skillName: 'React.js', level: 'Intermediate', score: 85, status: 'Verified' },
            { id: 'sk_3', skillName: 'Data Structures & Algorithms', level: 'Advanced', score: 89, status: 'Verified' },
            { id: 'sk_4', skillName: 'SQL & Database Design', level: 'Intermediate', score: 82, status: 'Verified' },
        ],
        applications: []
    },
    {
        id: 'std_2',
        userId: 'u_student_2',
        fullName: 'Samantha Chen',
        email: 'samantha.chen@student.skill2hire.com',
        phone: '+91 98765 43220',
        collegeId: 'col_1',
        collegeName: 'Apex University of Engineering',
        department: 'Artificial Intelligence & Data Science',
        degree: 'B.Tech',
        graduationYear: 2026,
        cgpa: 9.30,
        placementStatus: 'Verified Candidate',
        placementReadiness: 94,
        skills: [
            { id: 'sk_21', skillName: 'Python 3', level: 'Advanced', score: 96, status: 'Verified' },
            { id: 'sk_22', skillName: 'Machine Learning', level: 'Advanced', score: 91, status: 'Verified' },
            { id: 'sk_23', skillName: 'Data Structures & Algorithms', level: 'Advanced', score: 90, status: 'Verified' },
            { id: 'sk_24', skillName: 'SQL & Database Design', level: 'Intermediate', score: 86, status: 'Verified' }
        ],
        applications: []
    },
    {
        id: 'std_3',
        userId: 'u_student_3',
        fullName: 'Marcus Vance',
        email: 'marcus.vance@student.skill2hire.com',
        phone: '+91 98765 43230',
        collegeId: 'col_2',
        collegeName: 'Metropolitan Institute of Technology',
        department: 'Information Technology',
        degree: 'B.Tech',
        graduationYear: 2025,
        cgpa: 7.20,
        placementStatus: 'Training Required',
        placementReadiness: 62,
        skills: [
            { id: 'sk_31', skillName: 'JavaScript', level: 'Intermediate', score: 70, status: 'Verified' },
            { id: 'sk_32', skillName: 'HTML & CSS', level: 'Intermediate', score: 75, status: 'Verified' },
            { id: 'sk_33', skillName: 'React.js', level: 'Beginner', score: 58, status: 'Self-declared' }
        ],
        applications: []
    }
];

export const studentRepository = {
    async findAll() {
        try {
            const list = await prisma.student.findMany({
                include: { skills: true, applications: true }
            });
            if (list && list.length > 0) return list;
        } catch (e) {
            console.warn('[studentRepository] DB offline, using mock students:', e.message);
        }
        return mockStudents;
    },
    async findById(id) {
        try {
            const student = await prisma.student.findUnique({
                where: { id },
                include: {
                    skills: true,
                    applications: true
                }
            });
            if (student) return student;
        } catch (e) {
            console.warn('[studentRepository] DB offline, using mock student for ID:', id);
        }
        const found = mockStudents.find(s => s.id === id || s.userId === id);
        if (found) return found;
        return null;
    },
    async findByUserId(userId) {
        try {
            return await prisma.student.findUnique({
                where: { userId },
                include: {
                    skills: true,
                    applications: true
                }
            });
        } catch (e) {
            console.warn('[studentRepository] DB offline, using mock student for userId:', userId);
            const found = mockStudents.find(s => s.userId === userId || s.id === userId);
            if (found) return found;
            return null;
        }
    },
    async update(id, data) {
        try {
            return await prisma.student.update({
                where: { id },
                data
            });
        } catch (e) {
            const student = await this.findById(id);
            Object.assign(student, data);
            return student;
        }
    },
    async getApplications(studentId) {
        try {
            return await prisma.application.findMany({
                where: { studentId },
                include: { job: true },
                orderBy: { appliedAt: 'desc' }
            });
        } catch (e) {
            return [];
        }
    },
    async getSkills(studentId) {
        try {
            return await prisma.studentSkill.findMany({
                where: { studentId }
            });
        } catch (e) {
            const student = await this.findById(studentId);
            return student?.skills || [];
        }
    }
};
