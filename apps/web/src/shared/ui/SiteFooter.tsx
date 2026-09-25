import styles from './SiteFooter.module.css'

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <p className={styles.inner}>
        Delosi Store es un proyecto de reto técnico. Los productos provienen de{' '}
        <a href="https://fakestoreapi.com" className={styles.link}>
          Fake Store API
        </a>
        .
      </p>
    </footer>
  )
}
