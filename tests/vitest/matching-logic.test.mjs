import { describe, it, expect } from 'vitest';
import { setDbOffline } from '../../lib/prisma.js';

setDbOffline();

import {
    normalizeSkill,
    evaluateCgpaEligibility,
    evaluateBranchEligibility,
    calculateJobMatch,
    calculatePlacementProbability
} from '../../lib/ai.js';

describe('Vitest Suite: Real Match & Placement Algorithm', () => {
    describe('1. Skill Normalization Engine', () => {
        it('normalizes common aliases and variations to standardized tokens', () => {
            expect(normalizeSkill('React.js')).toBe('react');
            expect(normalizeSkill('REACT')).toBe('react');
            expect(normalizeSkill('Node.js')).toBe('node');
            expect(normalizeSkill('TypeScript')).toBe('typescript');
            expect(normalizeSkill('ts')).toBe('typescript');
            expect(normalizeSkill('Python 3.11')).toBe('python');
            expect(normalizeSkill('Data Structures & Algorithms')).toBe('dsa');
            expect(normalizeSkill('Machine Learning')).toBe('machine learning');
            expect(normalizeSkill('ML')).toBe('machine learning');
            expect(normalizeSkill('PostgreSQL')).toBe('postgres');
            expect(normalizeSkill('Tailwind CSS')).toBe('tailwind');
        });

        it('handles null, undefined, and non-string inputs safely', () => {
            expect(normalizeSkill(null)).toBe('');
            expect(normalizeSkill(undefined)).toBe('');
            expect(normalizeSkill(123)).toBe('');
        });
    });

    describe('2. Academic CGPA & Branch Eligibility Filter', () => {
        it('passes candidates when no minimum CGPA is configured', () => {
            const res = evaluateCgpaEligibility(6.5, 0);
            expect(res.eligible).toBe(true);
            expect(res.factor).toBe(1.0);
            expect(res.score).toBe(100);
        });

        it('awards merit bonus factor to candidates exceeding CGPA criteria', () => {
            const normalPass = evaluateCgpaEligibility(7.8, 7.5);
            expect(normalPass.eligible).toBe(true);
            expect(normalPass.factor).toBe(1.0);

            const meritPass = evaluateCgpaEligibility(8.6, 7.5);
            expect(meritPass.eligible).toBe(true);
            expect(meritPass.factor).toBeGreaterThan(1.0);

            const stellarPass = evaluateCgpaEligibility(9.5, 7.5);
            expect(stellarPass.eligible).toBe(true);
            expect(stellarPass.factor).toBe(1.03);
        });

        it('calculates proportional penalty when candidate CGPA falls below cutoff', () => {
            const failed = evaluateCgpaEligibility(6.0, 8.0);
            expect(failed.eligible).toBe(false);
            expect(failed.factor).toBeCloseTo(0.75, 2);
            expect(failed.reason).toContain('below required cutoff');
        });

        it('accurately resolves academic department and engineering clusters', () => {
            // Open to all
            expect(evaluateBranchEligibility('Civil Engineering', 'All').eligible).toBe(true);

            // Direct match
            expect(evaluateBranchEligibility('Computer Science', 'Computer Science').eligible).toBe(true);

            // Tech cluster cross-alignment (CSE matches Artificial Intelligence job)
            const techCluster = evaluateBranchEligibility('Computer Science and Engineering', 'Artificial Intelligence');
            expect(techCluster.eligible).toBe(true);
            expect(techCluster.factor).toBe(1.0);

            // Circuit branch alignment with software
            const circuitMatch = evaluateBranchEligibility('Electronics and Communication Engineering', 'Software Engineering');
            expect(circuitMatch.eligible).toBe(true);
            expect(circuitMatch.factor).toBe(0.94);

            // Non-aligned branch
            const nonAligned = evaluateBranchEligibility('Mechanical Engineering', 'Computer Science');
            expect(nonAligned.eligible).toBe(false);
            expect(nonAligned.factor).toBe(0.80);
        });
    });

    describe('3. Multi-Factor Weighted Match & "Why X%" Explanation', () => {
        it('calculates 100% match with explanation for perfectly qualified student', async () => {
            const mockStudent = {
                id: 'std_test_perfect',
                name: 'Elena Rostova',
                cgpa: 9.2,
                department: 'Computer Science',
                skills: [
                    { skillName: 'Python', level: 'Advanced', status: 'Verified', score: 95 },
                    { skillName: 'React', level: 'Intermediate', status: 'Verified', score: 90 },
                    { skillName: 'DSA', level: 'Intermediate', status: 'Verified', score: 88 }
                ]
            };

            const mockJob = {
                id: 'job_test_swe',
                title: 'Full Stack Software Engineer',
                department: 'Computer Science',
                minCgpa: 8.0,
                requiredSkills: [
                    { name: 'Python', minLevel: 'Advanced', priority: 'Mandatory', weight: 1.5 },
                    { name: 'React', minLevel: 'Intermediate', priority: 'High', weight: 1.2 },
                    { name: 'DSA', minLevel: 'Intermediate', priority: 'High', weight: 1.2 }
                ]
            };

            const match = await calculateJobMatch(mockStudent, mockJob);

            expect(match.matchPercentage).toBeGreaterThanOrEqual(95);
            expect(match.isEligible).toBe(true);
            expect(match.breakdown.skillOverlap.matchedCount).toBe(3);
            expect(match.whyExplanation).toContain('Why');
            expect(match.whyExplanation).toContain('Skill Overlap');
            expect(match.whyExplanation).toContain('Credibility');
            expect(match.whyExplanation).toContain('Academic Eligibility');
        });

        it('penalizes candidates with level gaps and unverified credentials', async () => {
            const beginnerStudent = {
                id: 'std_test_beginner',
                name: 'Sam Novice',
                cgpa: 7.2,
                department: 'Mechanical Engineering',
                skills: [
                    { skillName: 'Python', level: 'Beginner', status: 'Self-declared', score: 60 }
                ]
            };

            const seniorJob = {
                id: 'job_test_lead',
                title: 'Lead Python Architect',
                department: 'Computer Science',
                minCgpa: 8.5,
                requiredSkills: [
                    { name: 'Python', minLevel: 'Advanced', weight: 2.0 },
                    { name: 'Docker', minLevel: 'Intermediate', weight: 1.0 },
                    { name: 'Postgres', minLevel: 'Intermediate', weight: 1.0 }
                ]
            };

            const match = await calculateJobMatch(beginnerStudent, seniorJob);

            expect(match.matchPercentage).toBeLessThan(50);
            expect(match.isEligible).toBe(false);
            expect(match.skillGap).toContain('Docker');
            expect(match.skillGap).toContain('Postgres');
            expect(match.breakdown.skillOverlap.missing.length).toBe(2);
        });

        it('handles null student or job with baseline 50% gracefully', async () => {
            const match = await calculateJobMatch(null, null);
            expect(match.matchPercentage).toBe(50);
            expect(match.isEligible).toBe(false);
            expect(match.breakdown.formula).toContain('Baseline 50%');
        });
    });

    describe('4. Placement Probability Calculation', () => {
        it('calculates high probability for verified students with completed milestones', async () => {
            const result = await calculatePlacementProbability('std_1');
            expect(typeof result.probability).toBe('number');
            expect(result.probability).toBeGreaterThan(70);
            expect(result.tier).toBeDefined();
            expect(Array.isArray(result.recommendations)).toBe(true);
        });
    });
});
