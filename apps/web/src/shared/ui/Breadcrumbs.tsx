import Link from 'next/link'
import styles from './Breadcrumbs.module.css'

export interface BreadcrumbItem {
  label: string
  /** Omitted for the current page. */
  href?: string | undefined
}

export function Breadcrumbs({ items }: { items: readonly BreadcrumbItem[] }) {
  return (
    <nav aria-label="Ruta de navegación" className={styles.breadcrumbs}>
      <ol className={styles.list}>
        {items.map((item) => (
          <li key={item.label} className={styles.item}>
            {item.href ? (
              <Link href={item.href} className={styles.link}>
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className={styles.current}>
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
