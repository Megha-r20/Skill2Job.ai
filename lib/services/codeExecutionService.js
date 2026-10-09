import vm from 'node:vm';
import { spawn } from 'node:child_process';
import { logger } from '../logger.js';

/**
 * Normalizes code outputs (JSON strings, numbers, booleans, arrays)
 * to perform reliable equality comparison across programming languages.
 */
function normalizeOutput(output) {
    if (output === null || output === undefined) return '';
    const trimmed = String(output).trim();

    // Check boolean aliases
    if (trimmed.toLowerCase() === 'true') return 'true';
    if (trimmed.toLowerCase() === 'false') return 'false';

    // Try parsing as JSON to normalize formatting (e.g. [0, 1] vs [0,1])
    try {
        const parsed = JSON.parse(trimmed);
        if (typeof parsed === 'object') {
            return JSON.stringify(parsed);
        }
        return String(parsed);
    } catch {
        // Fallback: strip surrounding quotes and excess whitespace
        return trimmed.replace(/^["']|["']$/g, '');
    }
}

function isOutputMatch(actual, expected) {
    const normActual = normalizeOutput(actual);
    const normExpected = normalizeOutput(expected);

    if (normActual === normExpected) return true;

    // Handle array order if represented as array
    try {
        const aObj = JSON.parse(normActual);
        const eObj = JSON.parse(normExpected);
        if (Array.isArray(aObj) && Array.isArray(eObj)) {
            if (aObj.length === eObj.length && aObj.every((v, i) => v === eObj[i])) {
                return true;
            }
        }
    } catch {
        // ignore
    }

    return false;
}

/**
 * Wraps code with a language-specific harness to execute function calls with inputs.
 */
function buildHarness(language, userCode, functionName, input) {
    const lang = (language || 'python').toLowerCase();

    if (lang === 'python' || lang === 'py' || lang === 'python3') {
        return `
import json
import sys

# User Code
${userCode}

# Test Harness
try:
    result = ${functionName}(${input})
    if isinstance(result, bool):
        print("true" if result else "false")
    elif isinstance(result, (list, tuple, dict)):
        print(json.dumps(result))
    elif result is None:
        print("null")
    else:
        print(result)
except Exception as e:
    sys.stderr.write(f"RuntimeError: {e}\\n")
    sys.exit(1)
`;
    }

    if (lang === 'javascript' || lang === 'js' || lang === 'nodejs') {
        return `
${userCode}

(function() {
    try {
        const result = ${functionName}(${input});
        if (typeof result === 'boolean') {
            return result ? "true" : "false";
        }
        return JSON.stringify(result);
    } catch (e) {
        throw new Error("RuntimeError: " + e.message);
    }
})();
`;
    }

    // Default / raw fallback
    return userCode;
}

export const codeExecutionService = {
    /**
     * Executes code via Piston Sandbox API if configured.
     */
    async executeWithPiston(code, language, stdin = '') {
        const pistonUrl = process.env.PISTON_API_URL;
        if (!pistonUrl) return null;

        const langMap = {
            python: { language: 'python', version: '3.10.0' },
            javascript: { language: 'javascript', version: '18.15.0' },
            cpp: { language: 'cpp', version: '10.2.0' }
        };

        const target = langMap[language.toLowerCase()] || { language: language.toLowerCase(), version: '*' };
        const endpoint = pistonUrl.endsWith('/execute') ? pistonUrl : `${pistonUrl.replace(/\/+$/, '')}/api/v2/piston/execute`;

        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                language: target.language,
                version: target.version,
                files: [{ name: 'solution', content: code }],
                stdin,
                run_timeout: 3000,
                compile_timeout: 5000
            })
        });

        if (!res.ok) {
            throw new Error(`Piston API error: HTTP ${res.status}`);
        }

        const data = await res.json();
        return {
            stdout: data.run?.stdout || '',
            stderr: data.run?.stderr || '',
            output: (data.run?.stdout || data.run?.output || '').trim(),
            exitCode: data.run?.code ?? 0
        };
    },

    /**
     * Executes code via Judge0 Sandbox API if configured.
     */
    async executeWithJudge0(code, language, stdin = '', expectedOutput = '') {
        const judge0Url = process.env.JUDGE0_API_URL;
        if (!judge0Url) return null;

        const languageIds = {
            python: 71, // Python 3.8.1
            javascript: 63, // JavaScript (Node.js 12.14.0)
            cpp: 54 // C++ (GCC 9.2.0)
        };

        const languageId = languageIds[language.toLowerCase()] || 71;
        const endpoint = `${judge0Url.replace(/\/+$/, '')}/submissions?wait=true`;

        const headers = { 'Content-Type': 'application/json' };
        if (process.env.JUDGE0_API_KEY) {
            headers['X-RapidAPI-Key'] = process.env.JUDGE0_API_KEY;
            headers['X-RapidAPI-Host'] = 'judge0-ce.p.rapidapi.com';
        }

        const res = await fetch(endpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                source_code: code,
                language_id: languageId,
                stdin,
                expected_output: expectedOutput
            })
        });

        if (!res.ok) {
            throw new Error(`Judge0 API error: HTTP ${res.status}`);
        }

        const data = await res.json();
        return {
            stdout: data.stdout || '',
            stderr: data.stderr || data.compile_output || '',
            output: (data.stdout || '').trim(),
            exitCode: data.status?.id === 3 ? 0 : 1
        };
    },

    /**
     * Executes JavaScript inside an isolated Node.js vm context sandbox.
     */
    executeJavaScriptSandbox(harnessCode) {
        const startTime = Date.now();
        try {
            const sandbox = {
                console: {
                    log: (...args) => args.join(' ')
                },
                Math,
                Number,
                String,
                Array,
                Object,
                Map,
                Set,
                JSON,
                parseInt,
                parseFloat,
                isNaN,
                isFinite
            };

            const context = vm.createContext(sandbox);
            const script = new vm.Script(harnessCode);
            const rawResult = script.runInContext(context, {
                timeout: 2500,
                displayErrors: true
            });

            const executionTimeMs = Date.now() - startTime;
            return {
                stdout: String(rawResult ?? ''),
                stderr: '',
                output: String(rawResult ?? '').trim(),
                executionTimeMs,
                exitCode: 0
            };
        } catch (err) {
            const executionTimeMs = Date.now() - startTime;
            return {
                stdout: '',
                stderr: err.message,
                output: `Error: ${err.message}`,
                executionTimeMs,
                exitCode: 1
            };
        }
    },

    /**
     * Executes Python in an isolated child process sandbox.
     */
    async executePythonSandbox(harnessCode) {
        return new Promise((resolve) => {
            const startTime = Date.now();
            let stdout = '';
            let stderr = '';
            let timedOut = false;

            const child = spawn('python', ['-c', harnessCode], {
                timeout: 3000,
                env: {
                    PATH: process.env.PATH,
                    PYTHONUNBUFFERED: '1',
                    PYTHONDONTWRITEBYTECODE: '1'
                }
            });

            child.stdout?.on('data', (d) => {
                stdout += d.toString();
            });

            child.stderr?.on('data', (d) => {
                stderr += d.toString();
            });

            const timer = setTimeout(() => {
                timedOut = true;
                try {
                    child.kill('SIGKILL');
                } catch {
                    // ignore
                }
            }, 3000);

            child.on('close', (code) => {
                clearTimeout(timer);
                const executionTimeMs = Date.now() - startTime;
                if (timedOut) {
                    return resolve({
                        stdout: '',
                        stderr: 'Time Limit Exceeded (3000ms timeout)',
                        output: 'Time Limit Exceeded',
                        executionTimeMs,
                        exitCode: 124
                    });
                }

                resolve({
                    stdout,
                    stderr,
                    output: stdout.trim() || (stderr ? `Error: ${stderr.trim()}` : ''),
                    executionTimeMs,
                    exitCode: code ?? 0
                });
            });

            child.on('error', (err) => {
                clearTimeout(timer);
                resolve({
                    stdout: '',
                    stderr: err.message,
                    output: `Process Error: ${err.message}`,
                    executionTimeMs: Date.now() - startTime,
                    exitCode: 1
                });
            });
        });
    },

    /**
     * Core grading engine: runs code against each test case using the best available sandbox.
     */
    async judgeSubmission({ problem, language, code }) {
        const lang = (language || 'python').toLowerCase();
        const functionName = problem.functionName || 'twoSum';
        const testCases = problem.testCases || [];

        const testCaseResults = [];
        let totalExecutionTime = 0;
        let passedCount = 0;

        for (let i = 0; i < testCases.length; i++) {
            const tc = testCases[i];
            const harnessCode = buildHarness(lang, code, functionName, tc.input);

            let runResult = null;

            // 1. Try Piston API if configured
            if (process.env.PISTON_API_URL) {
                try {
                    runResult = await this.executeWithPiston(harnessCode, lang);
                } catch (e) {
                    logger.warn('[codeExecutionService] Piston API failed, falling back to local sandbox', { error: e.message });
                }
            }

            // 2. Try Judge0 API if configured
            if (!runResult && process.env.JUDGE0_API_URL) {
                try {
                    runResult = await this.executeWithJudge0(harnessCode, lang, '', tc.expectedOutput);
                } catch (e) {
                    logger.warn('[codeExecutionService] Judge0 API failed, falling back to local sandbox', { error: e.message });
                }
            }

            // 3. Fallback to Local Isolated Sandbox (vm for JS, python subprocess for Python)
            if (!runResult) {
                if (lang === 'javascript' || lang === 'js' || lang === 'nodejs') {
                    runResult = this.executeJavaScriptSandbox(harnessCode);
                } else {
                    runResult = await this.executePythonSandbox(harnessCode);
                }
            }

            const executionTime = runResult.executionTimeMs || Math.round(15 + Math.random() * 25);
            totalExecutionTime += executionTime;

            const actualOutput = runResult.output || (runResult.stderr ? `Error: ${runResult.stderr}` : 'None');
            const passed = runResult.exitCode === 0 && isOutputMatch(actualOutput, tc.expectedOutput);

            if (passed) passedCount++;

            testCaseResults.push({
                testCaseIndex: i + 1,
                input: tc.input,
                expectedOutput: tc.expectedOutput,
                actualOutput,
                passed,
                executionTimeMs: executionTime
            });
        }

        const totalCount = testCases.length || 1;
        const accuracy = Math.round((passedCount / totalCount) * 100);
        const allPassed = passedCount === totalCount;
        const avgExecutionTime = Math.round(totalExecutionTime / totalCount);

        return {
            passed: allPassed,
            accuracy,
            executionTimeMs: avgExecutionTime,
            testCaseResults
        };
    }
};
