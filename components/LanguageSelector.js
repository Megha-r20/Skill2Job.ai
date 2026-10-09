'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Globe, Check, ChevronDown } from 'lucide-react';

export default function LanguageSelector({ compact = false, variant = 'header' }) {
    const { language, setLanguage, languages, currentMeta } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close on Escape
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    const isLanding = variant === 'landing';

    return (
        <div ref={dropdownRef} className="relative inline-block text-left">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-1.5 transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-xl ${
                    isLanding
                        ? 'px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 border border-slate-800'
                        : compact
                        ? 'p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl'
                        : 'px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-primary-400 dark:hover:border-primary-500 hover:bg-slate-50 dark:hover:bg-slate-800/80 rounded-2xl'
                }`}
                aria-expanded={isOpen}
                aria-label={`Current language: ${currentMeta.name}. Select to switch language.`}
                title={`Language: ${currentMeta.name}`}
            >
                <span className="text-base leading-none select-none">{currentMeta.flag}</span>
                {!compact && (
                    <span className="hidden sm:inline font-bold truncate max-w-[80px]">
                        {currentMeta.nativeName}
                    </span>
                )}
                {compact ? (
                    <span className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400">
                        {currentMeta.code}
                    </span>
                ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 transition-transform duration-200" />
                )}
            </button>

            {isOpen && (
                <div
                    className={`absolute right-0 top-full mt-2 w-56 rounded-2xl shadow-2xl border z-50 p-2 space-y-1 animate-in fade-in-50 zoom-in-95 duration-150 ${
                        isLanding
                            ? 'bg-slate-900 border-slate-800 text-slate-200'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100'
                    }`}
                    role="menu"
                >
                    <div className="px-2.5 py-1.5 border-b border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            <Globe className="w-3.5 h-3.5 text-primary-500" />
                            <span>Select Language</span>
                        </div>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-300">
                            8 Available
                        </span>
                    </div>

                    <div className="max-h-64 overflow-y-auto space-y-0.5 pt-1 scrollbar-thin">
                        {languages.map((l) => {
                            const isSelected = l.code === language;
                            return (
                                <button
                                    key={l.code}
                                    type="button"
                                    onClick={() => {
                                        setLanguage(l.code);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-colors text-left ${
                                        isSelected
                                            ? 'bg-primary-50 dark:bg-primary-950/60 text-primary-800 dark:text-primary-300 font-extrabold'
                                            : isLanding
                                            ? 'hover:bg-slate-800 text-slate-300 hover:text-white'
                                            : 'hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200'
                                    }`}
                                    role="menuitem"
                                >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <span className="text-base select-none">{l.flag}</span>
                                        <div className="flex flex-col truncate">
                                            <span className="font-bold leading-tight truncate">{l.nativeName}</span>
                                            <span className="text-[10px] text-slate-400 dark:text-slate-500">
                                                {l.name} {l.dir === 'rtl' ? '• RTL' : ''}
                                            </span>
                                        </div>
                                    </div>
                                    {isSelected && <Check className="w-4 h-4 text-primary-600 dark:text-primary-400 shrink-0" />}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
