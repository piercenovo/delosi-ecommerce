import type { Metadata } from 'next'
import { CartView } from '@/modules/cart/ui/CartView'

// Personal and client-only: never indexed (also disallowed in robots.txt).
export const metadata: Metadata = {
  title: 'Tu carrito',
  robots: { index: false, follow: true },
}

export default function CartPage() {
  return <CartView />
}
