/**
 * The only remote images the store renders: FakeStore's product photos. next.config allows
 * exactly this pattern for next/image, and data read from outside (the API, localStorage)
 * is checked against it, so an image can never fail at render time for an unknown host.
 */
export const REMOTE_PRODUCT_IMAGES = {
  protocol: 'https',
  hostname: 'fakestoreapi.com',
  pathname: '/img/**',
} as const

const REMOTE_PATH_PREFIX = REMOTE_PRODUCT_IMAGES.pathname.replace(/\*+$/, '')

/** A local path (`/images/...`) or an https URL on FakeStore's image path. */
export function isAllowedProductImage(src: string): boolean {
  // `//host` is protocol-relative: it would load from another host.
  if (src.startsWith('/')) return !src.startsWith('//')

  if (!URL.canParse(src)) return false
  // Parsing normalizes the URL: `..` segments, credentials and ports can't hide another target.
  const url = new URL(src)
  return (
    url.protocol === `${REMOTE_PRODUCT_IMAGES.protocol}:` &&
    url.hostname === REMOTE_PRODUCT_IMAGES.hostname &&
    url.port === '' &&
    url.username === '' &&
    url.pathname.startsWith(REMOTE_PATH_PREFIX)
  )
}
