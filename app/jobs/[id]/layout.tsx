import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const job = await prisma.job.findUnique({
      where: { id: params.id }
    });

    if (!job) {
      return {
        title: 'Job Not Found - Skill2Job.ai',
      };
    }

    return {
      title: `${job.title} at ${job.companyName} - Skill2Job.ai`,
      description: `Apply for the ${job.title} position at ${job.companyName}. Location: ${job.location}. Salary: ${job.salary}. Join Skill2Job.ai to get verified and get hired.`,
      openGraph: {
        title: `${job.title} at ${job.companyName}`,
        description: `Apply for the ${job.title} position at ${job.companyName}. Location: ${job.location}.`,
        images: [job.companyLogo || 'https://skill2job.ai/og-image.jpg'],
        type: 'website',
      },
      twitter: {
        card: 'summary',
        title: `${job.title} at ${job.companyName}`,
        description: `Hiring ${job.title} in ${job.location}. Apply now via Skill2Job.ai.`,
        images: [job.companyLogo || 'https://skill2job.ai/og-image.jpg'],
      }
    };
  } catch (error) {
    return {
      title: 'Job Details - Skill2Job.ai',
    };
  }
}

export default function JobLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
