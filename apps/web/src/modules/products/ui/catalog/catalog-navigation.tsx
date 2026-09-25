'use client'

import { useRouter } from 'next/navigation'
import { createContext, use, useMemo, useTransition, type ReactNode } from 'react'

interface NavigateOptions {
  /** Replace the history entry (live search) instead of adding one (filters, sort). */
  replace?: boolean
}

interface CatalogNavigation {
  /** True while the next catalog result is loading; the current one stays on screen. */
  isPending: boolean
  navigate: (href: string, options?: NavigateOptions) => void
}

const CatalogNavigationContext = createContext<CatalogNavigation | null>(null)

/**
 * One transition shared by the search form and the category links, so the results region
 * knows when any of them is loading and the controls keep their state (and focus).
 */
export function CatalogNavigationProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const value = useMemo<CatalogNavigation>(
    () => ({
      isPending,
      navigate: (href, { replace = false } = {}) => {
        startTransition(() => {
          if (replace) router.replace(href, { scroll: false })
          else router.push(href, { scroll: false })
        })
      },
    }),
    [isPending, router],
  )

  return <CatalogNavigationContext value={value}>{children}</CatalogNavigationContext>
}

export function useCatalogNavigation(): CatalogNavigation {
  const navigation = use(CatalogNavigationContext)
  if (!navigation) {
    throw new Error('useCatalogNavigation must be used inside <CatalogNavigationProvider>.')
  }
  return navigation
}
