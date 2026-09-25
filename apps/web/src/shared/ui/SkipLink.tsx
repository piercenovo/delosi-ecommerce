import styles from './SkipLink.module.css'

export const MAIN_CONTENT_ID = 'contenido'

/** First focusable element: lets keyboard users jump past the header. */
export function SkipLink() {
  return (
    <a href={`#${MAIN_CONTENT_ID}`} className={styles.skipLink}>
      Saltar al contenido
    </a>
  )
}
