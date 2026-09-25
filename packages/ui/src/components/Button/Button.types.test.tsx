import type { ReactNode } from 'react'
import { describe, it } from 'vitest'
import { Button } from './Button'

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

describe('Button types', () => {
  it('infers the props of the element it renders', () => {
    void (<Button onClick={() => {}}>Agregar</Button>)
    void (<Button type="submit">Enviar</Button>)
    void (
      <Button as="a" href="/products">
        Quitar filtros
      </Button>
    )
    void (
      <Button as={RouterLink} href="/products" variant="secondary">
        Quitar filtros
      </Button>
    )

    // @ts-expect-error: a button has no href (use `as="a"` or a router link)
    void (<Button href="/products">Quitar filtros</Button>)
    // @ts-expect-error: the router link requires href
    void (<Button as={RouterLink}>Quitar filtros</Button>)
  })
})
