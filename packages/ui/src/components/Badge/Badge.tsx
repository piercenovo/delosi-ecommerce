import type { ComponentPropsWithRef } from 'react'
import { cx } from '../../utils/cx'
import styles from './Badge.module.css'

export type BadgeTone = 'neutral' | 'primary' | 'highlight'

export interface BadgeProps extends ComponentPropsWithRef<'span'> {
  tone?: BadgeTone
  /**
   * Full text for screen readers when the visible content needs context
   * (e.g. a cart count "3" → "3 productos en el carrito").
   */
  label?: string
}

export function Badge({ tone = 'neutral', label, className, children, ...props }: BadgeProps) {
  return (
    <span className={cx(styles.badge, styles[tone], className)} {...props}>
      {label ? (
        <>
          <span aria-hidden="true">{children}</span>
          <span className={styles.visuallyHidden}>{label}</span>
        </>
      ) : (
        children
      )}
    </span>
  )
}
