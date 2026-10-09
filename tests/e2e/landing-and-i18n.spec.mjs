import { test, expect } from '@playwright/test';

test.describe('E2E Flow: Landing Page, i18n Localization & PWA Continuity', () => {
    test('renders landing page hero, navigation, and role CTA links', async ({ page }) => {
        await page.goto('/');

        // Verify title & branding
        await expect(page).toHaveTitle(/Skill2Job\.ai/i);

        // Verify hero elements
        const getStartedBtn = page.getByRole('link', { name: /Get Started/i }).first();
        await expect(getStartedBtn).toBeVisible();

        const signInBtn = page.getByRole('link', { name: /Sign In/i }).first();
        await expect(signInBtn).toBeVisible();

        // Verify key navigation sections exist
        await expect(page.locator('text=Platform Features').first()).toBeVisible();
    });

    test('switches language dynamically via LanguageSelector and updates document lang', async ({ page }) => {
        await page.goto('/');

        // Initial language is English
        const htmlLang = await page.getAttribute('html', 'lang');
        expect(htmlLang).toBe('en');

        // Locate and click language switcher button
        const langBtn = page.locator('button[title*="Language"]').first();
        await expect(langBtn).toBeVisible();
        await langBtn.click();

        // Select Hindi (हिन्दी)
        const hindiOption = page.locator('button:has-text("हिन्दी")').first();
        await expect(hindiOption).toBeVisible();
        await hindiOption.click();

        // Verify html lang attribute changed to 'hi'
        await expect(page.locator('html')).toHaveAttribute('lang', 'hi');

        // Verify localized UI text rendered
        await expect(page.locator('text=शुरू करें').first()).toBeVisible();
    });

    test('verifies PWA manifest and service worker assets return 200 OK', async ({ request }) => {
        // 1. Manifest
        const manifestRes = await request.get('/manifest.json');
        expect(manifestRes.status()).toBe(200);
        const manifestJson = await manifestRes.json();
        expect(manifestJson.name).toContain('Skill2Job');
        expect(manifestJson.display).toBe('standalone');

        // 2. Service Worker
        const swRes = await request.get('/sw.js');
        expect(swRes.status()).toBe(200);
        const swText = await swRes.text();
        expect(swText).toContain('CACHE_NAME');

        // 3. PWA Icons
        const iconRes = await request.get('/icon-192.png');
        expect(iconRes.status()).toBe(200);
    });

    test('renders responsive offline fallback experience', async ({ page }) => {
        await page.goto('/offline');

        await expect(page.locator('h1')).toContainText(/Offline/i);
        const retryBtn = page.getByRole('button', { name: /Retry/i });
        await expect(retryBtn).toBeVisible();

        // Offline tools navigation
        const compilerLink = page.locator('a[href*="/student/compiler"]').first();
        await expect(compilerLink).toBeVisible();
    });
});
