'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Sparkles, Briefcase, BookOpen, Award, Building2, ArrowRight } from 'lucide-react';

export default function GlobalSearchBar({ initialQuery = '', size = 'hero', className = '', autoFocus = false }) {
    const router = useRouter();
    const [query, setQuery] = useState(initialQuery);
    const [isFocused, setIsFocused] = useState(false);

    const handleSearch = (e) => {
        e.preventDefault();
        if (!query.trim())
            return;
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    };

    const handleQuickChip = (term) => {
        setQuery(term);
        router.push(`/search?q=${encodeURIComponent(term)}`);
    };

    const quickPicks = [
        { label: 'Python Developer', type: 'job' },
        { label: 'Data Scientist', type: 'job' },
        { label: 'DSA Masterclass', type: 'course' },
        { label: 'SQL', type: 'skill' },
        { label: 'AWS Cloud', type: 'skill' },
        { label: 'TechNova', type: 'company' }
    ];

    const isHero = size === 'hero';

    return (
        <div className={`relative w-full max-w-3xl mx-auto ${className}`}>
            <form onSubmit={handleSearch} className="relative">
                <div className={`relative flex items-center bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border transition-all duration-200 shadow-xl ${isFocused
                    ? 'border-primary-500 ring-4 ring-primary-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'} ${isHero ? 'p-2 sm:p-2.5' : 'p-1.5'}`}>
                    <div className="pl-3 sm:pl-4 pr-2 text-slate-400 dark:text-slate-500">
                        <Search className={isHero ? 'w-6 h-6 text-primary-600 dark:text-primary-400' : 'w-5 h-5 text-slate-500 dark:text-slate-400'} />
                    </div>

                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                        autoFocus={autoFocus}
                        placeholder="Search jobs, skills, courses or companies..."
                        className={`w-full bg-transparent border-0 focus:outline-none focus:ring-0 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium ${isHero ? 'text-base sm:text-lg py-2' : 'text-sm py-1.5'}`}
                    />

                    {query && (
                        <button
                            type="button"
                            onClick={() => setQuery('')}
                            className="px-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold"
                        >
                            Clear
                        </button>
                    )}

                    <button
                        type="submit"
                        className={`shrink-0 rounded-xl font-bold bg-primary-600 hover:bg-primary-500 text-white flex items-center justify-center gap-1.5 transition-all shadow-md shadow-primary-600/25 ${isHero ? 'px-5 sm:px-7 py-3 text-sm sm:text-base' : 'px-4 py-2 text-xs'}`}
                    >
                        <span>Search</span>
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </form>

            {/* Quick Search Chips */}
            {isHero && (
                <div className="flex flex-wrap items-center justify-center gap-2 mt-3 pt-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 dark:text-slate-400 mr-1 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-primary-400" /> Popular:
                    </span>
                    {quickPicks.map((pick) => (
                        <button
                            key={pick.label}
                            onClick={() => handleQuickChip(pick.label)}
                            className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white text-xs font-semibold border border-white/15 hover:border-white/30 backdrop-blur-sm transition-all shadow-sm flex items-center gap-1.5"
                        >
                            {pick.type === 'job' && <Briefcase className="w-3 h-3 text-blue-400" />}
                            {pick.type === 'course' && <BookOpen className="w-3 h-3 text-emerald-400" />}
                            {pick.type === 'skill' && <Award className="w-3 h-3 text-purple-400" />}
                            {pick.type === 'company' && <Building2 className="w-3 h-3 text-amber-400" />}
                            <span>{pick.label}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
