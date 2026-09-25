import type { ComponentPropsWithRef, ReactNode } from 'react'
import { cx } from '../../utils/cx'
import styles from './EmptyState.module.css'

export interface EmptyStateProps extends Omit<ComponentPropsWithRef<'div'>, 'title'> {
  title: string
  description?: string
  /** What the person can do next, e.g. "Quitar filtros". */
  action?: ReactNode
  /** Decorative illustration or icon. */
  icon?: ReactNode
  headingLevel?: 'h1' | 'h2' | 'h3'
}

export function EmptyState({
  title,
  description,
  action,
  icon,
  headingLevel: Heading = 'h2',
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div className={cx(styles.emptyState, className)} {...props}>
      {icon && (
        <div className={styles.icon} aria-hidden="true">
          {icon}
        </div>
      )}
      <Heading className={styles.title}>{title}</Heading>
      {description && <p className={styles.description}>{description}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  )
}
