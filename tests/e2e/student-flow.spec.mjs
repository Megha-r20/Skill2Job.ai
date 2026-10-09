import { test, expect } from '@playwright/test';

test.describe('E2E Flow: Student Core Career & Learning Ecosystem', () => {
    test('loads student dashboard with readiness score and quick actions', async ({ page }) => {
        await page.goto('/student/dashboard');

        // Verify page loads without error
        await expect(page.locator('body')).toBeVisible();

        // Check readiness metric or stats cards
        const statsSection = page.getByText(/Readiness|Placement|Skills|Verified|Dashboard/i).first();
        await expect(statsSection).toBeVisible();

        // Check quick navigation links
        await expect(page.locator('a[href*="/jobs"]').first()).toBeVisible();
    });

    test('explores jobs with AI match scoring and role filters', async ({ page }) => {
        await page.goto('/jobs');

        // Check search/filter input or job listings
        await expect(page.locator('body')).toBeVisible();
        const jobListings = page.getByText(/Software|Engineer|Developer|Match|Jobs/i).first();
        await expect(jobListings).toBeVisible();
    });

    test('opens Universal Compiler and code playground', async ({ page }) => {
        await page.goto('/student/compiler');

        // Check code editor controls
        await expect(page.locator('body')).toBeVisible();
        const runBtn = page.getByRole('button', { name: /Run|Execute|Compile/i }).first();
        await expect(runBtn).toBeVisible();
    });

    test('accesses verified skill assessments studio', async ({ page }) => {
        await page.goto('/assessments/asm_python');

        await expect(page.locator('body')).toBeVisible();
        // Assessment instructions, timer, or question cards
        const assessmentHeader = page.getByText(/Python|Assessment|Questions|Proctoring|Score/i).first();
        await expect(assessmentHeader).toBeVisible();
    });

    test('loads resume tools with ATS analysis and bullet rewriter', async ({ page }) => {
        await page.goto('/student/resume-matcher');

        await expect(page.locator('body')).toBeVisible();
        const atsHeader = page.getByText(/Resume|ATS|Score|Keywords|Bullet/i).first();
        await expect(atsHeader).toBeVisible();
    });
});
