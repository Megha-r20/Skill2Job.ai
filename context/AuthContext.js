'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
const AuthContext = createContext(undefined);
export const DEMO_PERSONAS = [
    {
        role: 'student',
        userId: 'u_student_1',
        name: 'Alex Rivera',
        label: 'Student (Alex Rivera)',
        email: 'alex.rivera@student.skill2job.ai',
        phone: '+91 98765 43210',
        badge: 'B.S. CS 2026',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        description: 'Check skill gaps, learn Python/DSA, take assessments, view academic report, and get placed.'
    },
    {
        role: 'college',
        userId: 'u_col_1',
        name: 'Apex University',
        label: 'College (Apex University)',
        email: 'admin@apexuniversity.edu',
        phone: '+91 98765 43211',
        badge: 'Placement Cell',
        avatar: 'https://images.unsplash.com/photo-1562774053-701939374585?w=150&auto=format&fit=crop&q=80',
        description: 'Monitor student academic transcripts, view skill heatmap, and track batch placements.'
    },
    {
        role: 'company',
        userId: 'u_comp_1',
        name: 'TechNova Recruiter',
        label: 'Company (TechNova)',
        email: 'recruiter@technova.com',
        phone: '+91 98765 43212',
        badge: 'Recruiter Hub',
        avatar: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=150&auto=format&fit=crop&q=80',
        description: 'Post jobs, search verified talent, audit academic transcripts, and hire candidates.'
    },
    {
        role: 'admin',
        userId: 'u_admin',
        name: 'Platform Admin',
        label: 'SuperAdmin',
        email: 'admin@skill2job.ai',
        phone: '+91 98765 43213',
        badge: 'System Admin',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        description: 'Global ecosystem analytics, moderation, transcript audits, and demand management.'
    }
];
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    // Initialize with logged-in user session or active persona
    useEffect(() => {
        fetch('/api/auth/login')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.user) {
                    setUser(data.user);
                    setProfile(data.profile);
                } else {
                    if (typeof window !== 'undefined') {
                        localStorage.removeItem('s2h_user_id');
                        localStorage.removeItem('s2h_role');
                    }
                }
            })
            .catch(e => console.error('Session load error', e))
            .finally(() => setIsLoading(false));
    }, []);

    const switchPersona = async (role, userId) => {
        setIsLoading(true);
        try {
            const persona = DEMO_PERSONAS.find(p => (userId && p.userId === userId) || (role && p.role === role)) || DEMO_PERSONAS[0];
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier: persona.email, password: 'password123' })
            });
            const data = await res.json();
            if (data.success) {
                setUser(data.user);
                setProfile(data.profile);
                if (typeof window !== 'undefined') {
                    localStorage.setItem('s2h_user_id', data.user.id);
                    localStorage.setItem('s2h_role', data.user.role);
                }
                return true;
            }
            return false;
        }
        catch (e) {
            console.error('Failed to switch persona', e);
            return false;
        }
        finally {
            setIsLoading(false);
        }
    };
    const login = async (identifier, passwordOrOtp, isOtp = false) => {
        setIsLoading(true);
        try {
            const payload = isOtp
                ? { identifier, otp: passwordOrOtp }
                : { identifier, password: passwordOrOtp || 'demo123' };
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success && data.user) {
                setUser(data.user);
                setProfile(data.profile);
                if (typeof window !== 'undefined') {
                    localStorage.setItem('s2h_user_id', data.user.id);
                    localStorage.setItem('s2h_role', data.user.role);
                }
                return { success: true, user: data.user, profile: data.profile };
            }
            return { success: false, error: data.error || 'Login failed' };
        }
        catch (e) {
            return { success: false, error: e.message || 'Login error' };
        }
        finally {
            setIsLoading(false);
        }
    };
    const loginWithPhone = async (phone, otp) => {
        return login(phone, otp, true);
    };
    // Gmail / Google login — directly uses our app's identity API (no Supabase redirect)
    const loginWithGoogle = async (emailPrompt) => {
        setIsLoading(true);
        try {
            if (!emailPrompt) {
                return { success: false, error: 'Please enter your Gmail address to continue.' };
            }
            return await loginWithGmail(emailPrompt);
        }
        catch (e) {
            return { success: false, error: e.message || 'Google authentication error' };
        }
        finally {
            setIsLoading(false);
        }
    };
    const loginWithGmail = async (gmailAddress) => {
        setIsLoading(true);
        try {
            const cleanEmail = gmailAddress.trim().toLowerCase();
            const cleanName = cleanEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: cleanEmail,
                    name: cleanName,
                    isGoogleAuth: true
                })
            });
            const data = await res.json();
            // User does not exist yet — send to signup with prefilled Gmail
            if (data.isNewUser || data.requireProfileCompletion) {
                return {
                    success: false,
                    isNewUser: true,
                    email: data.googleEmail || cleanEmail,
                    name: data.googleName || cleanName
                };
            }
            // Existing user — set session and proceed to dashboard
            if (data.success && data.user) {
                setUser(data.user);
                setProfile(data.profile);
                if (typeof window !== 'undefined') {
                    localStorage.setItem('s2h_user_id', data.user.id);
                    localStorage.setItem('s2h_role', data.user.role);
                }
                return { success: true, user: data.user, profile: data.profile };
            }
            return { success: false, error: data.error || 'This Google account is not registered. Please sign up first.' };
        }
        catch (e) {
            return { success: false, error: e.message || 'Gmail login error' };
        }
        finally {
            setIsLoading(false);
        }
    };
    const setAuthSession = (newUser, newProfile) => {
        setUser(newUser);
        if (newProfile)
            setProfile(newProfile);
        if (typeof window !== 'undefined') {
            localStorage.setItem('s2h_user_id', newUser.id);
            localStorage.setItem('s2h_role', newUser.role);
        }
    };
    const logout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            if (typeof window !== 'undefined') {
                localStorage.removeItem('s2h_user_id');
                localStorage.removeItem('s2h_role');
            }
            setUser(null);
            setProfile(null);
        }
        catch (e) {
            console.error('Logout error:', e);
        }
    };
    const refreshProfile = async () => {
        if (!user)
            return;
        try {
            if (user.role === 'student' && profile?.id) {
                const res = await fetch(`/api/students/${profile.id}`);
                const data = await res.json();
                if (data.student)
                    setProfile(data.student);
            }
            else if (user.role === 'college' && profile?.id) {
                const res = await fetch(`/api/colleges/${profile.id}`);
                const data = await res.json();
                if (data.college)
                    setProfile(data.college);
            }
        }
        catch (e) {
            console.error('Failed to refresh profile', e);
        }
    };
    return (<AuthContext.Provider value={{
            user,
            role: user?.role || 'student',
            profile,
            isLoading,
            login,
            loginWithPhone,
            loginWithGoogle,
            loginWithGmail,
            switchPersona,
            setAuthSession,
            logout,
            refreshProfile
        }}>
      {children}
    </AuthContext.Provider>);
}
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
