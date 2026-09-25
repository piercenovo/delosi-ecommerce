import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { JsonLd, serializeJsonLd } from './JsonLd'

describe('serializeJsonLd', () => {
  it('cannot close the script tag it is embedded in', () => {
    const hostile = { name: 'Bracelet</script><script>alert(1)</script>' }
    const serialized = serializeJsonLd(hostile)

    expect(serialized).not.toContain('<')
    expect(JSON.parse(serialized)).toEqual(hostile)
  })
})

describe('JsonLd', () => {
  it('embeds the data as a schema.org script', () => {
    const data = { '@context': 'https://schema.org', '@type': 'Product', name: 'Naga Bracelet' }
    const { container } = render(<JsonLd data={data} />)

    const script = container.querySelector('script[type="application/ld+json"]')
    expect(JSON.parse(script?.textContent ?? '')).toEqual(data)
  })
})
