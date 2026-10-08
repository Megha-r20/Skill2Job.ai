import { prisma } from '../prisma.js';

const MOCK_ASSESSMENTS = {
    'asm_python': {
        assessment: {
            id: 'asm_python',
            title: 'Python Verification Assessment',
            skillName: 'Python',
            category: 'Programming',
            durationMinutes: 20,
            passingScore: 75,
            targetLevel: 'Intermediate',
            description: 'Timed assessment evaluating Python syntax, OOP, exception handling, data structures, and memory references.'
        },
        questions: [
            {
                id: 'q_py_1',
                assessmentId: 'asm_python',
                questionText: 'What is the output of `type(lambda: None)` in standard Python 3?',
                options: ["<class 'function'>", "<class 'lambda'>", "<class 'NoneType'>", "<class 'object'>"],
                points: 10,
                correctOptionIndex: 0,
                explanation: 'Lambda expressions in Python construct instances of the built-in function type (`<class "function">`).'
            },
            {
                id: 'q_py_2',
                assessmentId: 'asm_python',
                questionText: 'Which data structure in Python is implemented internally as an array of pointers to objects with dynamic contiguous resizing?',
                options: ['list', 'tuple', 'set', 'deque'],
                points: 10,
                correctOptionIndex: 0,
                explanation: 'Python lists are implemented as dynamically resized arrays of pointers to objects in memory.'
            },
            {
                id: 'q_py_3',
                assessmentId: 'asm_python',
                questionText: 'What happens when you modify a default argument that is a mutable object (such as a list `def fn(acc=[]):`) across multiple invocations?',
                options: [
                    'The same mutated list persists across subsequent function calls',
                    'A fresh new empty list is created for each call',
                    'Python raises an UnboundLocalError at runtime',
                    'The list is automatically garbage collected after each call'
                ],
                points: 10,
                correctOptionIndex: 0,
                explanation: 'In Python, default parameter expressions are evaluated once at function definition time, so mutable defaults are shared across calls.'
            },
            {
                id: 'q_py_4',
                assessmentId: 'asm_python',
                questionText: 'In Python OOP, which algorithm does Python use to determine Method Resolution Order (MRO) in multiple inheritance?',
                options: ['C3 Linearization algorithm', 'Depth-First Search (DFS)', 'Breadth-First Search (BFS)', 'Dijkstra Shortest Path'],
                points: 10,
                correctOptionIndex: 0,
                explanation: 'Python 2.3+ and Python 3 use the C3 Linearization algorithm to calculate the consistent MRO for classes.'
            },
            {
                id: 'q_py_5',
                assessmentId: 'asm_python',
                questionText: 'Which two dunder methods must an object implement to work with Python context managers (`with` statement)?',
                options: ['__enter__() and __exit__()', '__open__() and __close__()', '__init__() and __del__()', '__start__() and __stop__()'],
                points: 10,
                correctOptionIndex: 0,
                explanation: 'Context managers require `__enter__()` and `__exit__()` to manage resource allocation and cleanup.'
            },
            {
                id: 'q_py_6',
                assessmentId: 'asm_python',
                questionText: 'What is the average case time complexity for key lookups in a Python `dict`?',
                options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
                points: 10,
                correctOptionIndex: 0,
                explanation: 'Python dictionaries use hash tables, achieving O(1) average time complexity for key lookups.'
            }
        ]
    },
    'asm_dsa': {
        assessment: {
            id: 'asm_dsa',
            title: 'DSA Timed Assessment',
            skillName: 'Data Structures & Algorithms',
            category: 'Data Structures',
            durationMinutes: 25,
            passingScore: 75,
            targetLevel: 'Intermediate',
            description: 'Timed problem-solving and algorithmic complexity evaluation covering arrays, recursion, linked lists, trees, and dynamic programming.'
        },
        questions: [
            {
                id: 'q_dsa_1',
                assessmentId: 'asm_dsa',
                questionText: 'What is the worst-case time complexity of QuickSort when a poorly chosen pivot is used on a sorted array?',
                options: ['O(n²)', 'O(n log n)', 'O(n)', 'O(log n)'],
                points: 10,
                correctOptionIndex: 0,
                explanation: 'When the partition is maximally unbalanced (e.g. sorted array with first element as pivot), QuickSort degrades to O(n²).'
            },
            {
                id: 'q_dsa_2',
                assessmentId: 'asm_dsa',
                questionText: 'Which algorithm is optimal for finding the shortest path in a weighted graph with non-negative edge weights?',
                options: ["Dijkstra's Algorithm", "Bellman-Ford Algorithm", 'Breadth-First Search (BFS)', 'Floyd-Warshall Algorithm'],
                points: 10,
                correctOptionIndex: 0,
                explanation: "Dijkstra's algorithm efficiently computes single-source shortest paths on non-negative weighted graphs in O((V + E) log V) using a priority queue."
            },
            {
                id: 'q_dsa_3',
                assessmentId: 'asm_dsa',
                questionText: 'What data structure is typically used to implement Breadth-First Search (BFS) in a graph or tree?',
                options: ['Queue (FIFO)', 'Stack (LIFO)', 'Max-Heap', 'Binary Search Tree'],
                points: 10,
                correctOptionIndex: 0,
                explanation: 'BFS explores neighbor vertices level by level, requiring a FIFO Queue.'
            },
            {
                id: 'q_dsa_4',
                assessmentId: 'asm_dsa',
                questionText: 'What is the minimum height of a balanced Binary Search Tree containing N nodes?',
                options: ['⌊log₂(N)⌋', 'N / 2', 'N - 1', 'O(1)'],
                points: 10,
                correctOptionIndex: 0,
                explanation: 'A balanced binary tree distributes nodes across ⌊log₂(N)⌋ levels.'
            },
            {
                id: 'q_dsa_5',
                assessmentId: 'asm_dsa',
                questionText: 'Which algorithmic paradigm divides a problem into overlapping subproblems and memoizes previous solutions?',
                options: ['Dynamic Programming', 'Greedy Method', 'Divide and Conquer', 'Backtracking'],
                points: 10,
                correctOptionIndex: 0,
                explanation: 'Dynamic Programming addresses optimal substructure with overlapping subproblems using memoization or tabulation.'
            }
        ]
    },
    'asm_sql': {
        assessment: {
            id: 'asm_sql',
            title: 'SQL & Relational Database Assessment',
            skillName: 'SQL',
            category: 'Databases',
            durationMinutes: 20,
            passingScore: 75,
            targetLevel: 'Intermediate',
            description: 'Query analysis, relational schema normalization, joins, grouping, and subquery optimization.'
        },
        questions: [
            {
                id: 'q_sql_1',
                assessmentId: 'asm_sql',
                questionText: 'What is the key difference between the WHERE clause and the HAVING clause in SQL?',
                options: [
                    'WHERE filters rows before aggregation; HAVING filters aggregate groups after GROUP BY',
                    'WHERE works only with numbers; HAVING works only with strings',
                    'HAVING is executed before WHERE in the query pipeline',
                    'There is no difference; they are interchangeable'
                ],
                points: 10,
                correctOptionIndex: 0,
                explanation: 'WHERE filters individual records prior to grouping, while HAVING filters groups created by GROUP BY.'
            },
            {
                id: 'q_sql_2',
                assessmentId: 'asm_sql',
                questionText: 'Which normal form eliminates partial dependencies where non-prime attributes depend on a subset of a composite primary key?',
                options: ['Second Normal Form (2NF)', 'First Normal Form (1NF)', 'Third Normal Form (3NF)', 'Boyce-Codd Normal Form (BCNF)'],
                points: 10,
                correctOptionIndex: 0,
                explanation: '2NF requires 1NF and guarantees that all non-key attributes are fully functionally dependent on the entire primary key.'
            },
            {
                id: 'q_sql_3',
                assessmentId: 'asm_sql',
                questionText: 'Which index structure is the standard default for B-Tree relational database engines like PostgreSQL and MySQL InnoDB?',
                options: ['B-Tree Index', 'Bitmap Index', 'Hash Index', 'Inverted Index'],
                points: 10,
                correctOptionIndex: 0,
                explanation: 'B-Tree indexes provide logarithmic search, range query traversal, and sorting optimization.'
            },
            {
                id: 'q_sql_4',
                assessmentId: 'asm_sql',
                questionText: 'What type of JOIN returns all records from the left table and matched records from the right table, filling missing matches with NULL?',
                options: ['LEFT OUTER JOIN', 'INNER JOIN', 'FULL OUTER JOIN', 'CROSS JOIN'],
                points: 10,
                correctOptionIndex: 0,
                explanation: 'LEFT OUTER JOIN preserves all left-side rows regardless of whether a matching right-side row exists.'
            }
        ]
    }
};

