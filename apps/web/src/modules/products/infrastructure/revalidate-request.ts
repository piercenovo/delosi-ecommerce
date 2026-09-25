import { createHash, timingSafeEqual } from 'node:crypto'
import { z } from 'zod'
import { isCatalogCacheTag } from './cache-tags'

export const REVALIDATE_SECRET_HEADER = 'x-revalidate-secret'

const revalidateBodySchema = z.object({
  tag: z.string().refine(isCatalogCacheTag, 'Unknown cache tag'),
})

interface RevalidateDependencies {
  /** When undefined, on-demand revalidation is disabled. */
  secret: string | undefined
  revalidate: (tag: string) => void
}

/** Compares secrets in constant time (hashing first makes both inputs the same length). */
function isSameSecret(received: string, expected: string): boolean {
  const digest = (value: string) => createHash('sha256').update(value).digest()
  return timingSafeEqual(digest(received), digest(expected))
}

function jsonResponse(status: number, body: Record<string, string>): Response {
  return Response.json(body, { status })
}

/** `POST /api/revalidate` with `{ "tag": "products" }` and the `x-revalidate-secret` header. */
export async function handleRevalidateRequest(
  request: Request,
  { secret, revalidate }: RevalidateDependencies,
): Promise<Response> {
  if (!secret) {
    return jsonResponse(503, { error: 'On-demand revalidation is disabled' })
  }

  const receivedSecret = request.headers.get(REVALIDATE_SECRET_HEADER)
  if (receivedSecret === null || !isSameSecret(receivedSecret, secret)) {
    return jsonResponse(401, { error: 'Invalid revalidation secret' })
  }

  const body: unknown = await request.json().catch(() => null)
  const result = revalidateBodySchema.safeParse(body)
  if (!result.success) {
    return jsonResponse(400, { error: 'Expected a JSON body with a known cache tag' })
  }

  revalidate(result.data.tag)
  return jsonResponse(200, { revalidated: result.data.tag })
}
