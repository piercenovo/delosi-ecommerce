import type { MetadataRoute } from 'next'
import { serverEnv } from '@/shared/config/server-env'

export default function robots(): MetadataRoute.Robots {
  return {
    // API routes are not content; the cart is personal and only exists in the browser.
    rules: { userAgent: '*', allow: '/', disallow: ['/api/', '/cart'] },
    sitemap: `${serverEnv.NEXT_PUBLIC_SITE_URL}/sitemap.xml`,
  }
}
