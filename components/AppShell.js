'use client';
import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';
import Footer from './Footer';
import AiAdvisorWidget from './AiAdvisorWidget';
import MobileBottomNav from './MobileBottomNav';
import PwaManager from './PwaManager';

export default function AppShell({ children }) {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    // Full-bleed landing page has its own complete header, hero, and footer
    const isLandingPage = pathname === '/';
    // Standalone public auth, verification, and offline pages
    const isAuthOrStandalone = pathname === '/login' ||
        pathname === '/signup' ||
        pathname === '/forgot-password' ||
        pathname === '/offline' ||
        pathname.startsWith('/verify');

    if (isLandingPage) {
        return (
            <div className="min-h-screen bg-background text-foreground">
                <PwaManager />
                {children}
            </div>
        );
    }

    if (isAuthOrStandalone) {
        return (
            <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
                <PwaManager />
                <main className="flex-1">
                    {children}
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex">
            {/* PWA Lifecycle & Alerts */}
            <PwaManager />

            {/* 1. LEFT-SIDE VERTICAL SIDEBAR (Desktop & Mobile Drawer) */}
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen}/>

            {/* 2. MAIN IN-APP PORTAL CONTENT AREA */}
            <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-expo ${isCollapsed ? 'lg:pl-[76px]' : 'lg:pl-72'}`}>
                {/* Top Minimal Header (Search + Notifications + Language + Profile) */}
                <TopHeader isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} isWorkflowOpen={false} setIsWorkflowOpen={() => { }}/>

                {/* Page Main Content with mobile bottom bar clearance */}
                <main className="flex-1 min-w-0 flex flex-col pb-16 lg:pb-0">
                    {children}
                </main>

                {/* In-app Footer */}
                <Footer />
            </div>

            {/* Mobile Bottom Navigation Bar (Phone only) */}
            <MobileBottomNav setIsMobileOpen={setIsMobileOpen} />

            {/* Floating AI Career Advisor Assistant */}
            <AiAdvisorWidget />
        </div>
    );
}
