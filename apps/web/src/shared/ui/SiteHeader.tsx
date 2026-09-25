import Link from 'next/link'
import type { ReactNode } from 'react'
import styles from './SiteHeader.module.css'

interface SiteHeaderProps {
  /** Right-hand side (the cart link). A slot, so shared/ never imports a feature module. */
  actions?: ReactNode
}

/** The favicon's "D", inverted for the purple band: maracuyá tile, purple letter. */
function BrandMark() {
  return (
    <svg viewBox="0 0 64 64" className={styles.mark} aria-hidden="true" focusable="false">
      <rect width="64" height="64" rx="14" fill="var(--color-highlight)" />
      <path
        d="M20 14h11c11.6 0 19 7.1 19 18s-7.4 18-19 18H20zm9 8.5v19h2c6 0 9.6-3.6 9.6-9.5s-3.6-9.5-9.6-9.5z"
        fill="var(--color-brand)"
      />
    </svg>
  )
}

/**
 * The one region the brand purple owns. It remaps the semantic tokens for its content, so
 * whatever sits in the actions slot (the cart link and its count) reads on purple without
 * knowing about it.
 */
export function SiteHeader({ actions }: SiteHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/products" className={styles.brand}>
          <BrandMark />
          <span>
            Delosi <span className={styles.brandSuffix}>Store</span>
          </span>
        </Link>
        {actions}
      </div>
    </header>
  )
}
