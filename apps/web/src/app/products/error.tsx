'use client'

import { ErrorView, type ErrorViewProps } from '@/shared/ui/ErrorView'

// Last resort: a failing FakeStore is already covered by the snapshot fallback (ADR 0010).
export default function ProductsError({ error, retry }: Pick<ErrorViewProps, 'error' | 'retry'>) {
  return (
    <ErrorView
      error={error}
      retry={retry}
      title="No pudimos cargar los productos"
      description="El catálogo no respondió. Intenta de nuevo en unos segundos."
    />
  )
}
