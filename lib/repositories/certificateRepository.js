import crypto from 'node:crypto';
import { prisma, isDbOffline, setDbOffline } from '../prisma.js';

function getSigningSecret() {
    return process.env.JWT_SECRET || 'skill2hire-secret-verification-key-2026';
}

function generateVerificationHash({ certificateNumber, studentId, skillName, score, issuedDate }) {
    const payload = `${certificateNumber}:${studentId}:${skillName}:${score}:${issuedDate}`;
    return crypto.createHmac('sha256', getSigningSecret()).update(payload).digest('hex');
}

const INITIAL_CERTIFICATES = [
    {
        id: 'cert_py_1',
        certificateNumber: 'CERT-PY-8821',
        studentId: 'std_1',
        studentName: 'Alex Rivera',
        studentEmail: 'alex.rivera@student.skill2hire.com',
        collegeName: 'Apex University of Engineering',
        skillName: 'Python 3',
        skillCategory: 'Programming',
        level: 'Advanced',
        score: 92,
        proctoringStatus: 'CLEAN_PROCTORED',
        proctoringScore: 100,
        violationsCount: 0,
        issuedDate: '2026-08-25T10:00:00.000Z',
        issuer: 'Skill2Hire Academic Evaluation Council',
        isValid: true
    },
    {
        id: 'cert_dsa_1',
        certificateNumber: 'CERT-DSA-4912',
        studentId: 'std_1',
        studentName: 'Alex Rivera',
        studentEmail: 'alex.rivera@student.skill2hire.com',
        collegeName: 'Apex University of Engineering',
        skillName: 'Data Structures & Algorithms',
        skillCategory: 'Computer Science',
        level: 'Advanced',
        score: 89,
        proctoringStatus: 'CLEAN_PROCTORED',
        proctoringScore: 100,
        violationsCount: 0,
        issuedDate: '2026-08-28T14:30:00.000Z',
        issuer: 'Skill2Hire Academic Evaluation Council',
        isValid: true
    },
    {
        id: 'cert_sql_1',
        certificateNumber: 'CERT-SQL-3104',
        studentId: 'std_1',
        studentName: 'Alex Rivera',
        studentEmail: 'alex.rivera@student.skill2hire.com',
        collegeName: 'Apex University of Engineering',
        skillName: 'SQL & Database Design',
        skillCategory: 'Database Engineering',
        level: 'Intermediate',
        score: 82,
        proctoringStatus: 'CLEAN_PROCTORED',
        proctoringScore: 100,
        violationsCount: 0,
        issuedDate: '2026-09-02T11:15:00.000Z',
        issuer: 'Skill2Hire Academic Evaluation Council',
        isValid: true
    },
    {
        id: 'cert_react_1',
        certificateNumber: 'CERT-REACT-5120',
        studentId: 'std_1',
        studentName: 'Alex Rivera',
        studentEmail: 'alex.rivera@student.skill2hire.com',
        collegeName: 'Apex University of Engineering',
        skillName: 'React.js',
        skillCategory: 'Frontend Web Development',
        level: 'Intermediate',
        score: 85,
        proctoringStatus: 'CLEAN_PROCTORED',
        proctoringScore: 100,
        violationsCount: 0,
        issuedDate: '2026-09-10T16:45:00.000Z',
        issuer: 'Skill2Hire Academic Evaluation Council',
        isValid: true
    }
].map(cert => ({
    ...cert,
    verificationHash: generateVerificationHash(cert),
    verificationUrl: `/verify/${cert.certificateNumber}`
}));

const inMemoryCertificates = [...INITIAL_CERTIFICATES];

