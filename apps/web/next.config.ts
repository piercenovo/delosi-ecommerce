import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  cacheComponents: true,
  reactStrictMode: true,
  poweredByHeader: false,
  // next dev writes AGENTS.md + CLAUDE.md into apps/web when an AI agent runs it. The repo
  // keeps a single root AGENTS.md (see AGENTS.md), so the generated files stay off.
  agentRules: false,
  // @delosi/ui ships TypeScript and CSS Modules sources (internal package, no build step).
  transpilePackages: ['@delosi/ui'],
  images: {
    // AVIF first (smaller at the same quality), WebP for browsers without AVIF support.
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [{ protocol: 'https', hostname: 'fakestoreapi.com', pathname: '/img/**' }],
  },
  async redirects() {
    return [{ source: '/', destination: '/products', permanent: true }]
  },
}

export default nextConfig