function generateDynamicAssessment(id) {
    const rawSkill = id.replace(/^asm_/, '');
    const formattedSkill = rawSkill.charAt(0).toUpperCase() + rawSkill.slice(1);

    return {
        assessment: {
            id,
            title: `${formattedSkill} Verification Assessment`,
            skillName: formattedSkill,
            category: 'Technical Capability',
            durationMinutes: 20,
            passingScore: 75,
            targetLevel: 'Intermediate',
            description: `Verification assessment assessing core ${formattedSkill} syntax, architecture, and enterprise placement standards.`
        },
        questions: [
            {
                id: `q_${rawSkill}_1`,
                assessmentId: id,
                questionText: `Which of the following best describes the core design paradigm of ${formattedSkill}?`,
                options: [
                    'Modular, decoupled component architecture with clean interface contracts',
                    'Monolithic shared-memory single thread loops',
                    'Unchecked global variable mutation',
                    'Strict hardware microcode dependency'
                ],
                points: 10,
                correctOptionIndex: 0,
                explanation: `${formattedSkill} emphasizes modularity, separation of concerns, and structured error boundaries.`
            },
            {
                id: `q_${rawSkill}_2`,
                assessmentId: id,
                questionText: `What is the standard industry best practice for handling unexpected exceptions in production in ${formattedSkill}?`,
                options: [
                    'Catch specific exceptions, log structured diagnostic context, and recover or fail gracefully',
                    'Catch and silently ignore all exceptions with empty blocks',
                    'Terminate the operating system kernel',
                    'Disable runtime error reporting in production'
                ],
                points: 10,
                correctOptionIndex: 0,
                explanation: 'Enterprise code must catch specific exceptions and log structured context to preserve system stability.'
            },
            {
                id: `q_${rawSkill}_3`,
                assessmentId: id,
                questionText: `What is the primary benefit of maintaining automated test suites and linters for ${formattedSkill}?`,
                options: [
                    'Prevents regression bugs, enforces architectural consistency, and facilitates safe refactoring',
                    'Guarantees zero memory consumption',
                    'Replaces the need for production monitoring',
                    'Compiles code directly into assembly without validation'
                ],
                points: 10,
                correctOptionIndex: 0,
                explanation: 'Automated test suites catch regressions and enable safe continuous delivery in enterprise environments.'
            },
            {
                id: `q_${rawSkill}_4`,
                assessmentId: id,
                questionText: `How should sensitive credentials (such as API keys and database passwords) be managed in ${formattedSkill}?`,
                options: [
                    'Injected via secure environment variables or vault secret managers',
                    'Hardcoded into client-facing source code repositories',
                    'Stored in public plain-text configuration files',
                    'Appended directly to URL query strings'
                ],
                points: 10,
                correctOptionIndex: 0,
                explanation: 'Secrets should never be stored in version control; they must be provided through secure environment variables or secret vaults.'
            }
        ]
    };
}

