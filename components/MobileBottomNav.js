'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { 
    LayoutDashboard, 
    Briefcase, 
    Code2, 
    Bell, 
    Menu, 
    GraduationCap, 
    Building2, 
    ShieldAlert, 
    Users, 
    FileText 
} from 'lucide-react';

export default function MobileBottomNav({ setIsMobileOpen }) {
    const pathname = usePathname();
    const { role } = useAuth();
    const { t } = useLanguage();
    const [unreadCount, setUnreadCount] = useState(0);

    const currentRole = role || 'student';

    useEffect(() => {
        fetch('/api/notifications?unreadOnly=true')
            .then(res => res.json())
            .then(data => {
                if (data.unreadCount !== undefined) {
                    setUnreadCount(data.unreadCount);
                }
            })
            .catch(() => {});
    }, [pathname]);

    // Role-tailored mobile bottom navigation tabs
    const getTabs = () => {
        if (currentRole === 'college') {
            return [
                { href: '/college/dashboard', label: t('nav.dashboard', 'Dashboard'), icon: LayoutDashboard },
                { href: '/college/placement-drives', label: t('nav.placementDrives', 'Drives'), icon: Building2 },
                { href: '/college/students', label: t('nav.students', 'Students'), icon: Users },
                { href: '/notifications', label: t('common.notifications', 'Alerts'), icon: Bell, badge: unreadCount },
            ];
        }
        if (currentRole === 'company') {
            return [
                { href: '/recruiter/dashboard', label: t('nav.dashboard', 'Dashboard'), icon: LayoutDashboard },
                { href: '/recruiter/jobs', label: t('nav.jobs', 'Jobs'), icon: Briefcase },
                { href: '/recruiter/candidates', label: t('nav.candidates', 'Candidates'), icon: Users },
                { href: '/notifications', label: t('common.notifications', 'Alerts'), icon: Bell, badge: unreadCount },
            ];
        }
        if (currentRole === 'admin') {
            return [
                { href: '/admin/dashboard', label: t('nav.dashboard', 'Dashboard'), icon: LayoutDashboard },
                { href: '/admin/audit-trail', label: t('nav.auditTrail', 'Audit'), icon: ShieldAlert },
                { href: '/college/students', label: t('nav.students', 'Users'), icon: Users },
                { href: '/notifications', label: t('common.notifications', 'Alerts'), icon: Bell, badge: unreadCount },
            ];
        }
        // Default: Student
        return [
            { href: '/student/dashboard', label: t('nav.dashboard', 'Home'), icon: LayoutDashboard },
            { href: '/jobs', label: t('nav.jobs', 'Jobs'), icon: Briefcase },
            { href: '/student/coding-practice', label: t('nav.codingPractice', 'Practice'), icon: Code2 },
            { href: '/notifications', label: t('common.notifications', 'Alerts'), icon: Bell, badge: unreadCount },
        ];
    };

    const tabs = getTabs();

    return (
        <nav 
            className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.3)] pb-[max(0.5rem,env(safe-area-inset-bottom))] print:hidden"
            aria-label="Mobile Navigation"
        >
            <div className="grid grid-cols-5 h-14 max-w-md mx-auto items-center">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = pathname === tab.href || 
                        (tab.href !== '/student/dashboard' && 
                         tab.href !== '/college/dashboard' && 
                         tab.href !== '/recruiter/dashboard' && 
                         tab.href !== '/admin/dashboard' && 
                         pathname.startsWith(tab.href));

                    return (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            className={`flex flex-col items-center justify-center h-full relative transition-all active:scale-90 ${
                                isActive 
                                    ? 'text-primary-600 dark:text-primary-400 font-extrabold' 
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                            }`}
                        >
                            {/* Active Top Highlight Bar */}
                            {isActive && (
                                <span className="absolute top-0 w-8 h-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-b-full shadow-sm" />
                            )}

                            <div className="relative">
                                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                                {Boolean(tab.badge && tab.badge > 0) && (
                                    <span className="absolute -top-1 -right-1.5 min-w-[14px] h-[14px] bg-rose-500 text-white rounded-full text-[9px] font-black flex items-center justify-center px-0.5 ring-2 ring-white dark:ring-slate-900">
                                        {tab.badge > 9 ? '9+' : tab.badge}
                                    </span>
                                )}
                            </div>
                            <span className="text-[10px] tracking-tight mt-0.5 truncate max-w-[56px]">
                                {tab.label}
                            </span>
                        </Link>
                    );
                })}

                {/* 5th Tab: Menu Drawer Toggle */}
                <button
                    type="button"
                    onClick={() => setIsMobileOpen(true)}
                    className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 active:scale-90 transition-all"
                    aria-label="Open Navigation Menu"
                >
                    <Menu className="w-5 h-5" />
                    <span className="text-[10px] tracking-tight mt-0.5">
                        {t('common.actions', 'Menu')}
                    </span>
                </button>
            </div>
        </nav>
    );
}
