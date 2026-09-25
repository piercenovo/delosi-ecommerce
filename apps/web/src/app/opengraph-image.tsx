import { ImageResponse } from 'next/og'
import { SITE_OG_IMAGE } from '@/modules/products/seo/catalog-metadata'

export const alt = SITE_OG_IMAGE.alt
export const size = { width: SITE_OG_IMAGE.width, height: SITE_OG_IMAGE.height }
export const contentType = 'image/png'

// Brand card for pages without their own image (the catalog). Product pages share the
// product photo instead. Colors come from the design tokens (chicha morada and maracuyá).
// It uses next/og's bundled font (regular weight only): no font file to fetch or ship.
// The wordmark stands out by color instead of weight.
export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 80,
        background: '#5b2a86',
        color: '#ffffff',
      }}
    >
      <div style={{ display: 'flex', fontSize: 44, letterSpacing: -1 }}>
        <span style={{ color: '#f5c84c' }}>Delosi</span>
        <span style={{ marginLeft: 12, opacity: 0.85 }}>Store</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 104, lineHeight: 1.05, letterSpacing: -3 }}>
          Electrónica, joyería y ropa
        </div>
        <div style={{ marginTop: 32, width: 120, height: 12, background: '#f5c84c' }} />
      </div>
    </div>,
    size,
  )
}
