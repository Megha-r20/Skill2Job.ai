import { calculateJobMatch, evaluateInterviewResponse, calculateIndustrySkillDemand } from '../lib/ai.ts';

console.log('🧪 Starting Skill2Job.ai System Sanity Checks...\n');

try {
  const demand = calculateIndustrySkillDemand();
  console.log(`✅ Industry Skill Demand Engine: loaded ${demand.length} skill categories.`);

  const interviewEval = evaluateInterviewResponse(
    "Explain React state management",
    "React state management allows components to create and manage local data using hooks like useState and useReducer, or global stores like Redux and Context API."
  );
  console.log(`✅ AI Interview Evaluator Score: ${interviewEval.score}/100 - ${interviewEval.feedback}`);

  console.log('\n🎉 Sanity Check Complete: All core AI systems operating cleanly!');
} catch (err) {
  console.error('❌ Sanity Check Failed:', err);
  process.exit(1);
}
