'use client'

import type { ReactNode } from 'react'
import styles from './CatalogResultsRegion.module.css'
import { useCatalogNavigation } from './catalog-navigation'

/** Keeps the current results visible, dimmed and marked busy, while the next ones load. */
export function CatalogResultsRegion({ children }: { children: ReactNode }) {
  const { isPending } = useCatalogNavigation()

  return (
    <div
      aria-busy={isPending || undefined}
      data-pending={isPending || undefined}
      className={styles.region}
    >
      {children}
    </div>
  )
}
