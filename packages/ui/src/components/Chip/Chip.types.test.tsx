import type { ReactNode } from 'react'
import { describe, it } from 'vitest'
import { Chip } from './Chip'

/** Stand-in for a router link such as `next/link`. */
function RouterLink({
  href,
  className,
  children,
}: {
  href: string
  className?: string
  children?: ReactNode
}) {
  return (
    <a href={href} className={className}>
      {children}
    </a>
  )
}

describe('Chip types', () => {
  it('infers the props of the element it renders', () => {
    void (
      <Chip as="a" href="/products">
        Todo
      </Chip>
    )
    void (
      <Chip as={RouterLink} href="/products">
        Todo
      </Chip>
    )
    void (<Chip onClick={() => {}}>Todo</Chip>)

    // @ts-expect-error: a button has no href
    void (<Chip href="/products">Todo</Chip>)
    // @ts-expect-error: the router link requires href
    void (<Chip as={RouterLink}>Todo</Chip>)
  })
})
