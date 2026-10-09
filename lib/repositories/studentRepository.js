import { prisma, isDbOffline, setDbOffline } from '../prisma.js';

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
        if (!isDbOffline()) {
            try {
                const list = await prisma.student.findMany({
                    include: { skills: true, applications: true }
                });
                if (list && list.length > 0) return list;
            } catch (e) {
                setDbOffline();
                console.warn('[studentRepository] DB offline, using mock students:', e.message);
            }
        }
        return mockStudents;
    },
    async findById(id) {
        if (!isDbOffline()) {
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
                setDbOffline();
                console.warn('[studentRepository] DB offline, using mock student for ID:', id);
            }
        }
        const found = mockStudents.find(s => s.id === id || s.userId === id);
        if (found) return found;
        return null;
    },
    async findByUserId(userId) {
        if (!isDbOffline()) {
            try {
                const student = await prisma.student.findUnique({
                    where: { userId },
                    include: {
                        skills: true,
                        applications: true
                    }
                });
                if (student) return student;
            } catch (e) {
                setDbOffline();
                console.warn('[studentRepository] DB offline, using mock student for userId:', userId);
            }
        }
        const found = mockStudents.find(s => s.userId === userId || s.id === userId);
        if (found) return found;
        return null;
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
    },
    async addOrUpdateSkill(studentId, skillData) {
        let student = await this.findById(studentId);
        if (!student) {
            student = {
                id: studentId,
                fullName: 'Candidate',
                skills: [],
                placementReadiness: 60,
                placementStatus: 'Assessment Ready'
            };
            mockStudents.push(student);
        }

        if (!student.skills) student.skills = [];

        const normalizedName = (skillData.skillName || '').trim().toLowerCase();
        const existingIdx = student.skills.findIndex(s => 
            (s.skillName || '').trim().toLowerCase() === normalizedName
        );

        const newSkillRecord = {
            id: skillData.id || `sk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            studentId,
            skillId: skillData.skillId || `sk_${normalizedName.replace(/\s+/g, '_')}`,
            skillName: skillData.skillName,
            category: skillData.category || 'Technical Capability',
            status: skillData.status || 'Verified',
            level: skillData.level || 'Intermediate',
            score: typeof skillData.score === 'number' ? skillData.score : 85,
            credibilityScore: typeof skillData.credibilityScore === 'number' ? skillData.credibilityScore : 90,
            verifiedAt: skillData.verifiedAt || new Date().toISOString(),
            assessmentId: skillData.assessmentId || null,
            proofUrl: skillData.proofUrl || null
        };

        if (existingIdx !== -1) {
            student.skills[existingIdx] = {
                ...student.skills[existingIdx],
                ...newSkillRecord,
                id: student.skills[existingIdx].id
            };
        } else {
            student.skills.push(newSkillRecord);
        }

        if (!isDbOffline()) {
            try {
                if (prisma.studentSkill) {
                    if (existingIdx !== -1 && student.skills[existingIdx].id) {
                        await prisma.studentSkill.update({
                            where: { id: student.skills[existingIdx].id },
                            data: {
                                status: newSkillRecord.status,
                                level: newSkillRecord.level,
                                score: newSkillRecord.score,
                                credibilityScore: newSkillRecord.credibilityScore,
                                verifiedAt: new Date(newSkillRecord.verifiedAt),
                                assessmentId: newSkillRecord.assessmentId
                            }
                        });
                    } else {
                        await prisma.studentSkill.create({
                            data: {
                                studentId,
                                skillId: newSkillRecord.skillId,
                                skillName: newSkillRecord.skillName,
                                category: newSkillRecord.category,
                                status: newSkillRecord.status,
                                level: newSkillRecord.level,
                                score: newSkillRecord.score,
                                credibilityScore: newSkillRecord.credibilityScore,
                                verifiedAt: new Date(newSkillRecord.verifiedAt),
                                assessmentId: newSkillRecord.assessmentId
                            }
                        });
                    }
                }
            } catch (e) {
                setDbOffline();
                console.warn('[studentRepository] DB offline, skill updated in-memory store:', e.message);
            }
        }

        return existingIdx !== -1 ? student.skills[existingIdx] : newSkillRecord;
    },

    async updatePlacementReadiness(studentId) {
        const student = await this.findById(studentId);
        if (!student) return;

        const skills = student.skills || [];
        const verifiedSkills = skills.filter(s => s.status === 'Verified');
        const avgScore = verifiedSkills.length > 0 
            ? verifiedSkills.reduce((acc, s) => acc + (s.score || 80), 0) / verifiedSkills.length 
            : 60;
        
        const countBonus = Math.min(25, verifiedSkills.length * 5);
        const newReadiness = Math.min(98, Math.round(avgScore * 0.7 + countBonus));
        
        student.placementReadiness = newReadiness;
        student.placementStatus = newReadiness >= 85 ? 'Verified Candidate' : 'Assessment Ready';

        try {
            if (prisma.student) {
                await prisma.student.update({
                    where: { id: studentId },
                    data: {
                        placementReadiness: newReadiness,
                        placementStatus: student.placementStatus
                    }
                });
            }
        } catch (e) {}

        return newReadiness;
    }
};
