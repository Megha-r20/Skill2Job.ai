import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
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

export const metadata: Metadata = {
  title: 'Skill2Job.ai — AI-Powered Hiring & Skill Verification Platform',
  description: 'An intelligent recruitment and talent discovery SaaS connecting verified student talent directly with top employers using LLM-driven resume matching, skill verification, and automated interview coaching.',
  keywords: 'AI recruitment, skill verification, job board, resume matcher, tech hiring, student placement',
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`h-full ${fontSans.variable} ${fontDisplay.variable} ${fontMono.variable}`}
    >
      <head>
        {/* Anti-FOUC Blocking Theme Initializer */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('skill2hire-theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (saved === 'dark' || (!saved && prefersDark)) {
                    document.documentElement.classList.add('dark');
                    document.documentElement.style.colorScheme = 'dark';
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.style.colorScheme = 'light';
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground font-sans antialiased selection:bg-primary/20 selection:text-primary transition-colors duration-150">
        <AuthProvider>
          <ThemeProvider>
            <AppShell>
              {children}
            </AppShell>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
