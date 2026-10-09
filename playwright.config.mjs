import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './tests/e2e',
    timeout: 30000,
    expect: {
        timeout: 10000
    },
    fullyParallel: false,
    workers: 1,
    reporter: [['list']],
    use: {
        baseURL: 'http://localhost:3000',
        channel: 'msedge',
        headless: true,
        trace: 'off'
    },
    projects: [
        {
            name: 'msedge',
            use: {
                ...devices['Desktop Chrome'],
                channel: 'msedge'
            }
        }
    ]
});
