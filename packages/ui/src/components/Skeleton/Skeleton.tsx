import type { ComponentPropsWithRef } from 'react'
import { cx } from '../../utils/cx'
import styles from './Skeleton.module.css'

export type SkeletonVariant = 'text' | 'rect' | 'circle'

export interface SkeletonProps extends ComponentPropsWithRef<'span'> {
  /** `text`: one line · `rect`: fills its container · `circle`: avatar-sized. */
  variant?: SkeletonVariant
}

/** Decorative loading placeholder: hidden from assistive technology. */
export function Skeleton({ variant = 'text', className, ...props }: SkeletonProps) {
  return (
    <span
      data-skeleton
      aria-hidden="true"
      className={cx(styles.skeleton, styles[variant], className)}
      {...props}
    />
  )
}
