import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import AppShell from '@/components/AppShell';

export const metadata: Metadata = {
  title: 'Skill2Job.ai — AI-Powered Hiring & Skill Verification Platform',
  description: 'An intelligent recruitment and talent discovery SaaS. Connects verified student talent directly with top employers using LLM-driven resume matching, skill verification, and automated interview coaching.',
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
    <html lang="en" className="h-full">
      <body className="min-h-screen bg-slate-50 font-sans antialiased">
        <AuthProvider>
          <AppShell>
            {children}
          </AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
