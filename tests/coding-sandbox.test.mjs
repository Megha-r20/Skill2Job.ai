import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { codeExecutionService } from '../lib/services/codeExecutionService.js';
import { codingProblemRepository } from '../lib/repositories/codingProblemRepository.js';

describe('Coding Problem Repository & Sandbox Execution Engine', () => {
    it('retrieves coding problems filtered by topic and difficulty', () => {
        const arrayProblems = codingProblemRepository.findAll({ topic: 'Arrays' });
        assert(arrayProblems.length > 0, 'Should find array problems');
        assert(arrayProblems.every(p => p.topic === 'Arrays'));

        const easyProblems = codingProblemRepository.findAll({ difficulty: 'Easy' });
        assert(easyProblems.length > 0);
        assert(easyProblems.every(p => p.difficulty === 'Easy'));

        const twoSum = codingProblemRepository.findById('cp_1');
        assert.equal(twoSum.title, 'Two Sum Problem');
        assert(Array.isArray(twoSum.testCases) && twoSum.testCases.length >= 2);
    });

    it('evaluates correct Python solution and passes all test cases', async () => {
        const problem = codingProblemRepository.findById('cp_1');
        const validPythonCode = `
def twoSum(nums, target):
    lookup = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in lookup:
            return [lookup[complement], i]
        lookup[num] = i
    return []
`;
        const result = await codeExecutionService.judgeSubmission({
            problem,
            language: 'python',
            code: validPythonCode
        });

        assert.equal(result.passed, true);
        assert.equal(result.accuracy, 100);
        assert.equal(result.testCaseResults.every(tc => tc.passed), true);
    });

    it('rejects wrong code logic even if it contains "return" and exceeds 30 characters', async () => {
        const problem = codingProblemRepository.findById('cp_1');
        const wrongLogicCode = `
def twoSum(nums, target):
    # Has the keyword return and exceeds 30 characters but is totally wrong!
    return [0, 0]
`;
        const result = await codeExecutionService.judgeSubmission({
            problem,
            language: 'python',
            code: wrongLogicCode
        });

        assert.equal(result.passed, false, 'Should fail wrong logic');
        assert.notEqual(result.accuracy, 100);
    });

    it('evaluates correct JavaScript solution inside isolated VM sandbox', async () => {
        const problem = codingProblemRepository.findById('cp_1');
        const validJsCode = `
function twoSum(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const comp = target - nums[i];
        if (map.has(comp)) return [map.get(comp), i];
        map.set(nums[i], i);
    }
    return [];
}
`;
        const result = await codeExecutionService.judgeSubmission({
            problem,
            language: 'javascript',
            code: validJsCode
        });

        assert.equal(result.passed, true);
        assert.equal(result.accuracy, 100);
    });

    it('terminates infinite loop safely with sandbox timeout without hanging server', async () => {
        const problem = codingProblemRepository.findById('cp_1');
        const infiniteLoop = `
function twoSum(nums, target) {
    while (true) {}
}
`;
        const result = await codeExecutionService.judgeSubmission({
            problem,
            language: 'javascript',
            code: infiniteLoop
        });

        assert.equal(result.passed, false);
        assert(result.testCaseResults.some(tc => tc.actualOutput.includes('timed out')), 'Should record timeout error');
    });
});
