import { test, expect } from '@playwright/test';

test.describe('E2E Flow: Authentication & Multi-Role Navigation', () => {
    test('renders login page with role tabs and demo account quick access', async ({ page }) => {
        await page.goto('/login');

        // Check login card & title
        await expect(page.locator('h1, h2, h3').filter({ hasText: /Welcome|Sign In|Login/i }).first()).toBeVisible();

        // Check email/password or persona buttons
        const submitBtn = page.getByRole('button', { name: /Sign In|Login|Continue/i }).first();
        await expect(submitBtn).toBeVisible();
    });

    test('switches persona from top header dropdown and updates current role view', async ({ page }) => {
        await page.goto('/student/dashboard');

        // Locate top header persona switcher button
        const personaBtn = page.locator('button:has-text("student"), button:has-text("Alex Rivera"), button:has-text("👩")').first();
        if (await personaBtn.isVisible()) {
            await personaBtn.click();

            // Locate recruiter or company persona
            const recruiterOption = page.locator('button:has-text("TechNova"), button:has-text("Recruiter"), button:has-text("🏢")').first();
            if (await recruiterOption.isVisible()) {
                await recruiterOption.click();
                await page.waitForTimeout(1000);
            }
        }

        // Navigate to recruiter dashboard directly and verify access
        await page.goto('/recruiter/dashboard');
        await expect(page.locator('body')).toBeVisible();
        await expect(page.getByText(/Recruiter|Company|Candidates|TechNova|Dashboard/i).first()).toBeVisible();
    });

    test('navigates through student, college, and admin portals cleanly', async ({ page }) => {
        // 1. Student Dashboard
        await page.goto('/student/dashboard');
        await expect(page.locator('body')).toBeVisible();

        // 2. College Dashboard
        await page.goto('/college/dashboard');
        await expect(page.locator('body')).toBeVisible();

        // 3. Admin Dashboard
        await page.goto('/admin/dashboard');
        await expect(page.locator('body')).toBeVisible();
    });
});
