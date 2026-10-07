import React from 'react';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    
                    {/* Col 1: Brand */}
                    <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <span className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">Skill2Job.ai</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            The AI-Powered Student–College–Company Job & Skill Development Platform. Connecting industry demand with student learning and campus placement.
                        </p>
                        <p className="text-xs font-semibold text-primary-600 dark:text-primary-400">
                            “Learn. Verify. Get Hired.”
                        </p>
                    </div>

                    {/* Col 2: For Students */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3">For Students</h4>
                        <ul className="space-y-2 text-xs">
                            <li><Link href="/jobs" className="hover:text-primary-600 dark:hover:text-white transition-colors">Browse Verified Jobs</Link></li>
                            <li><Link href="/courses" className="hover:text-primary-600 dark:hover:text-white transition-colors">Free Structured Courses</Link></li>
                            <li><Link href="/student/skills" className="hover:text-primary-600 dark:hover:text-white transition-colors">Skill Passport & Verification</Link></li>
                            <li><Link href="/student/career-guide" className="hover:text-primary-600 dark:hover:text-white transition-colors">AI Career Roadmaps</Link></li>
                            <li><Link href="/student/applications" className="hover:text-primary-600 dark:hover:text-white transition-colors">Track Applications</Link></li>
                        </ul>
                    </div>

                    {/* Col 3: For Colleges */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3">For Colleges</h4>
                        <ul className="space-y-2 text-xs">
                            <li><Link href="/college/dashboard" className="hover:text-primary-600 dark:hover:text-white transition-colors">Placement Cell Hub</Link></li>
                            <li><Link href="/college/curriculum-gap" className="hover:text-primary-600 dark:hover:text-white transition-colors">Curriculum Gap Analysis</Link></li>
                            <li><Link href="/college/industry-demand" className="hover:text-primary-600 dark:hover:text-white transition-colors">Live Industry Demand</Link></li>
                            <li><Link href="/college/training" className="hover:text-primary-600 dark:hover:text-white transition-colors">Bootcamp Programs</Link></li>
                            <li><Link href="/college/students" className="hover:text-primary-600 dark:hover:text-white transition-colors">Student Roster</Link></li>
                        </ul>
                    </div>

                    {/* Col 4: For Companies */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3">For Companies</h4>
                        <ul className="space-y-2 text-xs">
                            <li><Link href="/recruiter/dashboard" className="hover:text-primary-600 dark:hover:text-white transition-colors">Recruiter Dashboard</Link></li>
                            <li><Link href="/recruiter/jobs/new" className="hover:text-primary-600 dark:hover:text-white transition-colors">Post Job with AI Skill Extraction</Link></li>
                            <li><Link href="/recruiter/candidates" className="hover:text-primary-600 dark:hover:text-white transition-colors">Search Verified Candidates</Link></li>
                            <li><Link href="/recruiter/applications" className="hover:text-primary-600 dark:hover:text-white transition-colors">Application Pipeline</Link></li>
                            <li><Link href="/admin/dashboard" className="hover:text-primary-600 dark:hover:text-white transition-colors">Platform Analytics</Link></li>
                        </ul>
                    </div>

                </div>

                <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 text-center flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 dark:text-slate-500">
                    <p>© {new Date().getFullYear()} Skill2Job.ai Platform. All rights reserved.</p>
                    <div className="flex items-center space-x-4 mt-2 sm:mt-0">
                        <span>Built for Next-Generation Career Readiness</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
