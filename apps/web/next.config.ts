import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  cacheComponents: true,
  reactStrictMode: true,
  poweredByHeader: false,
  // @delosi/ui ships TypeScript and CSS Modules sources (internal package, no build step).
  transpilePackages: ['@delosi/ui'],
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'fakestoreapi.com', pathname: '/img/**' }],
  },
  async redirects() {
    return [{ source: '/', destination: '/products', permanent: true }]
  },
}

export default nextConfig
