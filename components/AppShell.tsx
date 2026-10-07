'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';
import Footer from './Footer';
import AiAdvisorWidget from './AiAdvisorWidget';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Full-bleed landing page has its own complete header, hero, and footer
  const isLandingPage = pathname === '/';

  // Standalone public auth and verification pages
  const isAuthOrStandalone =
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname === '/forgot-password' ||
    pathname.startsWith('/verify');

  if (isLandingPage) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        {children}
      </div>
    );
  }

  if (isAuthOrStandalone) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* 1. LEFT-SIDE VERTICAL SIDEBAR (In-app only) */}
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* 2. MAIN IN-APP PORTAL CONTENT AREA */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-expo ${
          isCollapsed ? 'lg:pl-[76px]' : 'lg:pl-72'
        }`}
      >
        {/* Top Minimal Header (Search + Notifications + Profile) */}
        <TopHeader
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
          isWorkflowOpen={false}
          setIsWorkflowOpen={() => {}}
        />

        {/* Page Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>

        {/* In-app Footer */}
        <Footer />
      </div>

      {/* Floating AI Career Advisor Assistant */}
      <AiAdvisorWidget />
    </div>
  );
}
