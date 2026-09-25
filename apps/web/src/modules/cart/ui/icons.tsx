// Decorative icons: the text or aria-label next to them carries the meaning.

export function CartIcon({ className }: { className?: string | undefined }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M3 4h2l2.4 10.2a1.5 1.5 0 0 0 1.5 1.1h8.3a1.5 1.5 0 0 0 1.4-1.1L20.5 8H6.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9.5" cy="19.5" r="1.4" fill="currentColor" />
      <circle cx="17" cy="19.5" r="1.4" fill="currentColor" />
    </svg>
  )
}

export function CheckIcon({ className }: { className?: string | undefined }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M5 12.5l4.5 4.5L19 7.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
