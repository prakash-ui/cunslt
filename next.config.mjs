let userConfig = undefined;
try {
  userConfig = await import('./v0-user-next.config');
} catch (e) {
  // Ignore error if custom config file doesn't exist
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // Useful for CI/CD but disable in development
  },
  typescript: {
    ignoreBuildErrors: true, // Risky for production; use only temporarily
  },
  images: {
    unoptimized: true, // Disables Next.js Image Optimization (useful for static exports)
    domains: [], // Add domains if using external image URLs (e.g., ['supabase.co'])
  },
  experimental: {
    webpackBuildWorker: true, // Speeds up builds
    parallelServerBuildTraces: true, // Improves build performance
    parallelServerCompiles: true, // Enables parallel compilation
  },
  // Ensure Supabase environment variables are loaded
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
};

// Merge user config (if exists)
if (userConfig) {
  const config = userConfig.default || userConfig;
  Object.keys(config).forEach((key) => {
    if (typeof nextConfig[key] === 'object' && !Array.isArray(nextConfig[key])) {
      nextConfig[key] = { ...nextConfig[key], ...config[key] };
    } else {
      nextConfig[key] = config[key];
    }
  });
}

export default nextConfig;