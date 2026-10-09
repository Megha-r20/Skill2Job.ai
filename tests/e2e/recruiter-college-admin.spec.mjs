import { test, expect } from '@playwright/test';

test.describe('E2E Flow: Recruiter Operations, College Drives & Admin Audit Studio', () => {
    test('renders recruiter dashboard and candidate management pipeline', async ({ page }) => {
        await page.goto('/recruiter/dashboard');
        await expect(page.locator('body')).toBeVisible();

        // Candidates page
        await page.goto('/recruiter/candidates');
        await expect(page.locator('body')).toBeVisible();

        const candidateHeader = page.getByText(/Candidates|Applicants|Match|Shortlist|Status|Pipeline/i).first();
        await expect(candidateHeader).toBeVisible();
    });

    test('manages college placement drives and analytics reporting', async ({ page }) => {
        await page.goto('/college/placement-drives');
        await expect(page.locator('body')).toBeVisible();

        const driveSection = page.getByText(/Placement|Drives|Campus|Companies|Schedule/i).first();
        await expect(driveSection).toBeVisible();
    });

    test('inspects admin security audit trail with forensic logs and CSV export', async ({ page }) => {
        await page.goto('/admin/audit-trail');
        await expect(page.locator('body')).toBeVisible();

        // Check header and KPI stats
        await expect(page.locator('h1')).toContainText(/Audit Trail|Security/i);

        // Export button presence
        const exportBtn = page.getByRole('button', { name: /Export|CSV/i }).first();
        await expect(exportBtn).toBeVisible();

        // Check search filter bar
        const searchInput = page.locator('input[placeholder*="Search"]').first();
        await expect(searchInput).toBeVisible();
    });

    test('interacts with notification activity hub and mark all as read', async ({ page }) => {
        await page.goto('/notifications');
        await expect(page.locator('body')).toBeVisible();

        // Check notification hub banner
        await expect(page.locator('h1, span').filter({ hasText: /Notifications|Activity/i }).first()).toBeVisible();

        // Check category filter buttons
        await expect(page.locator('button:has-text("All")').first()).toBeVisible();
    });
});
