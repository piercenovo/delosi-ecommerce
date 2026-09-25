import type { CSSProperties } from 'react'
import './docs.css'

interface TokenSwatchProps {
  /** Hex value of the token in one theme. */
  color: string
  /** WCAG contrast ratio of the pair this token is used in. */
  contrast?: string
}

/** Documentation-only swatch: shows a theme value explicitly, independent of the active theme. */
export function TokenSwatch({ color, contrast }: TokenSwatchProps) {
  const style = { '--swatch': color } as CSSProperties
  return (
    <span className="docs-token">
      <span className="docs-swatch" style={style} aria-hidden="true" />
      <code>{color}</code>
      {contrast && <span>{contrast}:1</span>}
    </span>
  )
}
