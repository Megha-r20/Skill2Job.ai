'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import GlobalSearchBar from '@/components/GlobalSearchBar';
import ReadinessGauge from '@/components/ReadinessGauge';
import { Briefcase, BookOpen, Award, Compass, Zap, CheckCircle2, ArrowRight, PlayCircle, Code2, ShieldCheck, ChevronRight, Flame, FileCheck, Target, Sparkles, GraduationCap } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function StudentDashboard() {
    const { user, profile } = useAuth();
    const studentId = profile?.id || 'std_1';
    const [studentData, setStudentData] = useState(null);
    const [matchingJobs, setMatchingJobs] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const [stdRes, jobsRes, crsRes] = await Promise.all([
                    fetch(`/api/students/${studentId}`),
                    fetch(`/api/jobs?studentId=${studentId}&sort=best_match`),
                    fetch(`/api/courses`)
                ]);
                const sData = await stdRes.json();
                const jData = await jobsRes.json();
                const cData = await crsRes.json();
                if (sData.student)
                    setStudentData(sData);
                if (jData.jobs)
                    setMatchingJobs(jData.jobs);
                if (cData.courses)
                    setCourses(cData.courses);
            }
            catch (e) {
                console.error('Error loading student dashboard:', e);
            }
            finally {
                setLoading(false);
            }
        }
        loadData();
    }, [studentId]);

    if (loading) {
        return (
            <div className="w-full min-h-[80vh] flex items-center justify-center py-16 bg-slate-50/50 dark:bg-slate-950">
                <div className="text-center space-y-4">
                    <div className="w-12 h-12 border-3 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto shadow-md" />
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold tracking-wide">
                        Personalizing your career & learning roadmap...
                    </p>
                </div>
            </div>
        );
    }

    const student = studentData?.student || {};
    const verifiedSkills = studentData?.verifiedSkills || [
        { id: 'sk_1', skillName: 'Python 3', level: 'Intermediate', score: 92 },
        { id: 'sk_2', skillName: 'React.js', level: 'Advanced', score: 88 },
        { id: 'sk_3', skillName: 'SQL Databases', level: 'Intermediate', score: 85 }
    ];
    const readiness = student?.placementReadiness || profile?.placementReadiness || 65;

    // Format clean display name
    const displayName = profile?.fullName || profile?.name || user?.name || student?.fullName || 'Student Candidate';

    // Format academic details cleanly without empty bullets
    const academicParts = [
        student.collegeName || profile?.collegeName,
        student.department || profile?.department,
        (student.graduationYear || profile?.graduationYear) ? `Class of ${student.graduationYear || profile?.graduationYear}` : null,
        student.cgpa ? `CGPA: ${Number(student.cgpa).toFixed(2)}` : null
    ].filter(Boolean);

    const academicSubtitle = academicParts.length > 0 
        ? academicParts.join(' • ') 
        : 'Student Developer • Preparing for Placements';

    const quickActions = [
        {
            title: 'Find Jobs',
            description: 'Search 25+ open verified roles & check match score',
            icon: Briefcase,
            textColor: 'text-blue-500 dark:text-blue-400',
            bgColor: 'bg-blue-500/10',
            borderColor: 'hover:border-blue-500/40',
            href: '/jobs'
        },
        {
            title: 'Learn a Skill',
            description: 'Explore video masterclasses & notes for any tech',
            icon: BookOpen,
            textColor: 'text-emerald-500 dark:text-emerald-400',
            bgColor: 'bg-emerald-500/10',
            borderColor: 'hover:border-emerald-500/40',
            href: '/learn'
        },
        {
            title: 'Improve My Skills',
            description: 'Target skill gaps & level up for high-match jobs',
            icon: Zap,
            textColor: 'text-purple-500 dark:text-purple-400',
            bgColor: 'bg-purple-500/10',
            borderColor: 'hover:border-purple-500/40',
            href: '/student/skills'
        },
        {
            title: 'Career Roadmap',
            description: 'Step-by-step role progression & milestones',
            icon: Compass,
            textColor: 'text-amber-500 dark:text-amber-400',
            bgColor: 'bg-amber-500/10',
            borderColor: 'hover:border-amber-500/40',
            href: '/student/career-guide'
        },
        {
            title: 'Skill Passport',
            description: 'Official verified credentials & academic report',
            icon: ShieldCheck,
            textColor: 'text-cyan-500 dark:text-cyan-400',
            bgColor: 'bg-cyan-500/10',
            borderColor: 'hover:border-cyan-500/40',
            href: '/student/academic-report'
        }
    ];

    return (
        <ProtectedRoute allowedRoles={['student']}>
            <div className="w-full min-h-screen bg-slate-50/60 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 space-y-8 transition-colors duration-200">
                <div className="max-w-7xl mx-auto space-y-8">
                    
                    {/* ========================================================================= */}
                    {/* 🌟 1. ACTION-CENTRIC HERO: SEARCH & DISCOVERY                              */}
                    {/* ========================================================================= */}
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white shadow-2xl border border-slate-800/80 p-6 sm:p-8 lg:p-10 space-y-6">
                        {/* Background glow highlights */}
                        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800/90 pb-6">
                            
                            <div className="flex items-start gap-4">
                                {/* Student Edition Avatar Icon */}
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-600 p-0.5 shadow-xl shrink-0">
                                    <div className="w-full h-full bg-slate-950/90 rounded-[14px] flex items-center justify-center">
                                        <GraduationCap className="w-7 h-7 text-cyan-400" />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-black uppercase tracking-wider border border-cyan-400/30">
                                            🎓 Student Edition Portal
                                        </span>
                                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
                                            Verified Candidate ✓
                                        </span>
                                    </div>
                                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                                        Welcome back, {displayName}!
                                    </h1>
                                    <p className="text-xs sm:text-sm text-slate-300/90 font-medium">
                                        {academicSubtitle}
                                    </p>
                                </div>
                            </div>

                            {/* Mini Readiness Widget */}
                            <div className="flex items-center gap-3.5 bg-slate-800/90 backdrop-blur-md px-4 py-3 rounded-2xl border border-slate-700/80 shadow-lg shrink-0">
                                <div className="text-right">
                                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Job Readiness</div>
                                    <div className="text-xl font-black text-cyan-300">{readiness}%</div>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                                    <Flame className="w-5 h-5 text-cyan-400" />
                                </div>
                            </div>
                        </div>

                        {/* Universal Search Bar */}
                        <div className="relative z-10 space-y-2">
                            <GlobalSearchBar size="hero" />
                        </div>
                    </div>

                    {/* ========================================================================= */}
                    {/* ⚡ 2. FIVE QUICK ACTIONS                                                   */}
                    {/* ========================================================================= */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-amber-500" />
                                <span>Quick Actions</span>
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                            {quickActions.map((act) => {
                                const Icon = act.icon;
                                return (
                                    <Link
                                        key={act.title}
                                        href={act.href}
                                        className={`p-5 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 ${act.borderColor} hover:shadow-xl hover:-translate-y-0.5 transition-all flex flex-col justify-between space-y-4 group`}
                                    >
                                        <div className="space-y-2.5">
                                            <div className={`w-12 h-12 rounded-2xl ${act.bgColor} ${act.textColor} flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm`}>
                                                <Icon className="w-6 h-6" />
                                            </div>
                                            <h3 className="font-black text-sm text-slate-900 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                                {act.title}
                                            </h3>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                                                {act.description}
                                            </p>
                                        </div>

                                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-slate-400 dark:text-slate-500 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                            <span>Launch</span>
                                            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* ========================================================================= */}
                    {/* 🎯 3. PERSONALIZED RECOMMENDATIONS & PIPELINE                              */}
                    {/* ========================================================================= */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        
                        {/* Left: Recommended Actions for You (2 Cols) */}
                        <div className="lg:col-span-2 space-y-6">
                            
                            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                                            <Target className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">Recommended For You</h2>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Personalized actions to maximize your placement readiness & match score.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {/* Action 1: Learn DSA */}
                                    <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/5 dark:from-amber-950/30 dark:to-orange-950/20 border border-amber-500/20 dark:border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="space-y-1">
                                            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[10px] font-black uppercase">
                                                High Impact Skill Gap
                                            </span>
                                            <h4 className="font-black text-sm text-slate-900 dark:text-slate-100">Learn Data Structures & Algorithms</h4>
                                            <p className="text-xs text-slate-600 dark:text-slate-300">
                                                Required by <strong>18 matching software roles</strong>. Master Binary Trees & Dynamic Programming.
                                            </p>
                                        </div>
                                        <Link href="/courses/crs_dsa/learn" className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shrink-0 flex items-center justify-center gap-1.5 shadow-md shadow-amber-600/20 transition-all">
                                            <PlayCircle className="w-3.5 h-3.5" />
                                            <span>Start DSA Course</span>
                                        </Link>
                                    </div>

                                    {/* Action 2: Python Verification Assessment */}
                                    <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-500/10 to-indigo-500/5 dark:from-purple-950/30 dark:to-indigo-950/20 border border-purple-500/20 dark:border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="space-y-1">
                                            <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-700 dark:text-purple-300 text-[10px] font-black uppercase">
                                                Assessment Ready
                                            </span>
                                            <h4 className="font-black text-sm text-slate-900 dark:text-slate-100">Take Python Verification Assessment</h4>
                                            <p className="text-xs text-slate-600 dark:text-slate-300">
                                                Pass with score ≥ 70% to verify Python on your Skill Passport and boost job match by +25%.
                                            </p>
                                        </div>
                                        <Link href="/assessments/asm_python" className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shrink-0 flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/20 transition-all">
                                            <Award className="w-3.5 h-3.5" />
                                            <span>Take Assessment</span>
                                        </Link>
                                    </div>

                                    {/* Action 3: Practice SQL Coding */}
                                    <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-500/10 to-cyan-500/5 dark:from-blue-950/30 dark:to-cyan-950/20 border border-blue-500/20 dark:border-blue-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="space-y-1">
                                            <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-700 dark:text-blue-300 text-[10px] font-black uppercase">
                                                Coding Practice
                                            </span>
                                            <h4 className="font-black text-sm text-slate-900 dark:text-slate-100">Solve Two-Sum & Array Problems</h4>
                                            <p className="text-xs text-slate-600 dark:text-slate-300">
                                                Solve 2 coding challenges in the live web compiler to test your algorithmic problem solving.
                                            </p>
                                        </div>
                                        <Link href="/student/coding-practice" className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shrink-0 flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20 transition-all">
                                            <Code2 className="w-3.5 h-3.5" />
                                            <span>Open Sandbox</span>
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* Best Matching Jobs Section */}
                            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                                            <Briefcase className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">Best Matching Openings</h2>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Live positions filtered by your verified academic skills.</p>
                                        </div>
                                    </div>
                                    <Link href="/jobs" className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
                                        View All <ChevronRight className="w-3.5 h-3.5" />
                                    </Link>
                                </div>

                                <div className="space-y-3">
                                    {matchingJobs.slice(0, 3).map((job) => (
                                        <div key={job.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 hover:bg-slate-100/70 dark:hover:bg-slate-800 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-black text-sm text-slate-900 dark:text-slate-100">
                                                        <Link href={`/jobs/${job.id}`} className="hover:text-primary-600 dark:hover:text-primary-400">{job.title}</Link>
                                                    </h4>
                                                    <span className="px-2 py-0.5 rounded-full bg-slate-900 dark:bg-slate-950 text-cyan-300 text-[10px] font-black border border-slate-700">
                                                        {job.matchScore || 85}% Match
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                                    {job.companyName} • {job.location} • <span className="font-bold text-slate-800 dark:text-slate-200">{job.salary}</span>
                                                </p>
                                            </div>

                                            <div className="shrink-0">
                                                <Link href={`/jobs/${job.id}`} className="px-3.5 py-1.5 rounded-xl bg-slate-900 dark:bg-primary-600 hover:bg-primary-600 dark:hover:bg-primary-500 text-white font-bold text-xs flex items-center gap-1 transition-colors shadow-sm">
                                                    <span>{job.isEligible ? 'Apply Now' : 'Check Gap'}</span>
                                                    <ArrowRight className="w-3.5 h-3.5" />
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>

                        {/* Right Column: Readiness Score & Verified Passport */}
                        <div className="space-y-6">
                            
                            {/* Readiness Score Breakdown */}
                            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-6 text-center">
                                <h3 className="font-black text-sm text-slate-900 dark:text-slate-100">Comprehensive Readiness</h3>
                                <div className="flex justify-center py-2">
                                    <ReadinessGauge score={readiness} size="lg" title="Job Ready" />
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                    Calculated from <strong>{verifiedSkills.length} verified skills</strong>, academic records, and coursework milestones.
                                </p>
                                <Link href="/student/academic-report" className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1.5 transition-colors">
                                    <FileCheck className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                                    <span>View Official Report</span>
                                </Link>
                            </div>

                            {/* Verified Skill Passport */}
                            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-black text-sm text-slate-900 dark:text-slate-100">Verified Skill Passport</h3>
                                    <Link href="/student/skills" className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline">
                                        Manage
                                    </Link>
                                </div>

                                <div className="space-y-2.5">
                                    {verifiedSkills.map((sk) => (
                                        <div key={sk.id || sk.skillName} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <div className="font-black text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1">
                                                    <span>{sk.skillName}</span>
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                                </div>
                                                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                                                    {sk.level} • Score: {sk.score}%
                                                </div>
                                            </div>
                                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[9px] font-black uppercase border border-emerald-300 dark:border-emerald-800">
                                                Verified
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>

                    </div>

                </div>
            </div>
        </ProtectedRoute>
    );
}
