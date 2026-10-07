'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Briefcase, Building2, ArrowRight, Sparkles } from 'lucide-react';

export default function StudentApplicationsPage() {
    const { profile } = useAuth();
    const studentId = profile?.id || 'std_1';
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadApps() {
            try {
                const res = await fetch(`/api/students/${studentId}`);
                const data = await res.json();
                if (data.applications) {
                    setApplications(data.applications);
                }
            }
            catch (e) {
                console.error(e);
            }
            finally {
                setLoading(false);
            }
        }
        loadApps();
    }, [studentId]);

    const stages = ['Applied', 'Under Review', 'Shortlisted', 'Assessment', 'Interview', 'Selected'];

    const getStageIndex = (status) => {
        if (status === 'Rejected')
            return -1;
        const idx = stages.indexOf(status);
        return idx !== -1 ? idx : 0;
    };

    return (
        <div className="w-full min-h-screen bg-slate-50/60 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 space-y-8 transition-colors">
            <div className="max-w-6xl mx-auto space-y-8">
                
                {/* Header (Section 30) */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2 transition-colors">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">
                        Application Pipeline
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                        My Job Applications & Interview Progress
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                        Track your candidacies across the hiring lifecycle. Companies review your profile backed by verified skill scores.
                    </p>
                </div>

                {/* Applications List */}
                {loading ? (
                    <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 transition-colors">
                        <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Loading submitted applications...</p>
                    </div>
                ) : applications.length === 0 ? (
                    <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 space-y-3 transition-colors">
                        <Briefcase className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
                        <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">No Applications Submitted Yet</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                            Check your eligibility on open tech positions and submit your verified candidate profile.
                        </p>
                        <Link
                            href="/jobs/job_1"
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-600 dark:hover:bg-primary-500 shadow-md transition-colors"
                        >
                            <span>Explore TechNova Software Dev (Step 10 Demo Flow)</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {applications.map((app) => {
                            const currentStageIdx = getStageIndex(app.status);
                            return (
                                <div
                                    key={app.id}
                                    className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6 transition-colors"
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="space-y-1">
                                            <span className="text-xs font-bold text-primary-700 dark:text-primary-400 uppercase tracking-wider flex items-center gap-1.5">
                                                <Building2 className="w-4 h-4" />
                                                {app.companyName}
                                            </span>
                                            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{app.jobTitle}</h2>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                                <span>Applied on {new Date(app.appliedAt).toLocaleDateString()}</span>
                                                <span>•</span>
                                                <span className="font-mono text-slate-400 dark:text-slate-500">ID: {app.id}</span>
                                            </p>
                                        </div>

                                        <div className="text-right">
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-950/50 border border-primary-200 dark:border-primary-800/60">
                                                <Sparkles className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
                                                <span className="text-xs font-black text-primary-800 dark:text-primary-300">{app.matchPercentage}% Match</span>
                                            </div>
                                            <span className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mt-1 capitalize">
                                                Stage: <strong className="text-primary-600 dark:text-primary-400">{app.status}</strong>
                                            </span>
                                        </div>
                                    </div>

                                    {/* 6 Stage Pipeline Progress Indicator */}
                                    <div className="pt-2">
                                        <div className="grid grid-cols-6 gap-2">
                                            {stages.map((stage, idx) => {
                                                const isDone = idx <= currentStageIdx;
                                                const isCurrent = idx === currentStageIdx;
                                                return (
                                                    <div key={stage} className="text-center space-y-1.5">
                                                        <div className={`h-2 rounded-full transition-all ${
                                                            isDone ? 'bg-primary-600 dark:bg-primary-500' : 'bg-slate-100 dark:bg-slate-800'
                                                        }`} />
                                                        <span className={`block text-[10px] font-semibold truncate ${
                                                            isCurrent
                                                                ? 'text-primary-700 dark:text-primary-400 font-bold'
                                                                : isDone
                                                                ? 'text-slate-700 dark:text-slate-300'
                                                                : 'text-slate-400 dark:text-slate-600'
                                                        }`}>
                                                            {stage}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Notes Strip */}
                                    {app.notes && (
                                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
                                            <strong className="text-slate-900 dark:text-slate-100">Recruiter Note / Status:</strong> {app.notes}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

            </div>
        </div>
    );
}
