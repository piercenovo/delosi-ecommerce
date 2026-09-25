import type { Metadata } from 'next'
import { Schibsted_Grotesk } from 'next/font/google'
import type { ReactNode } from 'react'
import '@delosi/ui/tokens.css'
import './globals.css'
import { CartBadge } from '@/modules/cart/ui/CartBadge'
import { CartProvider } from '@/modules/cart/ui/CartProvider'
import { serverEnv } from '@/shared/config/server-env'
import { WebVitalsReporter } from '@/shared/observability/WebVitalsReporter'
import { SiteFooter } from '@/shared/ui/SiteFooter'
import { SiteHeader } from '@/shared/ui/SiteHeader'
import { MAIN_CONTENT_ID, SkipLink } from '@/shared/ui/SkipLink'
import styles from './layout.module.css'

// Self-hosted by next/font (no request to Google at runtime). `latin` already covers
// Spanish accents and ñ; the variable feeds the design system's --font-sans stack.
const brandFont = Schibsted_Grotesk({
  subsets: ['latin'],
  variable: '--font-brand',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(serverEnv.NEXT_PUBLIC_SITE_URL),
  title: { default: 'Delosi Store', template: '%s | Delosi Store' },
  description: 'Catálogo de productos de Delosi Store.',
}

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="es" className={brandFont.variable}>
      <body className={styles.body}>
        <SkipLink />
        {/* Client provider; the pages inside it stay Server Components. */}
        <CartProvider>
          <SiteHeader actions={<CartBadge />} />
          <main id={MAIN_CONTENT_ID} className={styles.main}>
            {children}
          </main>
        </CartProvider>
        <SiteFooter />
        <WebVitalsReporter />
      </body>
    </html>
  )
}
