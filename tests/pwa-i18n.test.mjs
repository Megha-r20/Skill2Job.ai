import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE, getLanguageMeta } from '../lib/i18n/languages.js';
import { translations, getTranslation } from '../lib/i18n/translations.js';

describe('Multi-Language Support & Progressive Web App (PWA) Suite', () => {
    describe('1. Internationalization (i18n) Engine & Dictionaries', () => {
        it('supports 8 high-demand languages with complete metadata', () => {
            assert.equal(SUPPORTED_LANGUAGES.length, 8, 'Expected 8 supported languages');
            const codes = SUPPORTED_LANGUAGES.map(l => l.code);
            assert(codes.includes('en'));
            assert(codes.includes('hi'));
            assert(codes.includes('te'));
            assert(codes.includes('ta'));
            assert(codes.includes('es'));
            assert(codes.includes('fr'));
            assert(codes.includes('de'));
            assert(codes.includes('ar'));

            for (const lang of SUPPORTED_LANGUAGES) {
                assert(lang.name, `Language ${lang.code} must have English name`);
                assert(lang.nativeName, `Language ${lang.code} must have nativeName`);
                assert(lang.flag, `Language ${lang.code} must have flag`);
                assert(['ltr', 'rtl'].includes(lang.dir), `Language ${lang.code} dir must be ltr or rtl`);
            }
        });

        it('identifies RTL languages correctly for Arabic', () => {
            const arMeta = getLanguageMeta('ar');
            assert.equal(arMeta.dir, 'rtl');
            assert.equal(arMeta.code, 'ar');

            const enMeta = getLanguageMeta('en');
            assert.equal(enMeta.dir, 'ltr');

            const hiMeta = getLanguageMeta('hi');
            assert.equal(hiMeta.dir, 'ltr');
        });

        it('verifies dictionary completeness across all supported languages', () => {
            const requiredNamespaces = ['common', 'nav', 'landing', 'dashboard', 'roles', 'notifications', 'audit', 'pwa'];

            for (const lang of SUPPORTED_LANGUAGES) {
                const dict = translations[lang.code];
                assert(dict, `Dictionary must exist for language: ${lang.code}`);
                for (const ns of requiredNamespaces) {
                    assert(dict[ns], `Namespace "${ns}" must exist in dictionary for ${lang.code}`);
                    assert(Object.keys(dict[ns]).length >= 3, `Namespace "${ns}" in ${lang.code} must have at least 3 keys`);
                }
            }
        });

        it('translates strings accurately across multiple languages', () => {
            // English
            assert.equal(getTranslation('en', 'nav.dashboard'), 'Dashboard');
            assert.equal(getTranslation('en', 'common.online'), 'Online');

            // Hindi
            assert.equal(getTranslation('hi', 'nav.dashboard'), 'डैशबोर्ड');
            assert.equal(getTranslation('hi', 'common.online'), 'ऑनलाइन');

            // Telugu
            assert.equal(getTranslation('te', 'nav.dashboard'), 'డాష్‌బోర్డ్');

            // Tamil
            assert.equal(getTranslation('ta', 'nav.dashboard'), 'டாஷ்போர்டு');

            // Spanish
            assert.equal(getTranslation('es', 'nav.dashboard'), 'Panel de Control');

            // French
            assert.equal(getTranslation('fr', 'nav.dashboard'), 'Tableau de Bord');

            // German
            assert.equal(getTranslation('de', 'nav.dashboard'), 'Dashboard');

            // Arabic
            assert.equal(getTranslation('ar', 'nav.dashboard'), 'لوحة التحكم');
        });

        it('interpolates dynamic parameters into translation templates', () => {
            const translated = getTranslation('en', 'dashboard.welcome', '', { name: 'Sarah Connor' });
            assert.equal(translated, 'Welcome back, Sarah Connor!');

            const translatedHi = getTranslation('hi', 'dashboard.welcome', '', { name: 'रोहन' });
            assert.equal(translatedHi, 'स्वागत है, रोहन!');

            const unreadCount = getTranslation('en', 'notifications.unread', '', { count: 5 });
            assert.equal(unreadCount, '5 Unread');
        });

        it('gracefully falls back to English and default string when key is missing', () => {
            const nonExistentKey = 'custom.deeply.nested.nonexistent';
            const fallbackString = 'Default Fallback String';
            const result = getTranslation('hi', nonExistentKey, fallbackString);
            assert.equal(result, fallbackString);
        });
    });

    describe('2. Progressive Web App (PWA) Manifest & Asset Integrity', () => {
        const manifestPath = path.resolve(process.cwd(), 'public/manifest.json');

        it('verifies manifest.json exists and is valid JSON', () => {
            assert(fs.existsSync(manifestPath), 'public/manifest.json must exist');
            const raw = fs.readFileSync(manifestPath, 'utf8');
            const manifest = JSON.parse(raw);

            assert(manifest.name, 'Manifest must have name');
            assert(manifest.short_name, 'Manifest must have short_name');
            assert(manifest.start_url, 'Manifest must have start_url');
            assert.equal(manifest.display, 'standalone');
            assert(manifest.background_color);
            assert(manifest.theme_color);
        });

        it('validates manifest icon entries and ensures actual files exist on disk', () => {
            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
            assert(Array.isArray(manifest.icons) && manifest.icons.length >= 4);

            for (const icon of manifest.icons) {
                const iconPath = path.resolve(process.cwd(), 'public', icon.src.replace(/^\//, ''));
                assert(fs.existsSync(iconPath), `PWA icon file must exist on disk: ${icon.src}`);
                const stats = fs.statSync(iconPath);
                assert(stats.size > 0, `Icon file must not be empty: ${icon.src}`);
            }
        });

        it('validates PWA app shortcuts', () => {
            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
            assert(Array.isArray(manifest.shortcuts) && manifest.shortcuts.length >= 3);
            const urls = manifest.shortcuts.map(s => s.url);
            assert(urls.some(u => u.includes('dashboard')));
            assert(urls.some(u => u.includes('jobs')));
            assert(urls.some(u => u.includes('notifications')));
        });
    });

    describe('3. Service Worker & Offline Experience', () => {
        const swPath = path.resolve(process.cwd(), 'public/sw.js');
        const offlinePagePath = path.resolve(process.cwd(), 'app/offline/page.js');

        it('verifies public/sw.js exists and contains valid lifecycle handlers', () => {
            assert(fs.existsSync(swPath), 'public/sw.js must exist');
            const content = fs.readFileSync(swPath, 'utf8');

            assert(content.includes("addEventListener('install'"), 'SW must have install handler');
            assert(content.includes("addEventListener('activate'"), 'SW must have activate handler');
            assert(content.includes("addEventListener('fetch'"), 'SW must have fetch handler');
            assert(content.includes('/offline'), 'SW must reference offline fallback page');
            assert(content.includes('caches.open'), 'SW must manage caches');
            assert(content.includes('skipWaiting'), 'SW should support skipWaiting');
        });

        it('verifies app/offline/page.js offline fallback page exists and is functional', () => {
            assert(fs.existsSync(offlinePagePath), 'app/offline/page.js must exist');
            const content = fs.readFileSync(offlinePagePath, 'utf8');

            assert(content.includes('Offline'), 'Offline page must convey offline state');
            assert(content.includes('useLanguage'), 'Offline page must integrate with translation hook');
            assert(content.includes('handleRetry') || content.includes('Retry'), 'Offline page must offer retry mechanism');
        });
    });
});
