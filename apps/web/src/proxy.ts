import { NextResponse, type NextRequest } from 'next/server'
import { parseProductId } from '@/modules/products/domain/product'

/** No route matches it, so Next renders the app's not-found page with a 404 status. */
export const NOT_FOUND_PATH = '/404'

/**
 * A malformed product id (`abc`, `0`, `05`) is answered here with a real 404, before any
 * rendering and without reading data. Unknown numeric ids reach the page, which calls
 * `notFound()` before anything streams (the product page has no loading boundary), so they
 * get a real 404 too.
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
