'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
const ThemeContext = createContext(undefined);
export function ThemeProvider({ children }) {
    const [theme, setThemeState] = useState('system');
    const [resolvedTheme, setResolvedTheme] = useState('dark');
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        const saved = localStorage.getItem('skill2hire-theme');
        if (saved && (saved === 'light' || saved === 'dark' || saved === 'system')) {
            setThemeState(saved);
        }
        else {
            setThemeState('system');
        }
        setMounted(true);
    }, []);
    useEffect(() => {
        if (!mounted)
            return;
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const applyTheme = () => {
            let resolved;
            if (theme === 'system') {
                resolved = mediaQuery.matches ? 'dark' : 'light';
            }
            else {
                resolved = theme;
            }
            setResolvedTheme(resolved);
            const root = document.documentElement;
            if (resolved === 'dark') {
                root.classList.add('dark');
                root.style.colorScheme = 'dark';
            }
            else {
                root.classList.remove('dark');
                root.style.colorScheme = 'light';
            }
        };
        applyTheme();
        const handleChange = () => {
            if (theme === 'system') {
                applyTheme();
            }
        };
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme, mounted]);
    const setTheme = (newTheme) => {
        setThemeState(newTheme);
        localStorage.setItem('skill2hire-theme', newTheme);
    };
    const toggleTheme = () => {
        const next = resolvedTheme === 'dark' ? 'light' : 'dark';
        setTheme(next);
    };
    return (<ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>);
}
export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        // Graceful fallback for non-wrapped components or SSR
        return {
            theme: 'system',
            resolvedTheme: 'dark',
            setTheme: () => { },
            toggleTheme: () => { }
        };
    }
    return context;
}
