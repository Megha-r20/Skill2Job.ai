'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth, DEMO_PERSONAS } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import LanguageSelector from '@/components/LanguageSelector';
import { Menu, Search, Bell, ChevronDown, X, ShieldCheck, Sun, Moon } from 'lucide-react';
import SecuritySettingsModal from '@/components/SecuritySettingsModal';

export default function TopHeader({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen, isWorkflowOpen, setIsWorkflowOpen }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, profile, role, switchPersona } = useAuth();
    const { resolvedTheme, toggleTheme } = useTheme();
    const { t } = useLanguage();
    const currentRole = role || 'student';

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchResults, setSearchResults] = useState([]);

    // Notifications State
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);

    // Persona & Security Menu State
    const [isPersonaOpen, setIsPersonaOpen] = useState(false);
    const [isSecurityOpen, setIsSecurityOpen] = useState(false);
    const searchRef = useRef(null);
    const notifRef = useRef(null);
    const personaRef = useRef(null);

    // Fetch notifications
    useEffect(() => {
        fetch('/api/notifications')
            .then(res => res.json())
            .then(data => {
                if (data.notifications)
                    setNotifications(data.notifications);
            })
            .catch(() => { });
    }, [user]);

    // Click outside listener for dropdowns
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setIsSearchOpen(false);
            }
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setIsNotifOpen(false);
            }
            if (personaRef.current && !personaRef.current.contains(e.target)) {
                setIsPersonaOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Global Search indexing across roles
    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }
        const q = searchQuery.toLowerCase();
        const searchableItems = [
            // Jobs
            { title: 'Software Developer (Python/DSA)', category: 'Jobs', link: '/jobs/job_1', role: 'all' },
            { title: 'Full Stack Engineer (React/Node)', category: 'Jobs', link: '/jobs', role: 'all' },
            { title: 'Data Scientist (Machine Learning)', category: 'Jobs', link: '/jobs', role: 'all' },
            // Courses
            { title: 'Python Fundamentals & OOP', category: 'Courses', link: '/courses', role: 'all' },
            { title: 'Data Structures & Algorithms', category: 'Courses', link: '/courses', role: 'all' },
            { title: 'SQL & Database Design', category: 'Courses', link: '/courses', role: 'all' },
            // Student Modules
            { title: 'Official Student Academic Report', category: 'Student', link: '/student/academic-report', role: 'student' },
            { title: 'AI Coding Practice Arena', category: 'Student', link: '/student/coding-practice', role: 'student' },
            { title: 'AI Interview Coach', category: 'Student', link: '/student/interview-coach', role: 'student' },
            { title: 'Skill Passport & Verification', category: 'Student', link: '/student/skills', role: 'student' },
            { title: 'Become Job Ready Pathway', category: 'Student', link: '/student/become-ready', role: 'student' },
            // College Modules
            { title: 'College Student Roster & Transcripts', category: 'College', link: '/college/students', role: 'college' },
            { title: 'Skill Gap Heatmap', category: 'College', link: '/college/skill-heatmap', role: 'college' },
            { title: 'Curriculum Gap Analysis', category: 'College', link: '/college/curriculum-gap', role: 'college' },
            { title: 'Batch Placement Readiness', category: 'College', link: '/college/placement-readiness', role: 'college' },
            // Recruiter Modules
            { title: 'Post New Job with AI Extraction', category: 'Recruiter', link: '/recruiter/jobs/new', role: 'company' },
            { title: 'Skill-First Candidate Search', category: 'Recruiter', link: '/recruiter/skill-search', role: 'company' },
            { title: 'Campus Talent Funnel', category: 'Recruiter', link: '/recruiter/campus-pipeline', role: 'company' },
            { title: 'Candidate Applications', category: 'Recruiter', link: '/recruiter/applications', role: 'company' },
        ];
        const filtered = searchableItems.filter(item => item.title.toLowerCase().includes(q) || item.category.toLowerCase().includes(q));
        setSearchResults(filtered);
    }, [searchQuery]);

    // Generate dynamic breadcrumbs (deduplicated)
    const getBreadcrumbs = () => {
        const parts = pathname.split('/').filter(Boolean);
        if (parts.length === 0)
            return ['Skill2Job', 'Dashboard'];
        const roleLabel = currentRole.charAt(0).toUpperCase() + currentRole.slice(1);
        const trail = ['Skill2Job'];
        parts.forEach((p, idx) => {
            const formatted = p.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
            if (idx === 0 && formatted.toLowerCase() === roleLabel.toLowerCase()) {
                trail.push(roleLabel);
            } else if (idx === 0) {
                trail.push(roleLabel);
                trail.push(formatted);
            } else {
                trail.push(formatted);
            }
        });
        return trail;
    };
    const breadcrumbs = getBreadcrumbs();
    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 min-h-[70px] px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 print:hidden transition-colors">
            {/* LEFT: Mobile Menu Toggle & Dynamic Breadcrumbs */}
            <div className="flex items-center gap-3">
                <button
                    onClick={() => setIsMobileOpen(!isMobileOpen)}
                    className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                    title="Open Navigation Menu"
                >
                    <Menu className="w-5 h-5" />
                </button>

                {/* Breadcrumbs Navigation */}
                <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 font-semibold overflow-hidden max-w-md">
                    {breadcrumbs.map((crumb, idx) => (
                        <React.Fragment key={idx}>
                            {idx > 0 && <span className="text-slate-300 dark:text-slate-600">/</span>}
                            <span className={idx === breadcrumbs.length - 1 ? 'font-extrabold text-slate-800 dark:text-slate-100' : 'hover:text-slate-600 dark:hover:text-slate-300 truncate'}>
                                {crumb}
                            </span>
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* CENTER: Global Search Bar */}
            <div ref={searchRef} className="flex-1 max-w-md relative hidden md:block">
                <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
                    <input
                        type="text"
                        placeholder={`Search ${currentRole === 'student' ? 'jobs, courses, skills...' : currentRole === 'college' ? 'students, demand, heatmap...' : 'candidates, skills, jobs...'}`}
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setIsSearchOpen(true);
                        }}
                        onFocus={() => setIsSearchOpen(true)}
                        className="w-full pl-10 pr-8 py-2 text-xs bg-slate-100/80 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-800 dark:text-slate-100"
                    />
                    {searchQuery && (
                        <button onClick={() => { setSearchQuery(''); setIsSearchOpen(false); }} className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>

                {/* Search Results Dropdown */}
                {isSearchOpen && searchResults.length > 0 && (
                    <div className="absolute top-full mt-2 left-0 right-0 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl p-2 z-50 space-y-1 max-h-80 overflow-y-auto">
                        <div className="px-3 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                            Quick Navigation Matches
                        </div>
                        {searchResults.map((res, i) => (
                            <Link
                                key={i}
                                href={res.link}
                                onClick={() => setIsSearchOpen(false)}
                                className="flex items-center justify-between px-3 py-2 rounded-xl text-xs hover:bg-primary-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 hover:text-primary-900 transition-colors"
                            >
                                <span className="font-bold">{res.title}</span>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 font-semibold">
                                    {res.category}
                                </span>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* RIGHT CONTROLS: Language, Theme Toggle, Notifications, Persona Switcher */}
            <div className="flex items-center gap-1.5 sm:gap-2.5">
                {/* Multi-Language Selector Dropdown */}
                <LanguageSelector compact={true} variant="header" />

                {/* Dark / Light Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title={resolvedTheme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
                    aria-label="Toggle Color Theme"
                >
                    {resolvedTheme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600 dark:text-slate-300" />}
                </button>

                {/* Notifications Popover */}
                <div ref={notifRef} className="relative">
                    <button
                        onClick={() => setIsNotifOpen(!isNotifOpen)}
                        className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
                        title="Notifications"
                    >
                        <Bell className="w-5 h-5" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
                        )}
                    </button>

                    {isNotifOpen && (
                        <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl p-4 z-50 space-y-3">
                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2">
                                <span className="font-extrabold text-xs text-slate-900 dark:text-slate-100">Ecosystem Notifications</span>
                                <span className="text-[10px] bg-primary-100 dark:bg-primary-950 text-primary-800 dark:text-primary-300 font-bold px-2 py-0.5 rounded-full">
                                    {notifications.length} Total
                                </span>
                            </div>

                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <p className="text-xs text-slate-400 dark:text-slate-500 py-3 text-center">No new notifications</p>
                                ) : (
                                    notifications.map((n) => (
                                        <div key={n.id} className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600/50 space-y-1 text-xs">
                                            <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                                                <span>{n.title}</span>
                                                <span className="text-[9px] text-slate-400 dark:text-slate-500 font-normal">
                                                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400">{n.message}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* 1-Click Role / Persona Switcher Dropdown */}
                <div ref={personaRef} className="relative">
                    <button
                        onClick={() => setIsPersonaOpen(!isPersonaOpen)}
                        className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-primary-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-left"
                    >
                        <div className="w-7 h-7 rounded-xl bg-slate-900 dark:bg-slate-700 text-white flex items-center justify-center font-bold text-xs">
                            {currentRole === 'student' ? '👩' : currentRole === 'college' ? '🎓' : currentRole === 'company' ? '🏢' : '👑'}
                        </div>
                        <div className="hidden sm:block text-xs leading-tight">
                            <span className="block font-bold text-slate-900 dark:text-slate-100 capitalize truncate max-w-[110px]">
                                {profile?.name || user?.name || 'Alex Rivera'}
                            </span>
                            <span className="text-[10px] font-bold text-primary-600 dark:text-primary-400 capitalize block">
                                {currentRole}
                            </span>
                        </div>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                    </button>

                    {isPersonaOpen && (
                        <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl p-3 z-50 space-y-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2 block">
                                Fast Switch Demo Persona:
                            </span>

                            <div className="space-y-1">
                                {DEMO_PERSONAS.map((p) => (
                                    <button
                                        key={p.userId}
                                        onClick={async () => {
                                            await switchPersona(p.role, p.userId);
                                            setIsPersonaOpen(false);
                                            if (p.role === 'student')
                                                router.push('/student/dashboard');
                                            else if (p.role === 'college')
                                                router.push('/college/dashboard');
                                            else if (p.role === 'company')
                                                router.push('/recruiter/dashboard');
                                            else
                                                router.push('/admin/dashboard');
                                        }}
                                        className={`w-full flex items-center gap-2.5 p-2 rounded-2xl text-left text-xs transition-colors ${currentRole === p.role ? 'bg-primary-50 dark:bg-primary-950/50 text-primary-900 dark:text-primary-300 font-extrabold' : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'}`}
                                    >
                                        <span className="text-base">{p.role === 'student' ? '👩🎓' : p.role === 'college' ? '🎓' : p.role === 'company' ? '🏢' : '👑'}</span>
                                        <div className="overflow-hidden flex-1 leading-tight">
                                            <span className="block font-bold truncate">{p.name}</span>
                                            <span className="text-[10px] text-slate-400 dark:text-slate-500 capitalize">{p.badge}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex flex-col gap-1 text-xs px-2">
                                <button
                                    type="button"
                                    onClick={() => { setIsPersonaOpen(false); setIsSecurityOpen(true); }}
                                    className="w-full text-left font-bold text-slate-700 dark:text-slate-200 hover:text-primary-600 dark:hover:text-primary-400 flex items-center gap-1.5 py-1"
                                >
                                    <ShieldCheck className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
                                    <span>Update Verified Email / Phone (OTP)</span>
                                </button>
                                <Link
                                    href="/login"
                                    onClick={() => setIsPersonaOpen(false)}
                                    className="font-bold text-primary-600 dark:text-primary-400 hover:underline py-1"
                                >
                                    Unified Login & Switch Account →
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Security & Contact OTP Settings Modal */}
            <SecuritySettingsModal isOpen={isSecurityOpen} onClose={() => setIsSecurityOpen(false)} />
        </header>
    );
}
