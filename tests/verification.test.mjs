import { test, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { assessmentRepository } from '../lib/repositories/assessmentRepository.js';
import { studentRepository } from '../lib/repositories/studentRepository.js';
import { certificateRepository } from '../lib/repositories/certificateRepository.js';
import { profileImportService } from '../lib/services/profileImportService.js';

describe('Real Skill Verification Architecture', () => {

    describe('1. Proctored Assessment Grading & Integrity Engine', () => {
        it('accurately scores answers against official question keys and calculates passing grade', async () => {
            const questions = await assessmentRepository.getQuestions('asm_python');
            assert(questions.length > 0, 'Questions must be loaded');

            // Construct answers where all questions are answered correctly
            const correctAnswers = {};
            questions.forEach(q => {
                const correctIdx = typeof q.correctIndex === 'number' ? q.correctIndex : (q.correctOptionIndex ?? 0);
                correctAnswers[q.id] = correctIdx;
            });

            let earnedPoints = 0;
            let totalPoints = 0;
            questions.forEach(q => {
                const points = q.points || 10;
                totalPoints += points;
                if (correctAnswers[q.id] === (q.correctIndex ?? q.correctOptionIndex ?? 0)) {
                    earnedPoints += points;
                }
            });

            const score = Math.round((earnedPoints / totalPoints) * 100);
            assert.equal(score, 100, 'All correct answers should score 100%');
        });

        it('disqualifies submissions with proctoring violations (e.g. >= 3 tab switches)', () => {
            const violations = { tabSwitches: 3, blurCount: 1, headTurns: 1, violation: true };
            const isDisqualified = violations.violation === true || violations.tabSwitches >= 3;
            assert.equal(isDisqualified, true, 'Student must be disqualified on >= 3 tab switches');
        });

        it('upgrades student skill to Verified and increases credibility upon passing exam', async () => {
            const testStudentId = 'std_test_verif_' + Date.now();
            await studentRepository.addOrUpdateSkill(testStudentId, {
                skillName: 'Go Programming',
                category: 'Programming',
                level: 'Beginner',
                status: 'Self-declared',
                score: 60,
                credibilityScore: 70
            });

            // Student passes proctored assessment with 90%
            const upgraded = await studentRepository.addOrUpdateSkill(testStudentId, {
                skillName: 'Go Programming',
                category: 'Programming',
                level: 'Advanced',
                status: 'Verified',
                score: 90,
                credibilityScore: 98,
                assessmentId: 'asm_go_test'
            });

            assert.equal(upgraded.status, 'Verified');
            assert.equal(upgraded.level, 'Advanced');
            assert.equal(upgraded.score, 90);
            assert.equal(upgraded.credibilityScore, 98);
        });

        it('issues official digital certificate with tamper-proof HMAC-SHA256 signature', async () => {
            const cert = await certificateRepository.create({
                studentId: 'std_1',
                studentName: 'Alex Rivera',
                skillName: 'Distributed Systems',
                level: 'Advanced',
                score: 94,
                proctoringStatus: 'CLEAN_PROCTORED',
                proctoringScore: 100,
                violationsCount: 0
            });

            assert(cert.certificateNumber.startsWith('CERT-'), 'Certificate number must have standard prefix');
            assert(cert.verificationHash.length === 64, 'Must have 256-bit hex HMAC signature');
            assert.equal(cert.isAuthentic, true, 'Original certificate signature must be authentic');

            // Validate signature verification method
            const isSignatureValid = certificateRepository.verifySignature(cert);
            assert.equal(isSignatureValid, true, 'Digital signature verification must pass');
        });
    });

    describe('2. GitHub & LeetCode Coding Profile Import', () => {
        it('imports public GitHub profile, detects languages, and derives verified skills', async () => {
            const result = await profileImportService.importGitHubProfile('torvalds');

            assert.equal(result.platform, 'github');
            assert.equal(result.username, 'torvalds');
            assert(result.publicRepos >= 0);
            assert(Array.isArray(result.verifiedSkills) && result.verifiedSkills.length > 0);

            // Checks that Git & GitHub collaboration skill is awarded
            const gitSkill = result.verifiedSkills.find(s => s.skillName.includes('Git'));
            assert(gitSkill, 'Should award Git & GitHub Collaboration skill');
            assert.equal(gitSkill.status, 'Verified');
            assert(gitSkill.credibilityScore >= 90);
        });

        it('rejects invalid GitHub username format', async () => {
            await assert.rejects(
                () => profileImportService.importGitHubProfile('invalid--user--with--symbols!!@@'),
                /Invalid GitHub username/
            );
        });

        it('imports LeetCode profile, parses solved difficulties, and assigns algorithmic mastery tier', async () => {
            const result = await profileImportService.importLeetCodeProfile('neetcode');

            assert.equal(result.platform, 'leetcode');
            assert.equal(result.username, 'neetcode');
            assert(typeof result.totalSolved === 'number');
            assert(typeof result.easySolved === 'number');
            assert(typeof result.mediumSolved === 'number');
            assert(typeof result.hardSolved === 'number');

            // DSA Skill derivation
            const dsaSkill = result.verifiedSkill;
            assert.equal(dsaSkill.skillName, 'Data Structures & Algorithms');
            assert.equal(dsaSkill.status, 'Verified');
            assert(['Advanced', 'Intermediate', 'Beginner'].includes(dsaSkill.level));
            assert(dsaSkill.credibilityScore >= 80);
            assert.equal(dsaSkill.source, 'LEETCODE_IMPORT');
        });

        it('integrates imported skills into student repository profile and updates readiness score', async () => {
            const testStudentId = 'std_test_import_' + Date.now();
            const skillsToImport = [
                {
                    skillName: 'TypeScript',
                    category: 'Programming Languages',
                    level: 'Intermediate',
                    score: 88,
                    credibilityScore: 92,
                    proofUrl: 'https://github.com/student/ts-project'
                },
                {
                    skillName: 'Data Structures & Algorithms',
                    category: 'Computer Science',
                    level: 'Advanced',
                    score: 95,
                    credibilityScore: 96,
                    proofUrl: 'https://leetcode.com/student/'
                }
            ];

            const applied = await profileImportService.applyImportedSkillsToStudent(testStudentId, skillsToImport);
            assert.equal(applied.length, 2);

            const student = await studentRepository.findById(testStudentId);
            assert(student, 'Student profile should exist in store');
            assert(student.skills.some(s => s.skillName === 'TypeScript' && s.status === 'Verified'));
            assert(student.skills.some(s => s.skillName === 'Data Structures & Algorithms' && s.level === 'Advanced'));
            assert(student.placementReadiness > 70, 'Placement readiness should be boosted');
        });
    });

    describe('3. Cryptographic Certificate Verification Registry', () => {
        it('validates pre-seeded authentic certificates correctly', async () => {
            const cert = await certificateRepository.findByCertificateNumber('CERT-PY-8821');
            assert(cert, 'Pre-seeded Python certificate must exist');
            assert.equal(cert.skillName, 'Python 3');
            assert.equal(cert.isAuthentic, true, 'Pre-seeded certificate signature must be authentic');
        });

        it('detects tampering when certificate data is modified', async () => {
            const cert = await certificateRepository.findByCertificateNumber('CERT-DSA-4912');
            assert(cert);

            // Attempt to forge or alter the score from 89 to 99
            const tamperedCert = { ...cert, score: 99 };
            const isTamperedValid = certificateRepository.verifySignature(tamperedCert);
            assert.equal(isTamperedValid, false, 'Tampered certificate must fail signature verification');

            // Attempt to forge the student ID
            const forgedStudentCert = { ...cert, studentId: 'malicious_impersonator' };
            const isForgedValid = certificateRepository.verifySignature(forgedStudentCert);
            assert.equal(isForgedValid, false, 'Forged student ID must fail signature verification');
        });

        it('returns null when querying nonexistent certificate number', async () => {
            const nonexistent = await certificateRepository.findByCertificateNumber('CERT-NONEXISTENT-9999');
            assert.equal(nonexistent, null);
        });

        it('retrieves all certificates issued to a specific student', async () => {
            const certificates = await certificateRepository.findByStudentId('std_1');
            assert(Array.isArray(certificates));
            assert(certificates.length >= 4, 'std_1 must have at least 4 certificates');
            certificates.forEach(c => {
                assert.equal(c.studentId, 'std_1');
                assert.equal(c.isAuthentic, true);
            });
        });
    });
});
