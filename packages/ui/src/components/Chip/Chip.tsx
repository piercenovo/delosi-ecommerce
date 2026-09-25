import type { ComponentPropsWithRef, ElementType, ReactNode } from 'react'
import { cx } from '../../utils/cx'
import styles from './Chip.module.css'

interface ChipOwnProps<E extends ElementType> {
  /** Element or component to render: a `button` by default, `'a'` or a router link for filters. */
  as?: E
  /** Pressed state for a button, "current page" for a link. */
  selected?: boolean
  className?: string
  children: ReactNode
}

export type ChipProps<E extends ElementType = 'button'> = ChipOwnProps<E> &
  Omit<ComponentPropsWithRef<E>, keyof ChipOwnProps<E>>

export function Chip<E extends ElementType = 'button'>({
  as,
  selected = false,
  className,
  children,
  ...props
}: ChipProps<E>) {
  const Component: ElementType = as ?? 'button'
  const stateProps =
    Component === 'button'
      ? { type: 'button', 'aria-pressed': selected }
      : { 'aria-current': selected ? 'page' : undefined }

  return (
    <Component
      className={cx(styles.chip, selected && styles.selected, className)}
      {...stateProps}
      {...props}
    >
      {children}
    </Component>
  )
}
