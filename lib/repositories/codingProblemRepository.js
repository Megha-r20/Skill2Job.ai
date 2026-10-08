const CODING_PROBLEMS = [
    {
        id: 'cp_1',
        title: 'Two Sum Problem',
        difficulty: 'Easy',
        topic: 'Arrays',
        functionName: 'twoSum',
        recommendedForSkills: ['Python 3', 'Data Structures & Algorithms'],
        description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.',
        initialCode: {
            python: 'def twoSum(nums, target):\n    # Write your solution here\n    pass',
            javascript: 'function twoSum(nums, target) {\n    // Write your solution here\n}',
            cpp: '#include <vector>\nusing namespace std;\n\nvector<int> twoSum(vector<int>& nums, int target) {\n    // Write your solution here\n}'
        },
        testCases: [
            { input: '[2, 7, 11, 15], 9', expectedOutput: '[0, 1]' },
            { input: '[3, 2, 4], 6', expectedOutput: '[1, 2]' },
            { input: '[3, 3], 6', expectedOutput: '[0, 1]' }
        ]
    },
    {
        id: 'cp_2',
        title: 'Valid Palindrome',
        difficulty: 'Easy',
        topic: 'Strings',
        functionName: 'isPalindrome',
        recommendedForSkills: ['Python 3', 'Strings & Parsing'],
        description: 'A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Return true if it is a palindrome, or false otherwise.',
        initialCode: {
            python: 'def isPalindrome(s):\n    # Write your solution here\n    pass',
            javascript: 'function isPalindrome(s) {\n    // Write your solution here\n}',
            cpp: '#include <string>\nusing namespace std;\n\nbool isPalindrome(string s) {\n    // Write your solution here\n}'
        },
        testCases: [
            { input: '"A man, a plan, a canal: Panama"', expectedOutput: 'true' },
            { input: '"race a car"', expectedOutput: 'false' },
            { input: '" "', expectedOutput: 'true' }
        ]
    },
    {
        id: 'cp_3',
        title: 'Maximum Subarray (Kadane)',
        difficulty: 'Medium',
        topic: 'Arrays',
        functionName: 'maxSubArray',
        recommendedForSkills: ['Data Structures & Algorithms', 'Optimization'],
        description: 'Given an integer array nums, find the subarray with the largest sum, and return its sum.',
        initialCode: {
            python: 'def maxSubArray(nums):\n    # Write your solution here\n    pass',
            javascript: 'function maxSubArray(nums) {\n    // Write your solution here\n}',
            cpp: '#include <vector>\nusing namespace std;\n\nint maxSubArray(vector<int>& nums) {\n    // Write your solution here\n}'
        },
        testCases: [
            { input: '[-2, 1, -3, 4, -1, 2, 1, -5, 4]', expectedOutput: '6' },
            { input: '[1]', expectedOutput: '1' },
            { input: '[5, 4, -1, 7, 8]', expectedOutput: '23' }
        ]
    },
    {
        id: 'cp_4',
        title: 'Climbing Stairs',
        difficulty: 'Easy',
        topic: 'Dynamic Programming',
        functionName: 'climbStairs',
        recommendedForSkills: ['Dynamic Programming', 'Recursion'],
        description: 'You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?',
        initialCode: {
            python: 'def climbStairs(n):\n    # Write your solution here\n    pass',
            javascript: 'function climbStairs(n) {\n    // Write your solution here\n}',
            cpp: 'int climbStairs(int n) {\n    // Write your solution here\n}'
        },
        testCases: [
            { input: '2', expectedOutput: '2' },
            { input: '3', expectedOutput: '3' },
            { input: '5', expectedOutput: '8' }
        ]
    },
    {
        id: 'cp_5',
        title: 'Longest Substring Without Repeating Characters',
        difficulty: 'Medium',
        topic: 'Strings',
        functionName: 'lengthOfLongestSubstring',
        recommendedForSkills: ['Sliding Window', 'Hash Map'],
        description: 'Given a string s, find the length of the longest substring without repeating characters.',
        initialCode: {
            python: 'def lengthOfLongestSubstring(s):\n    # Write your solution here\n    pass',
            javascript: 'function lengthOfLongestSubstring(s) {\n    // Write your solution here\n}',
            cpp: '#include <string>\nusing namespace std;\n\nint lengthOfLongestSubstring(string s) {\n    // Write your solution here\n}'
        },
        testCases: [
            { input: '"abcabcbb"', expectedOutput: '3' },
            { input: '"bbbbb"', expectedOutput: '1' },
            { input: '"pwwkew"', expectedOutput: '3' }
        ]
    },
    {
        id: 'cp_6',
        title: 'Coin Change',
        difficulty: 'Medium',
        topic: 'Dynamic Programming',
        functionName: 'coinChange',
        recommendedForSkills: ['Dynamic Programming', 'Greedy & Search'],
        description: 'You are given an integer array coins representing coins of different denominations and an integer amount. Return the fewest number of coins needed to make up that amount. If that amount cannot be made up, return -1.',
        initialCode: {
            python: 'def coinChange(coins, amount):\n    # Write your solution here\n    pass',
            javascript: 'function coinChange(coins, amount) {\n    // Write your solution here\n}',
            cpp: '#include <vector>\nusing namespace std;\n\nint coinChange(vector<int>& coins, int amount) {\n    // Write your solution here\n}'
        },
        testCases: [
            { input: '[1, 2, 5], 11', expectedOutput: '3' },
            { input: '[2], 3', expectedOutput: '-1' },
            { input: '[1], 0', expectedOutput: '0' }
        ]
    },
    {
        id: 'cp_7',
        title: 'Maximum Depth of Binary Tree',
        difficulty: 'Easy',
        topic: 'Trees',
        functionName: 'maxDepth',
        recommendedForSkills: ['Trees & Graphs', 'Binary Tree Traversal'],
        description: 'Given a binary tree represented as a level-order array, return its maximum depth. An empty tree has depth 0.',
        initialCode: {
            python: 'def maxDepth(root):\n    # Write your solution here\n    pass',
            javascript: 'function maxDepth(root) {\n    // Write your solution here\n}',
            cpp: '#include <vector>\nusing namespace std;\n\nint maxDepth(vector<int> root) {\n    // Write your solution here\n}'
        },
        testCases: [
            { input: '[3, 9, 20, null, null, 15, 7]', expectedOutput: '3' },
            { input: '[1, null, 2]', expectedOutput: '2' },
            { input: '[]', expectedOutput: '0' }
        ]
    }
];

export const codingProblemRepository = {
    findAll({ topic, difficulty } = {}) {
        let results = [...CODING_PROBLEMS];
        if (topic && topic !== 'All') {
            results = results.filter(p => p.topic.toLowerCase() === topic.toLowerCase());
        }
        if (difficulty && difficulty !== 'All') {
            results = results.filter(p => p.difficulty.toLowerCase() === difficulty.toLowerCase());
        }
        return results;
    },
    findById(id) {
        return CODING_PROBLEMS.find(p => p.id === id) || CODING_PROBLEMS[0];
    }
};
