import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { resumeService } from '../lib/services/resumeService.js';

describe('Resume Tools & ATS Engine Suite', () => {
    describe('ATS Score Calculation', () => {
        it('handles empty or short resumes gracefully with minimum score and diagnostic guidance', () => {
            const shortResult = resumeService.calculateAtsScore('Short summary text');
            assert.equal(shortResult.overallScore, 25);
            assert.equal(shortResult.grade, 'Needs Heavy Improvement');
            assert(shortResult.missingSections.length >= 4);
            assert(shortResult.improvements.length > 0);
        });

        it('scores weak passive resumes with lower action verbs and metrics', () => {
            const weakResume = `
                John Doe
                johndoe@email.com
                
                Work History:
                - Worked on website bug fixes and helped with backend testing.
                - Handled database updates and assisted in client meetings.
                - Was part of the mobile app team and did user interface changes.
                
                Skills:
                Basic HTML, CSS
            `;

            const result = resumeService.calculateAtsScore(weakResume);
            assert(result.overallScore < 65, `Expected score < 65, got ${result.overallScore}`);
            assert(result.weakPhrasesCount >= 3, `Expected at least 3 weak phrases, got ${result.weakPhrasesCount}`);
            assert.equal(result.quantifiedBulletsCount, 0);
            assert(result.improvements.some(imp => imp.toLowerCase().includes('passive') || imp.toLowerCase().includes('quantified')));
        });

        it('scores strong engineering resumes with high section, verb, and metric marks', () => {
            const strongResume = `
                Alex Rivera
                alex.rivera@example.com | +91 9876543210
                Bangalore, India | github.com/alex-rivera

                Education
                B.Tech in Computer Science & Engineering, Apex University, 2026. CGPA: 8.85/10.0

                Technical Skills
                Languages & Frameworks: Python, JavaScript, TypeScript, React, Next.js, Node.js, SQL, PostgreSQL, Redis, Docker, Git

                Experience
                Software Engineering Intern - TechNova Cloud Labs
                - Architected asynchronous task processing service using Python and Redis, reducing queue latency by 42%.
                - Engineered RESTful endpoints in Next.js and PostgreSQL, supporting 5,000+ daily student platform interactions.
                - Automated CI/CD validation workflows with GitHub Actions, eliminating integration regressions and speeding deployments by 30%.

                Projects
                Distributed Task Queue & Cache Manager
                - Constructed distributed job queue handling 1,200 requests/sec with exponential backoff fault tolerance.
                - Containerized service using Docker and multi-stage builds, cutting deployment artifact size by 45%.
            `;

            const result = resumeService.calculateAtsScore(strongResume);
            assert(result.overallScore >= 80, `Expected strong score >= 80, got ${result.overallScore}`);
            assert.equal(result.missingSections.length, 0, 'All core sections should be detected');
            assert(result.strongVerbsCount >= 4, `Expected at least 4 strong verbs, got ${result.strongVerbsCount}`);
            assert(result.quantifiedBulletsCount >= 3, `Expected at least 3 quantified bullets, got ${result.quantifiedBulletsCount}`);
            assert(result.matchedKeywords.length >= 6, `Expected at least 6 matched keywords, got ${result.matchedKeywords.length}`);
            assert(result.strengths.length > 0);
        });

        it('detects missing keywords from a targeted job description', () => {
            const resumeWithoutDocker = `
                Candidate Name
                candidate@test.com
                Education: B.Tech Computer Science
                Skills: Python, JavaScript, React, SQL
                Projects: Built web application with 200+ users.
                Experience: Developed APIs.
            `;

            const jobDescription = `
                Looking for a Senior Backend Engineer proficient in Python, SQL, Docker, Kubernetes, and Microservices architecture.
            `;

            const result = resumeService.calculateAtsScore(resumeWithoutDocker, jobDescription, 'Backend Engineer');
            assert(result.missingKeywords.includes('Docker') || result.missingKeywords.includes('Kubernetes'),
                'Expected Docker or Kubernetes in missingKeywords');
        });
    });

    describe('XYZ / STAR Bullet Point Rewriter', () => {
        it('throws an error if bullet text is blank', async () => {
            await assert.rejects(
                async () => await resumeService.rewriteBulletPoint('   '),
                { message: 'Please provide a bullet point to rewrite.' }
            );
        });

        it('rewrites weak bullets into 3 high-impact XYZ styles via rule engine fallback', async () => {
            const weakBullet = 'worked on python api and fixed database queries';
            const result = await resumeService.rewriteBulletPoint(weakBullet, {
                role: 'Backend Engineer',
                technologies: 'Python, PostgreSQL'
            });

            assert.equal(result.original, weakBullet);
            assert.equal(result.rewrittenBullets.length, 3);

            const [metricDriven, technical, crisp] = result.rewrittenBullets;

            // 1. Metric Driven
            assert.equal(metricDriven.type, 'Metric-Driven & Quantified');
            assert(metricDriven.bullet.toLowerCase().includes('architected') || metricDriven.bullet.toLowerCase().includes('boosted'));
            assert(/\d+%|\d+ms/i.test(metricDriven.bullet), 'Metric bullet should have numbers or percentages');

            // 2. Technical Architecture
            assert.equal(technical.type, 'Technical & Architecture-Focused');
            assert(technical.bullet.toLowerCase().includes('engineered'));

            // 3. Crisp Executive
            assert.equal(crisp.type, 'Crisp & Executive');
            assert(crisp.bullet.toLowerCase().includes('spearheaded'));
            assert(crisp.bullet.split(' ').length < 25, 'Crisp version should be concise');

            assert(result.improvementAnalysis.length > 10);
        });
    });

    describe('Resume Builder from Student Profile', () => {
        it('constructs structured resume pre-filled with verified credentials and badges', async () => {
            const resume = await resumeService.buildResumeFromProfile('std_1');

            assert(resume.personalInfo.fullName, 'Should have fullName');
            assert(resume.personalInfo.email.includes('@'), 'Should have valid email');
            assert(resume.education.length > 0, 'Should have education details');
            assert(resume.skills.verified.length > 0, 'Should have verified skills list');
            assert(resume.experience.length > 0, 'Should have experience list');
            assert(resume.projects.length > 0, 'Should have projects list');
            assert(Array.isArray(resume.certifications), 'Certifications must be an array');

            if (resume.certifications.length > 0) {
                const cert = resume.certifications[0];
                assert(cert.certificateNumber, 'Cert should have certificateNumber');
                assert(cert.verificationUrl, 'Cert should have verificationUrl');
            }
        });
    });
});
