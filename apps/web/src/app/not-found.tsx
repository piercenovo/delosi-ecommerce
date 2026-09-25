import { Button, EmptyState } from '@delosi/ui'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Página no encontrada' }

export default function NotFound() {
  return (
    <EmptyState
      headingLevel="h1"
      title="No encontramos esta página"
      description="El enlace puede estar mal escrito o el producto ya no está disponible."
      action={
        <Button as={Link} href="/products">
          Ver el catálogo
        </Button>
      }
    />
  )
}
