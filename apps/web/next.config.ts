import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  cacheComponents: true,
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'fakestoreapi.com', pathname: '/img/**' }],
  },
  async redirects() {
    return [{ source: '/', destination: '/products', permanent: true }]
  },
}

export default nextConfig
