import { BrandMark } from './BrandMark'
import styles from './SiteFooter.module.css'

/**
 * Closes every page with the brand, quietly: a neutral band (the purple belongs to the header)
 * and the note that this is a demo store.
 */
export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p className={styles.brand}>
          <BrandMark className={styles.mark} />
          <span>
            Delosi <span className={styles.brandSuffix}>Store</span>
          </span>
        </p>
        <p className={styles.note}>
          Delosi Store es un proyecto de reto técnico. Los productos provienen de{' '}
          <a href="https://fakestoreapi.com" className={styles.link}>
            Fake Store API
          </a>
          .
        </p>
      </div>
    </footer>
  )
}
