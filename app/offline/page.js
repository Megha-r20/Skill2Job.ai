'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { WifiOff, Wifi, RefreshCw, Cpu, Award, Compass, ArrowRight } from 'lucide-react';
import Skill2JobLogo from '@/components/Skill2JobLogo';

export default function OfflinePage() {
    const { t } = useLanguage();
    const [isOnline, setIsOnline] = useState(false);
    const [isChecking, setIsChecking] = useState(false);

    useEffect(() => {
        setIsOnline(navigator.onLine);
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const handleRetry = () => {
        setIsChecking(true);
        setTimeout(() => {
            if (navigator.onLine) {
                window.location.reload();
            } else {
                setIsChecking(false);
            }
        }, 800);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6 sm:p-12 relative overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-600/10 blur-[120px] pointer-events-none rounded-full" />

            {/* Header */}
            <header className="flex items-center justify-between max-w-4xl mx-auto w-full z-10">
                <Link href="/">
                    <Skill2JobLogo variant="full" size="md" />
                </Link>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-bold">
                    {isOnline ? (
                        <>
                            <Wifi className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                            <span className="text-emerald-400">{t('common.online', 'Online')}</span>
                        </>
                    ) : (
                        <>
                            <WifiOff className="w-3.5 h-3.5 text-rose-400" />
                            <span className="text-rose-400">{t('common.offline', 'Offline Mode')}</span>
                        </>
                    )}
                </div>
            </header>

            {/* Center Card */}
            <main className="max-w-xl mx-auto w-full text-center space-y-6 my-12 z-10">
                <div className="w-20 h-20 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl mx-auto flex items-center justify-center text-rose-400">
                    <WifiOff className="w-10 h-10" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl sm:text-4xl font-black text-white">
                        {t('pwa.offlineTitle', 'You are Currently Offline')}
                    </h1>
                    <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                        {t('pwa.offlineDesc', 'Skill2Job.ai cached your essential tools and study assets so you can continue learning seamlessly.')}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    <button
                        onClick={handleRetry}
                        disabled={isChecking}
                        className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
                        <span>{t('pwa.retryConnection', 'Retry Connection')}</span>
                    </button>

                    <Link
                        href="/student/compiler"
                        className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                    >
                        <span>{t('pwa.compilerOffline', 'Open Offline Compiler')}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </Link>
                </div>

                {/* Offline Tool Cards */}
                <div className="pt-8 text-left space-y-3">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block text-center">
                        {t('pwa.availableOffline', 'Available Offline Tools')}
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Link
                            href="/student/compiler"
                            className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-cyan-500/40 transition-all group"
                        >
                            <Cpu className="w-5 h-5 text-cyan-400 mb-2 group-hover:scale-110 transition-transform" />
                            <span className="block text-xs font-bold text-slate-200">
                                {t('pwa.compilerOffline', 'Code Sandbox')}
                            </span>
                            <span className="text-[10px] text-slate-500">Run JS, Python in-browser</span>
                        </Link>

                        <Link
                            href="/student/academic-report"
                            className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-purple-500/40 transition-all group"
                        >
                            <Award className="w-5 h-5 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                            <span className="block text-xs font-bold text-slate-200">
                                {t('pwa.passportOffline', 'Skill Passport')}
                            </span>
                            <span className="text-[10px] text-slate-500">View verified credentials</span>
                        </Link>

                        <Link
                            href="/student/career-guide"
                            className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-amber-500/40 transition-all group"
                        >
                            <Compass className="w-5 h-5 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
                            <span className="block text-xs font-bold text-slate-200">
                                {t('pwa.roadmapOffline', 'Career Roadmap')}
                            </span>
                            <span className="text-[10px] text-slate-500">Cached milestones</span>
                        </Link>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="text-center text-xs text-slate-600 max-w-md mx-auto w-full z-10">
                <span>Skill2Job.ai Progressive Web App • Cached for Offline Continuity</span>
            </footer>
        </div>
    );
}
