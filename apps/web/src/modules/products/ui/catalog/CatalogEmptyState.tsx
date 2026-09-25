import { Button, EmptyState } from '@delosi/ui'
import Link from 'next/link'
import type { CatalogQuery } from '../../domain/catalog-query'
import type { Category } from '../../domain/product'

interface CatalogEmptyStateProps {
  query: CatalogQuery
  category: Category | null
}

/** Explains why nothing matched and offers the way back to the full catalog. */
export function CatalogEmptyState({ query, category }: CatalogEmptyStateProps) {
  const where = category ? ` en ${category.name}` : ''
  const description = query.q
    ? `Nada coincide con «${query.q}»${where}. Revisa cómo está escrito o prueba con otra palabra.`
    : `Por ahora no hay productos${where}.`

  return (
    <EmptyState
      title="No encontramos productos"
      description={description}
      action={
        <Button as={Link} href="/products">
          Quitar filtros
        </Button>
      }
    />
  )
}
