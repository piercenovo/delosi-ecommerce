'use client'

import { Button, EmptyState } from '@delosi/ui'
import Link from 'next/link'
import { useEffect } from 'react'
import { clientErrorReporter } from '@/shared/observability/client/client-reporters'
import styles from './ErrorView.module.css'

export interface ErrorViewProps {
  /** In production, server errors arrive without details: only a generic message and a digest. */
  error: Error & { digest?: string }
  /** Next 16.3: re-fetches and re-renders the segment (`reset` would only re-render). */
  retry: () => void
  title: string
  description: string
}

/** Shared body of the error boundaries: what failed, how to recover, and a way out. */
export function ErrorView({ error, retry, title, description }: ErrorViewProps) {
  useEffect(() => {
    // Sent to /api/errors, so it reaches the server logs. The digest links it to the log that
    // instrumentation.ts wrote for the same failure.
    clientErrorReporter.capture(error, {
      source: 'client',
      digest: error.digest,
      route: window.location.pathname,
    })
  }, [error])

  return (
    <>
      {/* generateMetadata may have failed with the page: React 19 hoists this to <head>. */}
      <title>{`${title} | Delosi Store`}</title>
      <EmptyState
        headingLevel="h1"
        title={title}
        description={description}
        action={
          <div className={styles.actions}>
            <Button onClick={retry}>Intentar de nuevo</Button>
            <Button as={Link} href="/products" variant="secondary">
              Ir al catálogo
            </Button>
          </div>
        }
      />
    </>
  )
}
