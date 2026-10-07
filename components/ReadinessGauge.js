import React from 'react';

export default function ReadinessGauge({ score, title = 'Placement Readiness', subtitle = 'Calculated from verified skills, assessments, CGPA & course completions', size = 'md' }) {
    const normalizedScore = Math.max(0, Math.min(100, score));
    // Determine readiness status & colors
    let colorClass = 'text-amber-600 dark:text-amber-400';
    let bgClass = 'from-amber-500 to-orange-500';
    let statusText = 'Needs Training';
    let badgeColor = 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    if (normalizedScore >= 80) {
        colorClass = 'text-emerald-600 dark:text-emerald-400';
        bgClass = 'from-emerald-500 to-teal-500';
        statusText = 'Placement Ready ✓';
        badgeColor = 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
    }
    else if (normalizedScore >= 60) {
        colorClass = 'text-blue-600 dark:text-blue-400';
        bgClass = 'from-blue-500 to-indigo-500';
        statusText = 'In Training';
        badgeColor = 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    }

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden text-left transition-colors">
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center space-x-2">
                        <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{title}</h3>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${badgeColor}`}>
                            {statusText}
                        </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">{subtitle}</p>
                </div>

                <div className="text-right">
                    <span className={`text-3xl font-extrabold tracking-tight ${colorClass}`}>
                        {normalizedScore}%
                    </span>
                </div>
            </div>

            {/* Progress Bar with Milestones */}
            <div className="mt-4">
                <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
                    <div className={`h-full rounded-full bg-gradient-to-r ${bgClass} transition-all duration-700 ease-out`} style={{ width: `${normalizedScore}%` }} />
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400 dark:text-slate-500 mt-1.5 font-medium">
                    <span>0% Foundations</span>
                    <span>50% In Training</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">80%+ Placement Ready</span>
                    <span>100% Elite</span>
                </div>
            </div>

            {/* Criteria Breakdown Pillars */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-4 gap-2 text-center text-xs">
                <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/80">
                    <span className="block text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold">Verified Skills</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">40% Weight</span>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/80">
                    <span className="block text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold">Assessments</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">25% Weight</span>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/80">
                    <span className="block text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold">Job Match</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">20% Weight</span>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/80">
                    <span className="block text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold">Education & CGPA</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">15% Weight</span>
                </div>
            </div>
        </div>
    );
}
