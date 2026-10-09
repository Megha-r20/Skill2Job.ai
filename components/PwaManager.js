'use client';
import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Download, WifiOff, Wifi, X, Smartphone, Sparkles } from 'lucide-react';

export default function PwaManager() {
    const { t } = useLanguage();
    const [installPrompt, setInstallPrompt] = useState(null);
    const [isInstalled, setIsInstalled] = useState(false);
    const [showBanner, setShowBanner] = useState(false);
    const [networkStatus, setNetworkStatus] = useState({ online: true, showToast: false });

    useEffect(() => {
        // 1. Service Worker Registration
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator && process.env.NODE_ENV !== 'development') {
            window.addEventListener('load', () => {
                navigator.serviceWorker
                    .register('/sw.js')
                    .then((reg) => {
                        console.log('✅ [PWA] Service Worker registered with scope:', reg.scope);
                    })
                    .catch((err) => {
                        console.warn('⚠️ [PWA] Service Worker registration failed:', err);
                    });
            });
        }

        // 2. Detect Standalone Display (Already Installed)
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                             window.navigator.standalone ||
                             document.referrer.includes('android-app://');
        if (isStandalone) {
            setIsInstalled(true);
        }

        // 3. Capture beforeinstallprompt
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setInstallPrompt(e);
            
            // Check if dismissed in this session
            const dismissed = sessionStorage.getItem('pwa_prompt_dismissed');
            if (!dismissed) {
                // Show after short gentle delay
                setTimeout(() => setShowBanner(true), 3000);
            }
        };

        const handleAppInstalled = () => {
            setIsInstalled(true);
            setShowBanner(false);
            setInstallPrompt(null);
            console.log('🎉 [PWA] Skill2Job App successfully installed!');
        };

        // 4. Online / Offline Network Monitoring
        const handleOnline = () => {
            setNetworkStatus({ online: true, showToast: true });
            setTimeout(() => setNetworkStatus((s) => ({ ...s, showToast: false })), 4000);
        };

        const handleOffline = () => {
            setNetworkStatus({ online: false, showToast: true });
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        if (!navigator.onLine) {
            setNetworkStatus({ online: false, showToast: true });
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!installPrompt) return;
        installPrompt.prompt();
        const { outcome } = await installPrompt.userChoice;
        if (outcome === 'accepted') {
            setShowBanner(false);
            setInstallPrompt(null);
        }
    };

    const handleDismiss = () => {
        setShowBanner(false);
        sessionStorage.setItem('pwa_prompt_dismissed', 'true');
    };

    return (
        <>
            {/* 🌐 Network Status Indicator Toast */}
            {networkStatus.showToast && (
                <div
                    className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl shadow-xl text-xs font-bold transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${
                        networkStatus.online
                            ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                            : 'bg-rose-600 text-white shadow-rose-600/30'
                    }`}
                >
                    {networkStatus.online ? (
                        <>
                            <Wifi className="w-4 h-4 animate-pulse" />
                            <span>{t('pwa.backOnline', 'Back online! Real-time synchronization restored.')}</span>
                        </>
                    ) : (
                        <>
                            <WifiOff className="w-4 h-4" />
                            <span>{t('pwa.offlineNotice', 'You are currently offline. Running in offline PWA mode with cached data.')}</span>
                        </>
                    )}
                    <button
                        onClick={() => setNetworkStatus((s) => ({ ...s, showToast: false }))}
                        className="ml-2 hover:opacity-80 p-0.5"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}

            {/* 📲 PWA Install Prompt Banner (Floating Bottom Banner) */}
            {showBanner && !isInstalled && installPrompt && (
                <div className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-50 max-w-sm w-[calc(100%-2rem)] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-2xl space-y-3 animate-in fade-in slide-in-from-bottom-6">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-cyan-500/25">
                                <Smartphone className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                                    <span>{t('pwa.installTitle', 'Install Skill2Job App')}</span>
                                    <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
                                </h3>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                                    {t('pwa.installDesc', 'Add to your home screen for rapid offline access and instant push alerts.')}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleDismiss}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-xl transition-colors"
                            aria-label="Dismiss banner"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                        <button
                            onClick={handleInstallClick}
                            className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs shadow-md shadow-cyan-500/20 flex items-center justify-center gap-1.5 transition-transform active:scale-95"
                        >
                            <Download className="w-3.5 h-3.5" />
                            <span>{t('pwa.installNow', 'Install App')}</span>
                        </button>
                        <button
                            onClick={handleDismiss}
                            className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs transition-colors"
                        >
                            <span>{t('pwa.maybeLater', 'Later')}</span>
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
