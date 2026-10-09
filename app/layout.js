import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';
import AppShell from '@/components/AppShell';

const fontSans = Inter({
    subsets: ['latin'],
    variable: '--font-sans',
    display: 'swap',
});
const fontDisplay = Plus_Jakarta_Sans({
    subsets: ['latin'],
    variable: '--font-display',
    display: 'swap',
});
const fontMono = JetBrains_Mono({
    subsets: ['latin'],
    variable: '--font-mono',
    display: 'swap',
});

export const viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    themeColor: [
        { media: '(prefers-color-scheme: light)', color: '#0284c7' },
        { media: '(prefers-color-scheme: dark)', color: '#020617' }
    ],
    viewportFit: 'cover'
};

export const metadata = {
    title: 'Skill2Job.ai — AI-Powered Hiring & Skill Verification Platform',
    description: 'An intelligent recruitment and talent discovery SaaS connecting verified student talent directly with top employers using LLM-driven resume matching, skill verification, and automated interview coaching.',
    keywords: 'AI recruitment, skill verification, job board, resume matcher, tech hiring, student placement, PWA',
    manifest: '/manifest.json',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'default',
        title: 'Skill2Job.ai'
    },
    icons: {
        icon: [
            { url: '/favicon.ico' },
            { url: '/icon.svg', type: 'image/svg+xml' },
            { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
            { url: '/icon-512.png', sizes: '512x512', type: 'image/png' }
        ],
        apple: [
            { url: '/icon-192.png', sizes: '192x192' }
        ]
    },
    openGraph: {
        title: 'Skill2Job.ai — AI-Powered Hiring & Skill Verification',
        description: 'Connects verified student talent directly with top employers using AI-driven matching and skill assessments.',
        url: 'https://skill2job.ai',
        siteName: 'Skill2Job.ai',
        images: [
            {
                url: 'https://skill2job.ai/og-image.jpg',
                width: 1200,
                height: 630,
                alt: 'Skill2Job Dashboard Preview',
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Skill2Job.ai — AI-Powered Hiring',
        description: 'Connects verified student talent directly with top employers.',
        images: ['https://skill2job.ai/og-image.jpg'],
    },
    robots: {
        index: true,
        follow: true,
    }
};

export default function RootLayout({ children, }) {
    return (<html lang="en" suppressHydrationWarning className={`h-full ${fontSans.variable} ${fontDisplay.variable} ${fontMono.variable}`}>
      <head>
        {/* Anti-FOUC Blocking Theme & Language Initializer */}
        <script dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // Theme initializer
                  var saved = localStorage.getItem('skill2hire-theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (saved === 'dark' || (!saved && prefersDark)) {
                    document.documentElement.classList.add('dark');
                    document.documentElement.style.colorScheme = 'dark';
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.style.colorScheme = 'light';
                  }

                  // Language & Direction initializer
                  var savedLang = localStorage.getItem('skill2hire_lang');
                  if (savedLang) {
                    document.documentElement.lang = savedLang;
                    if (savedLang === 'ar') {
                      document.documentElement.dir = 'rtl';
                      document.documentElement.classList.add('rtl-layout');
                    }
                  }
                } catch(e) {}
              })();
            `,
        }}/>
      </head>
      <body className="min-h-screen bg-background text-foreground font-sans antialiased selection:bg-primary/20 selection:text-primary transition-colors duration-150">
        <AuthProvider>
          <ThemeProvider>
            <LanguageProvider>
              <AppShell>
                {children}
              </AppShell>
            </LanguageProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>);
}
