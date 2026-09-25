'use client'

import { Input, Select, type SelectOption } from '@delosi/ui'
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import a11y from '@/shared/ui/a11y.module.css'
import {
  buildCatalogHref,
  parseCatalogQuery,
  type RawSearchParams,
} from '../url/catalog-search-params'
import type { CatalogQuery, SortKey } from '../domain/catalog-query'
import styles from './CatalogControls.module.css'
import { useCatalogNavigation } from './catalog-navigation'

export const SEARCH_DEBOUNCE_MS = 300

const SORT_OPTIONS = [
  { value: '', label: 'Relevancia' },
  { value: 'price-asc', label: 'Precio: menor a mayor' },
  { value: 'price-desc', label: 'Precio: mayor a menor' },
  { value: 'rating', label: 'Mejor valorados' },
  { value: 'name', label: 'Nombre (A-Z)' },
] as const satisfies readonly (SelectOption & { value: SortKey | '' })[]

/**
 * Search and sort. It is a native GET form: Enter submits it even before hydration (implicit
 * submission, so no submit button is needed), and the URL stays the source of truth. Once hydrated, sorting navigates on change and searching after a short
 * pause. The current query arrives as a prop (no `useSearchParams`, no extra Suspense).
 */
export function CatalogControls({ query }: { query: CatalogQuery }) {
  const { navigate, isPending } = useCatalogNavigation()
  const formRef = useRef<HTMLFormElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const [search, setSearch] = useState(query.q ?? '')
  const [sort, setSort] = useState<string>(query.sort ?? '')

  // Follow URL changes that did not come from this form (back button, "Quitar filtros"), but
  // never overwrite what the person is typing with the result of their own earlier request.
  const currentHref = buildCatalogHref(query)
  const [seenHref, setSeenHref] = useState(currentHref)
  const [requestedHref, setRequestedHref] = useState(currentHref)
  if (currentHref !== seenHref) {
    setSeenHref(currentHref)
    if (currentHref !== requestedHref) {
      setSearch(query.q ?? '')
      setSort(query.sort ?? '')
      setRequestedHref(currentHref)
    }
  }

  useEffect(() => () => clearTimeout(debounceRef.current), [])

  // Text typed (or an order chosen) before hydration is in the DOM but never reached React:
  // on a slow device the search would be ignored until the next keystroke. Pick it up once.
  useEffect(() => {
    const form = formRef.current
    if (!form || hrefFromForm() === currentHref) return

    const field = (name: string) => form.elements.namedItem(name) as HTMLInputElement | null
    setSearch(field('q')?.value ?? '')
    setSort(field('sort')?.value ?? '')
    debounceRef.current = setTimeout(() => go({ replace: true }), SEARCH_DEBOUNCE_MS)
    // Runs once, right after hydration.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /** Same normalization as a no-JS submit: the form is read exactly as the server would. */
  function hrefFromForm(): string | null {
    if (!formRef.current) return null
    const fields: RawSearchParams = {}
    for (const [name, value] of new FormData(formRef.current)) {
      if (typeof value === 'string') fields[name] = value
    }
    return buildCatalogHref(parseCatalogQuery(fields))
  }

  function go(options: { replace: boolean }) {
    clearTimeout(debounceRef.current)
    const href = hrefFromForm()
    if (!href || href === currentHref) return

    setRequestedHref(href)
    navigate(href, options)
  }

  function handleSearchChange(event: ChangeEvent<HTMLInputElement>) {
    setSearch(event.target.value)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => go({ replace: true }), SEARCH_DEBOUNCE_MS)
  }

  function handleSortChange(event: ChangeEvent<HTMLSelectElement>) {
    setSort(event.target.value)
    go({ replace: false })
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    go({ replace: false })
  }

  return (
    <form
      ref={formRef}
      method="get"
      action="/products"
      role="search"
      className={styles.form}
      onSubmit={handleSubmit}
    >
      {query.category && <input type="hidden" name="category" value={query.category} />}
      <Input
        type="search"
        name="q"
        label="Buscar productos"
        hideLabel
        placeholder="Buscar productos"
        autoComplete="off"
        enterKeyHint="search"
        maxLength={100}
        value={search}
        onChange={handleSearchChange}
      />
      <Select
        name="sort"
        label="Ordenar por"
        hideLabel
        options={SORT_OPTIONS}
        value={sort}
        onChange={handleSortChange}
      />
      <p role="status" className={a11y.visuallyHidden}>
        {isPending ? 'Actualizando resultados…' : ''}
      </p>
    </form>
  )
}
