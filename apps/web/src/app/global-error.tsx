'use client'

import '@delosi/ui/tokens.css'
import './globals.css'
import { ErrorView, type ErrorViewProps } from '@/shared/ui/ErrorView'

// Replaces the root layout when it fails, so it brings its own document and styles.
export default function GlobalError({ error, retry }: Pick<ErrorViewProps, 'error' | 'retry'>) {
  return (
    <html lang="es">
      <body>
        <main>
          <ErrorView
            error={error}
            retry={retry}
            title="La tienda no está disponible"
            description="Tuvimos un problema al cargar la tienda. Intenta de nuevo en unos segundos."
          />
        </main>
      </body>
    </html>
  )
}
