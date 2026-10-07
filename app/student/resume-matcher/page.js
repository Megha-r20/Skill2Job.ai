'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { FileText, Sparkles, CheckCircle2, XCircle, AlertCircle, FolderGit2 } from 'lucide-react';

export default function ResumeMatcherPage() {
    const { profile } = useAuth();
    const studentId = profile?.id || 'std_1';
    const [jobs, setJobs] = useState([]);
    const [selectedJobId, setSelectedJobId] = useState('job_1');
    const [resumeText, setResumeText] = useState(`ALEX RIVERA
B.S. in Computer Science — Apex University (CGPA: 8.75 / 2026 Batch)

TECHNICAL SKILLS:
Programming: Python (Intermediate), SQL (Intermediate), C++ (Beginner), JavaScript
Databases: PostgreSQL, MySQL, Redis
Tools & Systems: Git, Linux CLI, Docker, REST APIs

PROJECTS:
1. Distributed Task Queue & Cache Manager:
Built an asynchronous task processing queue using Python, Redis, and PostgreSQL with automatic retries and dead-letter queueing.
2. Campus Food Delivery Logistics Engine:
Interactive order dispatch and shortest-path routing algorithm implemented using DSA graph algorithms and React.`);
    const [analyzing, setAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState(null);

    useEffect(() => {
        fetch('/api/jobs')
            .then(res => res.json())
            .then(data => {
                if (data.jobs)
                    setJobs(data.jobs);
            })
            .catch(e => console.error(e));
    }, []);

    const handleAnalyze = async (e) => {
        e.preventDefault();
        setAnalyzing(true);
        setAnalysis(null);
        try {
            const res = await fetch(`/api/students/${studentId}/resume-match`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jobId: selectedJobId,
                    resumeText
                })
            });
            const data = await res.json();
            if (data.analysis) {
                setAnalysis(data.analysis);
            }
        }
        catch (e) {
            console.error(e);
        }
        finally {
            setAnalyzing(false);
        }
    };

    return (
        <div className="w-full min-h-screen bg-slate-50/60 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 space-y-8 transition-colors">
            <div className="max-w-6xl mx-auto space-y-8">
                
                {/* Navigation Breadcrumb */}
                <div>
                    <Link
                        href="/student/dashboard"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                        <span>← Back to Student Dashboard</span>
                    </Link>
                </div>

                {/* 1. HEADER (Section 8) */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
                            <span>AI Resume & Evidence Auditor</span>
                        </span>
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                        AI Resume ↔ Job Compatibility Matcher
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
                        Compare your resume text directly against corporate job requirements. Identify missing keywords, weak project evidence, and receive actionable project suggestions.
                    </p>
                </div>

                {/* 2. GRID: INPUT FORM & ANALYSIS REPORT */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Left Column: Form */}
                    <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5 transition-colors">
                        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">1. Select Job & Paste Resume</h2>

                        <form onSubmit={handleAnalyze} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Target Opening</label>
                                <select
                                    value={selectedJobId}
                                    onChange={(e) => setSelectedJobId(e.target.value)}
                                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-primary-500 focus:outline-none font-semibold text-slate-800 dark:text-slate-100"
                                >
                                    {jobs.slice(0, 8).map(j => (
                                        <option key={j.id} value={j.id}>
                                            {j.title} — {j.companyName} ({j.location})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Resume Content</label>
                                <textarea
                                    rows={12}
                                    required
                                    value={resumeText}
                                    onChange={(e) => setResumeText(e.target.value)}
                                    className="w-full p-4 font-mono text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-2xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-primary-500 focus:outline-none leading-relaxed"
                                />
                            </div>

                            <div className="flex items-center justify-end pt-2">
                                <button
                                    type="submit"
                                    disabled={analyzing}
                                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-primary-600/25 transition-all flex items-center gap-2"
                                >
                                    <Sparkles className="w-4 h-4" />
                                    <span>{analyzing ? 'Analyzing Keywords...' : 'Audit Resume Compatibility'}</span>
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Right Column: AI Analysis Report */}
                    <div className="lg:col-span-6 space-y-6">
                        {analysis ? (
                            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6 animate-in fade-in duration-200 transition-colors">
                                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                                    <div>
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Match Output</span>
                                        <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">{analysis.jobTitle}</h2>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-3xl font-black font-mono text-primary-600 dark:text-primary-400">
                                            {analysis.resumeMatchScore}%
                                        </span>
                                        <span className="block text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Keyword Alignment</span>
                                    </div>
                                </div>

                                {/* Matched vs Missing Skills (Section 8) */}
                                <div className="space-y-4">
                                    <div>
                                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 mb-2">
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                            <span>Matched Competencies in Resume:</span>
                                        </span>
                                        <div className="flex flex-wrap gap-1.5">
                                            {analysis.matchedSkills.map(s => (
                                                <span key={s} className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/60">
                                                    {s} ✓
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <span className="text-xs font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1 mb-2">
                                            <XCircle className="w-3.5 h-3.5" />
                                            <span>Missing / Undetected Skills:</span>
                                        </span>
                                        <div className="flex flex-wrap gap-1.5">
                                            {analysis.missingSkills.map(s => (
                                                <span key={s} className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800/60">
                                                    {s}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Weak Evidence Observation */}
                                {analysis.weakEvidenceSkills.length > 0 && (
                                    <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-800/50 space-y-1 text-xs">
                                        <span className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1">
                                            <AlertCircle className="w-3.5 h-3.5" />
                                            <span>Weak Evidence Warning:</span>
                                        </span>
                                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                                            {analysis.weakEvidenceSkills[0].observation}
                                        </p>
                                    </div>
                                )}

                                {/* Recommended Project */}
                                {analysis.projectRecommendations.length > 0 && (
                                    <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-2 text-xs">
                                        <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                                            <FolderGit2 className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                                            <span>Recommended Project to Bridge Gap:</span>
                                        </span>
                                        <h3 className="font-bold text-primary-700 dark:text-primary-300">{analysis.projectRecommendations[0].title}</h3>
                                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{analysis.projectRecommendations[0].description}</p>
                                        <Link href="/student/projects" className="inline-flex items-center gap-1 text-primary-600 dark:text-primary-400 font-bold hover:underline pt-1">
                                            <span>Explore Project Blueprint →</span>
                                        </Link>
                                    </div>
                                )}

                            </div>
                        ) : (
                            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm text-center py-16 space-y-3 transition-colors">
                                <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
                                <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">No Resume Audited Yet</h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                                    Click "Audit Resume Compatibility" to parse keyword evidence and receive missing skill warnings.
                                </p>
                            </div>
                        )}
                    </div>

                </div>

            </div>
        </div>
    );
}
