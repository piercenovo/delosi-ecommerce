import type { ComponentPropsWithRef, ElementType, ReactNode } from 'react'
import { cx } from '../../utils/cx'
import styles from './Card.module.css'

function CardRoot({ className, ...props }: ComponentPropsWithRef<'article'>) {
  return <article className={cx(styles.card, className)} {...props} />
}

export type CardMediaRatio = 'square' | 'portrait' | 'landscape'

export interface CardMediaProps extends ComponentPropsWithRef<'div'> {
  /** Fixed box: images of any shape fit inside (`object-fit: contain`), so nothing shifts. */
  ratio?: CardMediaRatio
}

/**
 * The image goes inside an absolutely positioned frame, so it never sizes the box. The frame
 * also works with `next/image` `fill`, whose inline `inset: 0` would otherwise ignore padding.
 */
function CardMedia({ ratio = 'square', className, children, ...props }: CardMediaProps) {
  return (
    <div data-card-media className={cx(styles.media, styles[ratio], className)} {...props}>
      <div className={styles.frame}>{children}</div>
    </div>
  )
}

function CardBody({ className, ...props }: ComponentPropsWithRef<'div'>) {
  return <div className={cx(styles.body, className)} {...props} />
}

export interface CardTitleProps extends ComponentPropsWithRef<'h3'> {
  as?: 'h2' | 'h3' | 'h4'
}

function CardTitle({ as: Heading = 'h3', className, ...props }: CardTitleProps) {
  return <Heading className={cx(styles.title, className)} {...props} />
}

interface CardLinkOwnProps<E extends ElementType> {
  /** `'a'` by default; pass a router link such as `next/link`. */
  as?: E
  className?: string
  children: ReactNode
}

export type CardLinkProps<E extends ElementType = 'a'> = CardLinkOwnProps<E> &
  Omit<ComponentPropsWithRef<E>, keyof CardLinkOwnProps<E>>

/** Its hit area stretches over the whole card; actions in `Card.Footer` stay clickable. */
function CardLink<E extends ElementType = 'a'>({ as, className, ...props }: CardLinkProps<E>) {
  const Component: ElementType = as ?? 'a'
  return <Component className={cx(styles.link, className)} {...props} />
}

function CardFooter({ className, ...props }: ComponentPropsWithRef<'div'>) {
  return <div className={cx(styles.footer, className)} {...props} />
}

export const Card = Object.assign(CardRoot, {
  Media: CardMedia,
  Body: CardBody,
  Title: CardTitle,
  Link: CardLink,
  Footer: CardFooter,
})
