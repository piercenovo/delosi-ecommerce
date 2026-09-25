import { NextResponse, type NextRequest } from 'next/server'
import { parseProductId } from '@/modules/products/domain/product'

/** No route matches it, so Next renders the app's not-found page with a 404 status. */
export const NOT_FOUND_PATH = '/404'

/**
 * With Cache Components the product page streams its shell before `notFound()` runs, so a
 * missing product is a soft 404 (status 200 + noindex). A malformed id can be rejected here,
 * before rendering, with a real 404 and no data access. Unknown numeric ids stay soft 404s:
 * checking existence would add a data read in front of every product request.
 */
export function proxy(request: NextRequest) {
  const rawId = request.nextUrl.pathname.split('/').at(-1) ?? ''
  if (parseProductId(rawId) === null) {
    return NextResponse.rewrite(new URL(NOT_FOUND_PATH, request.url))
  }
}

export const config = {
  matcher: '/products/:id',
}
