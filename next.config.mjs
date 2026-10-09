import { withSentryConfig } from '@sentry/nextjs/config';

/** @type {import('next').NextConfig} */

// Refuse to start without a secret
if (!process.env.JWT_SECRET || !process.env.JWT_SECRET.trim()) {
  throw new Error(
    'FATAL: JWT_SECRET environment variable is missing. The application refuses to start without a configured secret. Please define JWT_SECRET in your environment or .env file.'
  );
}

const nextConfig = {
  reactStrictMode: true,
};

export default withSentryConfig(nextConfig, {
  silent: true,
  dryRun: !process.env.SENTRY_AUTH_TOKEN,
  disableLogger: true,
});