export const certificateRepository = {
    generateVerificationHash,

    verifySignature(certificate) {
        if (!certificate || !certificate.verificationHash) return false;
        const expectedHash = generateVerificationHash({
            certificateNumber: certificate.certificateNumber,
            studentId: certificate.studentId,
            skillName: certificate.skillName,
            score: certificate.score,
            issuedDate: certificate.issuedDate
        });
        return crypto.timingSafeEqual(
            Buffer.from(certificate.verificationHash, 'utf8'),
            Buffer.from(expectedHash, 'utf8')
        );
    },

    async create(data) {
        const certificateNumber = data.certificateNumber || `CERT-${(data.skillName || 'SKILL').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5)}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
        const issuedDate = data.issuedDate || new Date().toISOString();
        const score = typeof data.score === 'number' ? data.score : 85;

        const hash = generateVerificationHash({
            certificateNumber,
            studentId: data.studentId,
            skillName: data.skillName,
            score,
            issuedDate
        });

        const newCert = {
            id: `cert_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            certificateNumber,
            studentId: data.studentId,
            studentName: data.studentName || 'Student Candidate',
            studentEmail: data.studentEmail || null,
            collegeName: data.collegeName || 'Accredited University',
            skillName: data.skillName,
            skillCategory: data.skillCategory || 'Technical Capability',
            level: data.level || (score >= 85 ? 'Advanced' : 'Intermediate'),
            score,
            proctoringStatus: data.proctoringStatus || 'CLEAN_PROCTORED',
            proctoringScore: typeof data.proctoringScore === 'number' ? data.proctoringScore : 100,
            violationsCount: typeof data.violationsCount === 'number' ? data.violationsCount : 0,
            issuedDate,
            verificationHash: hash,
            verificationUrl: `/verify/${certificateNumber}`,
            issuer: 'Skill2Hire Academic Evaluation Council',
            isValid: true,
            isAuthentic: true,
            metadata: data.metadata || null
        };

        if (!isDbOffline()) {
            try {
                if (prisma.certificate) {
                    const dbCert = await prisma.certificate.create({
                        data: {
                            certificateNumber: newCert.certificateNumber,
                            studentId: newCert.studentId,
                            studentName: newCert.studentName,
                            studentEmail: newCert.studentEmail,
                            collegeName: newCert.collegeName,
                            skillName: newCert.skillName,
                            category: newCert.skillCategory,
                            level: newCert.level,
                            score: newCert.score,
                            proctoringStatus: newCert.proctoringStatus,
                            verificationHash: newCert.verificationHash,
                            issuedDate: new Date(newCert.issuedDate),
                            metadata: newCert.metadata
                        }
                    });
                    return { ...newCert, id: dbCert.id };
                }
            } catch (e) {
                setDbOffline();
                console.warn('[certificateRepository] DB offline, saved certificate to in-memory store:', e.message);
            }
        }

        inMemoryCertificates.push(newCert);
        return newCert;
    },

    async findByCertificateNumber(certNumber) {
        if (!certNumber) return null;
        const normalized = certNumber.trim().toUpperCase();

        if (!isDbOffline()) {
            try {
                if (prisma.certificate) {
                    const dbCert = await prisma.certificate.findUnique({
                        where: { certificateNumber: normalized }
                    });
                    if (dbCert) {
                        const certObj = {
                            ...dbCert,
                            issuedDate: dbCert.issuedDate.toISOString(),
                            verificationUrl: `/verify/${dbCert.certificateNumber}`,
                            isValid: true
                        };
                        certObj.isAuthentic = this.verifySignature(certObj);
                        return certObj;
                    }
                }
            } catch (e) {
                setDbOffline();
                console.warn('[certificateRepository] DB offline, searching in-memory certificates for:', normalized);
            }
        }

        const found = inMemoryCertificates.find(c => 
            c.certificateNumber.toUpperCase() === normalized || 
            c.id === certNumber
        );

        if (found) {
            return {
                ...found,
                isAuthentic: this.verifySignature(found)
            };
        }

        return null;
    },

    async findByStudentId(studentId) {
        if (!studentId) return [];

        if (!isDbOffline()) {
            try {
                if (prisma.certificate) {
                    const dbList = await prisma.certificate.findMany({
                        where: { studentId },
                        orderBy: { issuedDate: 'desc' }
                    });
                    if (dbList && dbList.length > 0) {
                        return dbList.map(c => ({
                            ...c,
                            issuedDate: c.issuedDate.toISOString(),
                            verificationUrl: `/verify/${c.certificateNumber}`,
                            isValid: true,
                            isAuthentic: this.verifySignature(c)
                        }));
                    }
                }
            } catch (e) {
                setDbOffline();
                console.warn('[certificateRepository] DB offline, filtering in-memory certificates for student:', studentId);
            }
        }

        return inMemoryCertificates
            .filter(c => c.studentId === studentId)
            .map(c => ({
                ...c,
                isAuthentic: this.verifySignature(c)
            }));
    },

    async findAll() {
        return inMemoryCertificates.map(c => ({
            ...c,
            isAuthentic: this.verifySignature(c)
        }));
    }
};
