import type { ComponentPropsWithRef, ReactNode } from 'react'
import { cx } from '../../utils/cx'
import styles from './IconButton.module.css'

export type IconButtonVariant = 'ghost' | 'secondary'
export type IconButtonSize = 'sm' | 'md'

export interface IconButtonProps extends Omit<
  ComponentPropsWithRef<'button'>,
  'aria-label' | 'children'
> {
  /** Required: an icon-only button has no other accessible name. */
  'aria-label': string
  /** The icon. It is hidden from assistive technology. */
  children: ReactNode
  variant?: IconButtonVariant
  size?: IconButtonSize
}

export function IconButton({
  variant = 'ghost',
  size = 'md',
  type = 'button',
  className,
  children,
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      className={cx(styles.iconButton, styles[variant], styles[size], className)}
      {...props}
    >
      <span className={styles.icon} aria-hidden="true">
        {children}
      </span>
    </button>
  )
}
