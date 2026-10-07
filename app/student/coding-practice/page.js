'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { CheckCircle2, XCircle, Play } from 'lucide-react';

export default function CodingPracticePage() {
    const { profile } = useAuth();
    const studentId = profile?.id || 'std_1';
    const [problems, setProblems] = useState([]);
    const [selectedProblem, setSelectedProblem] = useState(null);
    const [language, setLanguage] = useState('python');
    const [code, setCode] = useState('');
    const [running, setRunning] = useState(false);
    const [result, setResult] = useState(null);
    const [activeTopic, setActiveTopic] = useState('All');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadProblems() {
            try {
                let url = '/api/coding/problems';
                if (activeTopic !== 'All')
                    url += `?topic=${activeTopic}`;
                const res = await fetch(url);
                const data = await res.json();
                if (data.problems) {
                    setProblems(data.problems);
                    if (data.problems.length > 0 && !selectedProblem) {
                        setSelectedProblem(data.problems[0]);
                        setCode(data.problems[0].initialCode.python);
                    }
                }
            }
            catch (e) {
                console.error(e);
            }
            finally {
                setLoading(false);
            }
        }
        loadProblems();
    }, [activeTopic]);

    const handleSelectProblem = (prob) => {
        setSelectedProblem(prob);
        setCode(prob.initialCode[language] || prob.initialCode.python);
        setResult(null);
    };

    const handleLanguageChange = (lang) => {
        setLanguage(lang);
        if (selectedProblem) {
            setCode(selectedProblem.initialCode[lang] || selectedProblem.initialCode.python);
        }
    };

    const handleRunCode = async () => {
        if (!selectedProblem)
            return;
        setRunning(true);
        setResult(null);
        try {
            const res = await fetch('/api/coding/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    problemId: selectedProblem.id,
                    language,
                    code,
                    studentId
                })
            });
            const data = await res.json();
            setResult(data);
        }
        catch (e) {
            console.error(e);
        }
        finally {
            setRunning(false);
        }
    };

    const topics = ['All', 'Arrays', 'Strings', 'Dynamic Programming', 'Trees'];

    return (
        <div className="w-full min-h-screen bg-slate-50/60 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 space-y-8 transition-colors">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* Navigation Breadcrumb */}
                <div>
                    <Link
                        href="/student/dashboard"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                        <span>← Back to Student Dashboard</span>
                    </Link>
                </div>

                {/* 1. HEADER & TOPIC READINESS RADAR (Section 12) */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <span className="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">
                                Algorithmic Sandbox
                            </span>
                            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                                AI Coding Problem Solving Arena
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                                Sharpen algorithmic problem-solving for enterprise technical interview rounds with automated test case validation.
                            </p>
                        </div>

                        {/* Topic Filter Pills */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                            {topics.map(t => (
                                <button
                                    key={t}
                                    onClick={() => setActiveTopic(t)}
                                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                                        activeTopic === t
                                            ? 'bg-primary-600 dark:bg-primary-500 text-white shadow-sm'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                    }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Topic Readiness Breakdown (Section 12) */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-center">
                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Arrays</span>
                            <span className="text-lg font-black text-slate-900 dark:text-slate-100 block">82%</span>
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Strong</span>
                        </div>
                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-center">
                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Strings</span>
                            <span className="text-lg font-black text-slate-900 dark:text-slate-100 block">76%</span>
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Strong</span>
                        </div>
                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-center">
                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Linked Lists</span>
                            <span className="text-lg font-black text-slate-900 dark:text-slate-100 block">54%</span>
                            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">Needs Practice</span>
                        </div>
                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-center">
                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Trees & BST</span>
                            <span className="text-lg font-black text-slate-900 dark:text-slate-100 block">42%</span>
                            <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold">Weak Area</span>
                        </div>
                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-center">
                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Dynamic Prog</span>
                            <span className="text-lg font-black text-slate-900 dark:text-slate-100 block">68%</span>
                            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">Moderate</span>
                        </div>
                    </div>
                </div>

                {/* 2. GRID: PROBLEM SELECTOR & INTERACTIVE CODE RUNNER */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Left Column: Problem List */}
                    <div className="lg:col-span-4 space-y-3">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
                            Problem Directory
                        </h2>
                        {problems.map((prob) => {
                            const isSelected = selectedProblem?.id === prob.id;
                            return (
                                <button
                                    key={prob.id}
                                    onClick={() => handleSelectProblem(prob)}
                                    className={`w-full p-4 rounded-2xl border text-left transition-all space-y-2 ${
                                        isSelected
                                            ? 'bg-white dark:bg-slate-900 border-primary-500 dark:border-primary-500 shadow-md ring-2 ring-primary-500/20'
                                            : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-extrabold text-xs text-slate-900 dark:text-slate-100">{prob.title}</span>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                            prob.difficulty === 'Easy'
                                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                                                : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                                        }`}>
                                            {prob.difficulty}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500">
                                        <span>Topic: <strong className="text-slate-700 dark:text-slate-300">{prob.topic}</strong></span>
                                        <span className="text-primary-600 dark:text-primary-400 font-semibold">{prob.recommendedForSkills.join(', ')}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Right Column: Code Editor & Test Cases */}
                    {selectedProblem && (
                        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
                            
                            {/* Problem Header */}
                            <div className="space-y-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">{selectedProblem.title}</h2>
                                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                            {selectedProblem.topic}
                                        </span>
                                    </div>

                                    {/* Language Selector */}
                                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                                        {['python', 'javascript', 'cpp'].map(lang => (
                                            <button
                                                key={lang}
                                                onClick={() => handleLanguageChange(lang)}
                                                className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-colors ${
                                                    language === lang
                                                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                                                }`}
                                            >
                                                {lang === 'cpp' ? 'C++' : lang}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-mono bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
                                    {selectedProblem.description}
                                </p>
                            </div>

                            {/* Code Editor Area */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-bold text-slate-700 dark:text-slate-300 font-mono">Solution Editor ({language})</span>
                                    <span className="text-[11px] text-slate-400 dark:text-slate-500">O(n) Optimal Solution Expected</span>
                                </div>

                                <textarea
                                    rows={10}
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    className="w-full p-4 font-mono text-xs bg-slate-950 text-emerald-400 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 leading-relaxed shadow-inner border border-slate-800"
                                />
                            </div>

                            {/* Test Cases Validator & Action */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Sample Test Case:</span>
                                    <p className="text-xs font-mono text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg inline-block border border-slate-200/60 dark:border-slate-700/60">
                                        {selectedProblem.testCases[0]?.input} → Expected: <strong className="text-slate-900 dark:text-slate-100">{selectedProblem.testCases[0]?.expectedOutput}</strong>
                                    </p>
                                </div>

                                <button
                                    onClick={handleRunCode}
                                    disabled={running}
                                    className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2"
                                >
                                    <Play className="w-4 h-4" />
                                    <span>{running ? 'Running Tests...' : 'Run & Validate Solution'}</span>
                                </button>
                            </div>

                            {/* Run Results Output */}
                            {result && (
                                <div className={`p-5 rounded-2xl border space-y-3 animate-in fade-in duration-200 ${
                                    result.passed
                                        ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                                        : 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800'
                                }`}>
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-xs flex items-center gap-1.5 text-slate-900 dark:text-slate-100">
                                            {result.passed ? <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />}
                                            <span>{result.passed ? 'All Test Cases Passed! ✓' : 'Test Case Execution Failed'}</span>
                                        </span>
                                        <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                                            Execution Time: {result.attempt.executionTimeMs}ms • Accuracy: {result.attempt.accuracy}%
                                        </span>
                                    </div>

                                    <div className="space-y-1.5 text-xs font-mono">
                                        {result.testCaseResults?.map((tc) => (
                                            <div
                                                key={tc.testCaseIndex}
                                                className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                                            >
                                                <span className="text-slate-700 dark:text-slate-300">Case #{tc.testCaseIndex}: {tc.input}</span>
                                                <span className={`font-bold ${tc.passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                                    {tc.passed ? 'PASSED ✓' : 'FAILED'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>
                    )}

                </div>

            </div>
        </div>
    );
}
