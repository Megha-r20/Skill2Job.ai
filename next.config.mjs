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

export default nextConfig;
