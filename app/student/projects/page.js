'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Sparkles, CheckCircle2, ArrowRight, ArrowLeft, Loader2, Code2, Layers } from 'lucide-react';

export default function ProjectsHubPage() {
    const { profile } = useAuth();
    const studentId = profile?.id || 'std_1';
    const [role, setRole] = useState('Software Developer');
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetch(`/api/projects/recommendations?role=${encodeURIComponent(role)}&studentId=${encodeURIComponent(studentId)}`)
            .then(res => res.json())
            .then(data => {
                if (data.recommendations) {
                    setProjects(data.recommendations);
                }
            })
            .catch(e => console.error(e))
            .finally(() => setLoading(false));
    }, [role, studentId]);

    const roles = ['Software Developer', 'Data Analyst', 'Cloud DevOps Associate'];

    return (
        <div className="w-full min-h-screen bg-slate-50/60 dark:bg-slate-950 py-8 transition-colors">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                
                {/* Navigation Breadcrumb */}
                <div>
                    <Link href="/student/dashboard" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 transition-colors">
                        <ArrowLeft className="w-3.5 h-3.5" /> Back to Student Dashboard
                    </Link>
                </div>

                {/* Header Card */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <span className="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">
                                Proof of Work Hub
                            </span>
                            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                                Industry Project Recommendation Engine
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                                Bridge the Skill → Project → Job connection with verified architectural capstones.
                            </p>
                        </div>

                        {/* Role Filter Pills */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                            {roles.map(r => (
                                <button
                                    key={r}
                                    onClick={() => setRole(r)}
                                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                                        role === r
                                            ? 'bg-primary-600 dark:bg-primary-500 text-white shadow-sm'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                    }`}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="p-12 text-center space-y-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800">
                        <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto" />
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                            Calibrating industry project recommendations for {role}...
                        </p>
                    </div>
                )}

                {/* Empty State */}
                {!loading && projects.length === 0 && (
                    <div className="p-12 text-center space-y-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800">
                        <Layers className="w-10 h-10 text-slate-400 mx-auto" />
                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Projects Found</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            No project recommendations available for this track at the moment.
                        </p>
                    </div>
                )}

                {/* Projects Grid */}
                {!loading && projects.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {projects.map((proj) => (
                            <div
                                key={proj.id}
                                className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 hover:border-primary-400 dark:hover:border-primary-500/50 hover:shadow-lg dark:hover:shadow-primary-950/20 transition-all flex flex-col justify-between space-y-6"
                            >
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 border border-primary-200/50 dark:border-primary-800/40">
                                                {proj.difficulty} Level
                                            </span>
                                            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                                                {proj.targetRole}
                                            </span>
                                        </div>
                                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-2">
                                            {proj.title}
                                        </h2>
                                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                            {proj.description}
                                        </p>
                                        
                                        {proj.matchReasons && proj.matchReasons.length > 0 && (
                                            <div className="mt-3 p-3 bg-purple-50/60 dark:bg-purple-950/30 rounded-2xl border border-purple-100 dark:border-purple-900/40 space-y-1.5">
                                                <span className="text-[10px] font-black uppercase text-purple-700 dark:text-purple-300 tracking-wider flex items-center gap-1.5">
                                                    <Sparkles className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400 animate-pulse" />
                                                    AI Recommendation Rationale:
                                                </span>
                                                <div className="flex flex-col gap-1 pl-4 text-[10px] text-purple-700 dark:text-purple-300 leading-snug">
                                                    {proj.matchReasons.map((reason, rIdx) => (
                                                        <span key={rIdx} className="relative before:content-['•'] before:absolute before:-left-3 font-medium">
                                                            {reason}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Technologies */}
                                    <div className="space-y-1.5">
                                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Required Tech Stack:
                                        </span>
                                        <div className="flex flex-wrap gap-1.5">
                                            {proj.technologies?.map(t => (
                                                <span
                                                    key={t}
                                                    className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-200/50 dark:border-slate-700"
                                                >
                                                    {t}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Key Features */}
                                    {proj.features && proj.features.length > 0 && (
                                        <div className="p-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-200/70 dark:border-slate-800 space-y-2 text-xs">
                                            <span className="font-bold text-slate-700 dark:text-slate-300 uppercase text-[10px] tracking-wider block">
                                                Key Deliverables:
                                            </span>
                                            <ul className="space-y-1.5 text-slate-600 dark:text-slate-400">
                                                {proj.features.map((feat, idx) => (
                                                    <li key={idx} className="flex items-start gap-1.5">
                                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                                                        <span>{feat}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                                        Strengthens Resume & Passport ✓
                                    </span>
                                    <Link
                                        href={`/student/projects/${proj.id}`}
                                        className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 dark:bg-primary-600 hover:bg-primary-600 dark:hover:bg-primary-500 transition-colors flex items-center gap-1.5 shadow-sm"
                                    >
                                        <Code2 className="w-3.5 h-3.5" />
                                        <span>Build Project</span>
                                        <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
}
