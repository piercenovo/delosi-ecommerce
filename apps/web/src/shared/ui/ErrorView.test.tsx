import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { clientErrorReporter } from '@/shared/observability/client/client-reporters'
import { ErrorView } from './ErrorView'

vi.mock('@/shared/observability/client/client-reporters', () => ({
  clientErrorReporter: { capture: vi.fn() },
}))

const error = Object.assign(new Error('An error occurred in the Server Components render.'), {
  digest: '2718281828',
})

function renderView(retry = vi.fn()) {
  render(
    <ErrorView
      error={error}
      retry={retry}
      title="No pudimos cargar los productos"
      description="Intenta de nuevo en unos segundos."
    />,
  )
  return retry
}

describe('ErrorView', () => {
  it('explains what failed as the page heading', () => {
    renderView()

    expect(
      screen.getByRole('heading', { level: 1, name: 'No pudimos cargar los productos' }),
    ).toBeVisible()
    expect(screen.getByText('Intenta de nuevo en unos segundos.')).toBeVisible()
  })

  it('titles the document even when the page metadata failed too', () => {
    renderView()

    expect(document.title).toBe('No pudimos cargar los productos | Delosi Store')
  })

  it('retries (re-fetch and re-render) on "Intentar de nuevo"', async () => {
    const retry = renderView()

    await userEvent.click(screen.getByRole('button', { name: 'Intentar de nuevo' }))

    expect(retry).toHaveBeenCalledOnce()
  })

  it('offers the catalog as a way out', () => {
    renderView()

    expect(screen.getByRole('link', { name: 'Ir al catálogo' })).toHaveAttribute(
      'href',
      '/products',
    )
  })

  it('reports the error once, with the digest that matches the server log', () => {
    renderView()

    expect(clientErrorReporter.capture).toHaveBeenCalledExactlyOnceWith(
      error,
      expect.objectContaining({ source: 'client', digest: '2718281828' }),
    )
  })
})
