import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import '@delosi/ui/tokens.css'
import './globals.css'

export const metadata: Metadata = {
  title: { default: 'Delosi Store', template: '%s | Delosi Store' },
  description: 'Catálogo de productos de Delosi Store.',
}

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
