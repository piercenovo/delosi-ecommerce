import Link from 'next/link'
import styles from './SiteHeader.module.css'

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/products" className={styles.brand}>
          Delosi <span className={styles.brandSuffix}>Store</span>
        </Link>
      </div>
    </header>
  )
}
