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
 * Scrolls the chip's row horizontally, only if the chip is out of view: what
 * `scrollIntoView({ inline: 'nearest' })` does, without its side effect. Chromium moves the
 * Tab starting point to the element scrollIntoView scrolls, so the first Tab after load skipped
 * the skip link and the header and landed on the next category.
 */
function scrollIntoRow(chip: HTMLElement) {
  const row = chip.closest('nav')
  if (!row || row.scrollWidth <= row.clientWidth) return

  const padding = Number.parseFloat(getComputedStyle(row).scrollPaddingInlineStart) || 0
  const rowBox = row.getBoundingClientRect()
  const chipBox = chip.getBoundingClientRect()
  if (chipBox.left < rowBox.left + padding) {
    row.scrollLeft -= rowBox.left + padding - chipBox.left
  } else if (chipBox.right > rowBox.right - padding) {
    row.scrollLeft += chipBox.right - (rowBox.right - padding)
  }
}

/**
 * A real link (crawlable, usable before hydration, opens in a new tab), whose plain clicks
 * join the catalog transition so the results show that they are updating.
 */
export function CategoryLink({ href, selected, children }: CategoryLinkProps) {
  const { navigate } = useCatalogNavigation()
  const ref = useRef<HTMLAnchorElement>(null)

  // In the scrollable mobile row, bring the active category into view (no-op when it is
  // already visible; the page itself never scrolls).
  useEffect(() => {
    if (selected && ref.current) scrollIntoRow(ref.current)
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
