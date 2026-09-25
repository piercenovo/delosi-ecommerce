import { revalidateTag } from 'next/cache'
import { handleRevalidateRequest } from '@/modules/products/infrastructure/cache/revalidate-request'
import { serverEnv } from '@/shared/config/server-env'

export function POST(request: Request) {
  return handleRevalidateRequest(request, {
    secret: serverEnv.REVALIDATE_SECRET,
    // 'max': serve the stale catalog while the fresh one is fetched in the background.
    revalidate: (tag) => revalidateTag(tag, 'max'),
  })
}
