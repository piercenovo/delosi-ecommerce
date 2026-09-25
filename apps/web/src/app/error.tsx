'use client'

import { ErrorView, type ErrorViewProps } from '@/shared/ui/ErrorView'

export default function RootError({ error, retry }: Pick<ErrorViewProps, 'error' | 'retry'>) {
  return (
    <ErrorView
      error={error}
      retry={retry}
      title="Algo salió mal"
      description="No pudimos mostrar esta página. Intenta de nuevo en unos segundos."
    />
  )
}
