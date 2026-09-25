import { buildCatalogHref } from '../url/catalog-search-params'
import type { CatalogQuery } from '../domain/catalog-query'
import type { Category } from '../domain/product'
import styles from './CategoryNav.module.css'
import { CategoryLink } from './CategoryLink'

interface CategoryNavProps {
  categories: readonly Category[]
  /** The applied query: links keep its search and order. */
  query: CatalogQuery
}

export function CategoryNav({ categories, query }: CategoryNavProps) {
  const options = [{ slug: undefined, name: 'Todo' }, ...categories]

  return (
    <nav aria-label="Categorías" className={styles.nav}>
      <ul role="list" className={styles.list}>
        {options.map(({ slug, name }) => (
          <li key={slug ?? 'all'}>
            <CategoryLink
              href={buildCatalogHref(query, { category: slug })}
              selected={query.category === slug}
            >
              {name}
            </CategoryLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
