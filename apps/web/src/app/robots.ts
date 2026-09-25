import type { MetadataRoute } from 'next'
import { serverEnv } from '@/shared/config/server-env'

export default function robots(): MetadataRoute.Robots {
  return {
    // API routes (health, revalidate, vitals) are not content.
    rules: { userAgent: '*', allow: '/', disallow: '/api/' },
    sitemap: `${serverEnv.NEXT_PUBLIC_SITE_URL}/sitemap.xml`,
  }
}
