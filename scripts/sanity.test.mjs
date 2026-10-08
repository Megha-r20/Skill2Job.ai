import assert from 'node:assert/strict';
import {
    calculateJobMatch,
    evaluateInterviewResponse,
    calculateIndustrySkillDemand,
    calculatePlacementProbability,
    generateSkillGapAnalysis
} from '../lib/ai.js';

console.log('🧪 Starting Skill2Job.ai System Sanity Checks...\n');

try {
    // 1. Industry Demand Analysis
    const demand = await calculateIndustrySkillDemand();
    assert(Array.isArray(demand) && demand.length > 0, 'Demand list should be a non-empty array');
    console.log(`✅ Industry Skill Demand Engine: loaded ${demand.length} skill categories.`);

    // 2. AI Interview Evaluator
    const interviewEval = evaluateInterviewResponse(
        "Explain React state management",
        "React state management allows components to create and manage local state using hooks like useState and useReducer, or global stores using Redux and Context API to maintain predictable data flow."
    );
    assert(typeof interviewEval.score === 'number' && interviewEval.score > 0, 'Interview score should be positive number');
    assert(typeof interviewEval.feedback === 'string' && interviewEval.feedback.length > 0, 'Feedback should be non-empty');
    console.log(`✅ AI Interview Evaluator Score: ${interviewEval.score}/100 - ${interviewEval.feedback}`);

    // 3. Dynamic Job Match Engine
    const jobMatch = await calculateJobMatch('std_1', 'job_1');
    assert(typeof jobMatch.matchPercentage === 'number', 'Match percentage must be numeric');
    assert(Array.isArray(jobMatch.strengths) && jobMatch.strengths.length > 0, 'Strengths must be populated');
    assert(Array.isArray(jobMatch.skillGap), 'Skill gap must be an array');
    console.log(`✅ Dynamic Job Match Engine: calculated ${jobMatch.matchPercentage}% match for std_1 on job_1.`);

    // 4. Dynamic Placement Probability
    const placement = await calculatePlacementProbability('std_1');
    assert(typeof placement.probability === 'number' && placement.probability > 0, 'Placement probability must be positive number');
    assert(Array.isArray(placement.factors) && placement.factors.length > 0, 'Factors must be populated');
    console.log(`✅ Placement Probability Engine: calculated ${placement.probability}% (${placement.tier}).`);

    // 5. Skill Gap Analysis
    const skillGap = await generateSkillGapAnalysis('std_1', 'job_1');
    assert(Array.isArray(skillGap.radarChartData) && skillGap.radarChartData.length === 5, 'Radar chart must have 5 categories');
    console.log(`✅ Skill Gap Radar Engine: generated ${skillGap.radarChartData.length} radar categories.`);

    console.log('\n🎉 Sanity Check Complete: All core AI systems operating cleanly and dynamically!');
} catch (err) {
    console.error('❌ Sanity Check Failed:', err);
    process.exit(1);
}
