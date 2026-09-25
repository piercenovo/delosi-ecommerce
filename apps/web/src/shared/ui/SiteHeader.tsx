import Link from 'next/link'
import type { ReactNode } from 'react'
import { BrandMark } from './BrandMark'
import styles from './SiteHeader.module.css'

interface SiteHeaderProps {
  /** Right-hand side (the cart link). A slot, so shared/ never imports a feature module. */
  actions?: ReactNode
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
          <BrandMark className={styles.mark} />
          <span>
            Delosi <span className={styles.brandSuffix}>Store</span>
          </span>
        </Link>
        {actions}
      </div>
    </header>
  )
}
