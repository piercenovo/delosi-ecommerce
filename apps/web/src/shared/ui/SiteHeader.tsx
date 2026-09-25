import Link from 'next/link'
import type { ReactNode } from 'react'
import styles from './SiteHeader.module.css'

interface SiteHeaderProps {
  /** Right-hand side (the cart link). A slot, so shared/ never imports a feature module. */
  actions?: ReactNode
}

export function SiteHeader({ actions }: SiteHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/products" className={styles.brand}>
          Delosi <span className={styles.brandSuffix}>Store</span>
        </Link>
        {actions}
      </div>
    </header>
  )
}
