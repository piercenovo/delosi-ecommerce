import type { ComponentPropsWithRef, ElementType, ReactNode } from 'react'
import { cx } from '../../utils/cx'
import styles from './Button.module.css'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonOwnProps<E extends ElementType> {
  /** `'button'` by default; `'a'` or a router link (`next/link`) for navigation styled as a button. */
  as?: E
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  /** Disables the button and shows a spinner while keeping its width and accessible name. */
  loading?: boolean
  className?: string | undefined
  children: ReactNode
}

export type ButtonProps<E extends ElementType = 'button'> = ButtonOwnProps<E> &
  Omit<ComponentPropsWithRef<E>, keyof ButtonOwnProps<E>>

export function Button<E extends ElementType = 'button'>({
  as,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  className,
  children,
  ...props
}: ButtonProps<E>) {
  const Component: ElementType = as ?? 'button'
  // `type` and `disabled` only exist on a native button; links are never disabled.
  const { type = 'button', disabled, ...rest } = props as ComponentPropsWithRef<'button'>
  const nativeProps = Component === 'button' ? { type, disabled: disabled || loading } : {}

  return (
    <Component
      {...nativeProps}
      aria-busy={loading || undefined}
      className={cx(
        styles.button,
        styles[variant],
        styles[size],
        fullWidth && styles.fullWidth,
        loading && styles.loading,
        className,
      )}
      {...rest}
    >
      <span className={styles.label}>{children}</span>
      {loading && <span className={styles.spinner} aria-hidden="true" />}
    </Component>
  )
}
