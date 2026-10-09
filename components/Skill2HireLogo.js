'use client';
import React from 'react';

export function Skill2JobSymbol({ size = 'md', role, className = '' }) {
    const sizeMap = {
        xs: 'w-6 h-6 rounded-md',
        sm: 'w-8 h-8 rounded-lg',
        md: 'w-10 h-10 rounded-xl',
        lg: 'w-14 h-14 rounded-2xl',
        xl: 'w-20 h-20 rounded-2xl',
        '2xl': 'w-32 h-32 rounded-3xl',
        hero: 'w-48 h-48 sm:w-60 sm:h-60 rounded-[36px]'
    };
    return (
        <div className={`relative inline-flex items-center justify-center shrink-0 overflow-hidden shadow-md ${sizeMap[size]} ${className}`}>
            <img src="/logo-app-icon.png" alt="Skill2Job.ai Official App Icon" className="w-full h-full object-cover" />
        </div>
    );
}

export const Skill2HireSymbol = Skill2JobSymbol;

export default function Skill2JobLogo({ variant = 'full', theme = 'light', size = 'md', role, showTagline = true, className = '' }) {
    const isDark = theme === 'dark' || theme === 'white';
    // Sizing maps
    const iconSizeMap = {
        xs: 'w-6 h-6 rounded-md',
        sm: 'w-8 h-8 rounded-lg',
        md: 'w-10 h-10 rounded-xl',
        lg: 'w-12 h-12 rounded-2xl',
        xl: 'w-16 h-16 rounded-2xl',
        '2xl': 'w-24 h-24 rounded-3xl',
        hero: 'w-36 h-36 sm:w-48 sm:h-48 rounded-[32px]'
    };
    const textStyleMap = {
        xs: { text: 'text-sm', num: 'text-sm', tag: 'text-[7px]' },
        sm: { text: 'text-base', num: 'text-base', tag: 'text-[8px]' },
        md: { text: 'text-lg sm:text-xl', num: 'text-xl', tag: 'text-[9px]' },
        lg: { text: 'text-2xl sm:text-3xl', num: 'text-3xl', tag: 'text-xs' },
        xl: { text: 'text-3xl sm:text-4xl', num: 'text-4xl', tag: 'text-sm' },
        '2xl': { text: 'text-5xl', num: 'text-5xl', tag: 'text-base' },
        hero: { text: 'text-6xl sm:text-7xl', num: 'text-7xl', tag: 'text-base' }
    };
    const currentText = textStyleMap[size] || textStyleMap.md;

    // Role Badge configuration
    const roleBadgeConfig = {
        student: {
            label: '🎓 Student Portal',
            classes: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
        },
        college: {
            label: '🏛️ College Portal',
            classes: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
        },
        company: {
            label: '🏢 Recruiter Hub',
            classes: 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800'
        },
        admin: {
            label: '⚙️ SuperAdmin',
            classes: 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
        }
    };

    // Standalone Icon
    if (variant === 'icon' || variant === 'badge') {
        return <Skill2JobSymbol size={size} role={role} className={className} />;
    }

    // Hero Stacked View
    if (variant === 'hero' || (variant === 'full' && size === 'hero')) {
        return (
            <div className={`inline-flex flex-col items-center justify-center text-center space-y-3 ${className}`}>
                <div className={`overflow-hidden shadow-2xl ${iconSizeMap[size]}`}>
                    <img src="/logo-app-icon.png" alt="Skill2Job.ai Hero Mark" className="w-full h-full object-cover" />
                </div>
            </div>
        );
    }

    // Horizontal Full Lockup
    return (
        <div className={`inline-flex items-center gap-2.5 sm:gap-3 select-none ${className}`}>
            {/* Exact Squircle Icon */}
            <div className={`shrink-0 overflow-hidden shadow-md ${iconSizeMap[size]}`}>
                <img src="/logo-app-icon.png" alt="Skill2Job.ai Icon" className="w-full h-full object-cover" />
            </div>

            {/* Wordmark + Dynamic Role Sub-label */}
            <div className="flex flex-col justify-center leading-none">
                <div className="flex items-center tracking-tight font-sans font-black">
                    <span className={`${currentText.text} font-black ${isDark ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                        Skill
                    </span>
                    <span className={`${currentText.num} font-black bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent mx-0.5 transform -rotate-2`}>
                        2
                    </span>
                    <span className={`${currentText.text} font-black ${isDark ? 'text-cyan-300' : 'text-primary-600 dark:text-cyan-400'}`}>
                        Job
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-wider px-1 py-0.5 ml-1 rounded bg-gradient-to-r from-blue-600 to-cyan-500 text-white leading-none shadow-sm">
                        .ai
                    </span>
                </div>

                {/* Role Edition Pill or Tagline */}
                {role && roleBadgeConfig[role] ? (
                    <div className="mt-1">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${roleBadgeConfig[role].classes}`}>
                            {roleBadgeConfig[role].label}
                        </span>
                    </div>
                ) : showTagline ? (
                    <span className={`${currentText.tag} font-extrabold tracking-widest uppercase mt-1 ${isDark ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>
                        Learn. Verify. Get Hired.
                    </span>
                ) : null}
            </div>
        </div>
    );
}

export const Skill2HireLogo = Skill2JobLogo;
