interface BrandMarkProps {
  className?: string | undefined
}

/**
 * The favicon's "D" inverted: maracuyá tile, purple letter. It reads the same on the purple
 * header and on the neutral footer, in both themes. Decorative: the wordmark next to it names
 * the store.
 */
export function BrandMark({ className }: BrandMarkProps) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" focusable="false">
      <rect width="64" height="64" rx="14" fill="var(--color-highlight)" />
      <path
        d="M20 14h11c11.6 0 19 7.1 19 18s-7.4 18-19 18H20zm9 8.5v19h2c6 0 9.6-3.6 9.6-9.5s-3.6-9.5-9.6-9.5z"
        fill="var(--color-brand)"
      />
    </svg>
  )
}
