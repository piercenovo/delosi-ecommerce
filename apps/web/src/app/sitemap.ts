import type { MetadataRoute } from 'next'
import { productRepository } from '@/composition-root'
import { buildSitemap } from '@/modules/products/seo/sitemap'
import { serverEnv } from '@/shared/config/server-env'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([
    productRepository.findAll(),
    productRepository.findCategories(),
  ])
  return buildSitemap(serverEnv.NEXT_PUBLIC_SITE_URL, products, categories)
}