export const assessmentRepository = {
    async findAll() {
        try {
            const list = await prisma.assessment.findMany();
            if (list && list.length > 0) return list;
            return Object.values(MOCK_ASSESSMENTS).map(m => m.assessment);
        } catch (e) {
            console.warn('[assessmentRepository] DB offline, using mock assessments:', e.message);
            return Object.values(MOCK_ASSESSMENTS).map(m => m.assessment);
        }
    },
    async findById(id) {
        try {
            const asm = await prisma.assessment.findUnique({ where: { id } });
            if (asm) return asm;
            const mock = MOCK_ASSESSMENTS[id] || generateDynamicAssessment(id);
            return mock.assessment;
        } catch (e) {
            console.warn('[assessmentRepository] DB offline, finding assessment by ID:', id);
            const mock = MOCK_ASSESSMENTS[id] || generateDynamicAssessment(id);
            return mock.assessment;
        }
    },
    async getQuestions(assessmentId) {
        try {
            const questions = await prisma.assessmentQuestion.findMany({ where: { assessmentId } });
            if (questions && questions.length > 0) return questions;
            const mock = MOCK_ASSESSMENTS[assessmentId] || generateDynamicAssessment(assessmentId);
            return mock.questions;
        } catch (e) {
            console.warn('[assessmentRepository] DB offline, fetching questions for ID:', assessmentId);
            const mock = MOCK_ASSESSMENTS[assessmentId] || generateDynamicAssessment(assessmentId);
            return mock.questions;
        }
    }
};
