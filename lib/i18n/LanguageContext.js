'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE, getLanguageMeta } from './languages';
import { translations, getTranslation } from './translations';

const LanguageContext = createContext({
    language: DEFAULT_LANGUAGE,
    setLanguage: () => {},
    t: (key, fallback, params) => fallback || key,
    languages: SUPPORTED_LANGUAGES,
    currentMeta: SUPPORTED_LANGUAGES[0],
    isRTL: false,
    dir: 'ltr'
});

export const STORAGE_KEY = 'skill2job_lang';

export function LanguageProvider({ children }) {
    const [language, setLanguageState] = useState(DEFAULT_LANGUAGE);
    const [isHydrated, setIsHydrated] = useState(false);

    // Hydrate initial language from localStorage or browser preference
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved && SUPPORTED_LANGUAGES.some(l => l.code === saved)) {
                setLanguageState(saved);
            } else if (typeof navigator !== 'undefined' && navigator.language) {
                const browserLang = navigator.language.slice(0, 2).toLowerCase();
                if (SUPPORTED_LANGUAGES.some(l => l.code === browserLang)) {
                    setLanguageState(browserLang);
                }
            }
        } catch (e) {
            // LocalStorage inaccessible
        }
        setIsHydrated(true);
    }, []);

    // Sync HTML document lang and dir attributes whenever language changes
    useEffect(() => {
        const meta = getLanguageMeta(language);
        if (typeof document !== 'undefined') {
            document.documentElement.lang = language;
            document.documentElement.dir = meta.dir;
            if (meta.dir === 'rtl') {
                document.documentElement.classList.add('rtl-layout');
            } else {
                document.documentElement.classList.remove('rtl-layout');
            }
        }
    }, [language]);

    const setLanguage = useCallback((newLang) => {
        if (!SUPPORTED_LANGUAGES.some(l => l.code === newLang)) return;
        setLanguageState(newLang);
        try {
            localStorage.setItem(STORAGE_KEY, newLang);
            document.cookie = `${STORAGE_KEY}=${newLang}; path=/; max-age=31536000; SameSite=Lax`;
        } catch (e) {
            // Ignore storage write issues
        }
    }, []);

    const t = useCallback((keyPath, fallback = '', params = {}) => {
        return getTranslation(language, keyPath, fallback, params);
    }, [language]);

    const currentMeta = getLanguageMeta(language);
    const isRTL = currentMeta.dir === 'rtl';

    return (
        <LanguageContext.Provider
            value={{
                language,
                setLanguage,
                t,
                languages: SUPPORTED_LANGUAGES,
                currentMeta,
                isRTL,
                dir: currentMeta.dir,
                isHydrated
            }}
        >
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
