import { test, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
    calculateJobMatch,
    calculatePlacementProbability,
    generateSkillGapAnalysis,
    calculateComprehensiveJobReadiness,
    explainWhyNotEligible,
    getNextBestAction,
    generatePersonalizedRoadmap,
    evaluateInterviewResponse,
    matchTalentBySkillsQuery,
    calculateIndustrySkillDemand
} from '../lib/ai.js';

describe('AI Matching & Analytics Engine', () => {
    it('calculates dynamic job match percentage based on student skills and requirements', async () => {
        // std_1 has Python 3, React.js, DSA, SQL
        // job_1 requires React.js, Python 3, DSA
        const match = await calculateJobMatch('std_1', 'job_1');
        assert(match.matchPercentage >= 90, `Expected high match (>=90%), got ${match.matchPercentage}`);
        assert.deepEqual(match.skillGap, [], 'Expected empty skill gap for matching skills');
        assert(match.strengths.length > 0, 'Strengths should be populated');
        assert(match.readinessScore > 80, 'Readiness score should reflect alignment');
    });

    it('accurately identifies real missing skills instead of hardcoded placeholders', async () => {
        // job_3 requires React.js and Tailwind CSS. std_1 lacks Tailwind CSS.
        const match = await calculateJobMatch('std_1', 'job_3');
        assert.deepEqual(match.skillGap, ['Tailwind CSS'], 'Should detect Tailwind CSS as missing');
        assert.notEqual(match.skillGap.includes('Docker'), true, 'Should not contain hardcoded Docker');
        assert.notEqual(match.skillGap.includes('GraphQL'), true, 'Should not contain hardcoded GraphQL');
        assert(match.recommendations.some(r => r.includes('Tailwind CSS')), 'Recommendations should target Tailwind CSS');
    });

    it('calculates placement probability dynamically without returning static 86%', async () => {
        const prob1 = await calculatePlacementProbability('std_1');
        const prob3 = await calculatePlacementProbability('std_3');

        assert(typeof prob1.probability === 'number');
        assert(typeof prob3.probability === 'number');
        assert.notEqual(prob1.probability, prob3.probability, 'Probabilities should vary by student profile');
        assert(prob1.probability > prob3.probability, 'High-readiness student should have higher probability');
        assert(prob1.factors.length >= 4, 'Should include detailed evaluation factors');
    });

    it('generates accurate skill gap analysis with categorized radar chart data', async () => {
        const analysis = await generateSkillGapAnalysis('std_1', 'job_3');
        assert.equal(analysis.studentId, 'std_1');
        assert(Array.isArray(analysis.currentSkills) && analysis.currentSkills.length > 0);
        assert(analysis.missingSkills.some(m => m.name === 'Tailwind CSS'));
        assert.equal(analysis.radarChartData.length, 5, 'Should have 5 radar dimensions');
        const subjects = analysis.radarChartData.map(r => r.subject);
        assert.deepEqual(subjects, ['Frontend', 'Backend', 'Database', 'DevOps', 'Problem Solving']);
    });

    it('evaluates eligibility diagnostics accurately', async () => {
        // std_1 has all skills for job_1
        const eligible = await explainWhyNotEligible('std_1', 'job_1');
        assert.equal(eligible.eligible, true);
        assert.equal(eligible.reasons.length, 0);

        // std_1 lacks Tailwind for job_3
        const ineligible = await explainWhyNotEligible('std_1', 'job_3');
        assert.equal(ineligible.eligible, false);
        assert(ineligible.reasons.some(r => r.includes('Tailwind CSS')));
    });

    it('suggests data-driven next best actions', async () => {
        // std_3 has an unverified skill (React.js Self-declared)
        const action3 = await getNextBestAction('std_3');
        assert(action3.actionTitle.includes('React.js'), 'Should recommend verifying React.js');
        assert.equal(action3.actionType, 'ASSESSMENT');

        // std_1 has verified skills and high readiness
        const action1 = await getNextBestAction('std_1');
        assert(action1.actionTitle.includes('Apply') || action1.actionTitle.includes('Interview'));
    });

    it('generates personalized roadmap targeting actual missing skills', async () => {
        const roadmap = await generatePersonalizedRoadmap('std_1', 'job_3');
        assert.equal(roadmap.studentId, 'std_1');
        assert(roadmap.milestones.length >= 3);
        assert(roadmap.milestones.some(m => m.title.includes('Tailwind CSS')), 'Roadmap milestone should target Tailwind CSS');
    });

    it('evaluates technical interview responses based on depth and terminology', () => {
        const shallow = evaluateInterviewResponse(
            "What is a database index?",
            "It makes things fast."
        );
        const comprehensive = evaluateInterviewResponse(
            "What is a database index?",
            "A database index is a data structure, typically a B-Tree or Hash index, that optimizes query retrieval speed at the cost of additional write overhead and storage space. For example, indexing a primary key allows O(log n) lookups instead of full table scans."
        );

        assert(comprehensive.score > shallow.score, 'Comprehensive answer should score significantly higher');
        assert(comprehensive.clarityScore >= 80);
        assert(shallow.score < 70);
    });

    it('ranks candidate search results by skill relevance', async () => {
        const mlCandidates = await matchTalentBySkillsQuery('Machine Learning');
        assert(mlCandidates.length > 0);
        // Samantha Chen (std_2) has verified Machine Learning
        assert.equal(mlCandidates[0].name, 'Samantha Chen');
    });
});
