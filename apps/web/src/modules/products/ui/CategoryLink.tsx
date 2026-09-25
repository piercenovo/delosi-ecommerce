'use client'

import { Chip } from '@delosi/ui'
import Link from 'next/link'
import { useEffect, useRef, type MouseEvent, type ReactNode } from 'react'
import { useCatalogNavigation } from './catalog-navigation'

interface CategoryLinkProps {
  href: string
  selected: boolean
  children: ReactNode
}

/**
 * A real link (crawlable, usable before hydration, opens in a new tab), whose plain clicks
 * join the catalog transition so the results show that they are updating.
 */
export function CategoryLink({ href, selected, children }: CategoryLinkProps) {
  const { navigate } = useCatalogNavigation()
  const ref = useRef<HTMLAnchorElement>(null)

  // In the scrollable mobile row, bring the active category into view ('nearest': no-op when
  // it is already visible, so the page itself never scrolls).
  useEffect(() => {
    if (selected) ref.current?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' })
  }, [selected])

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    const modified = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey
    if (event.button !== 0 || modified) return

    event.preventDefault()
    navigate(href)
  }

  return (
    <Chip as={Link} ref={ref} href={href} selected={selected} onClick={handleClick}>
      {children}
    </Chip>
  )
}
