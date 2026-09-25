import type { ComponentPropsWithRef, ReactNode } from 'react'
import { cx } from '../../utils/cx'
import styles from './IconButton.module.css'

/**
 * `floating`: a white button with a soft shadow, for actions over photos.
 * `highlight`: maracuyá, for a moment of value such as an "added" confirmation.
 */
export type IconButtonVariant = 'ghost' | 'secondary' | 'floating' | 'highlight'
export type IconButtonSize = 'sm' | 'md'
/** Independent of the variant, so a button can change variant without changing shape. */
export type IconButtonShape = 'square' | 'circle'

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
  shape?: IconButtonShape
}

export function IconButton({
  variant = 'ghost',
  size = 'md',
  shape = 'square',
  type = 'button',
  className,
  children,
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      className={cx(
        styles.iconButton,
        styles[variant],
        styles[size],
        shape === 'circle' && styles.circle,
        className,
      )}
      {...props}
    >
      <span className={styles.icon} aria-hidden="true">
        {children}
      </span>
    </button>
  )
}
