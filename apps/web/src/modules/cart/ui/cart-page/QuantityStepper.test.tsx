import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { QuantityStepper } from './QuantityStepper'

function renderStepper(value: number, onChange = vi.fn()) {
  render(<QuantityStepper value={value} itemLabel="Naga Bracelet" onChange={onChange} />)
  return onChange
}

const decrease = () => screen.getByRole('button', { name: 'Disminuir cantidad de «Naga Bracelet»' })
const increase = () => screen.getByRole('button', { name: 'Aumentar cantidad de «Naga Bracelet»' })

describe('QuantityStepper', () => {
  it('is a named group that shows the quantity', () => {
    renderStepper(3)

    expect(screen.getByRole('group', { name: 'Cantidad de «Naga Bracelet»' })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('3 unidades')
  })

  it('asks for one more or one less', async () => {
    const onChange = renderStepper(3)

    await userEvent.click(increase())
    await userEvent.click(decrease())

    expect(onChange.mock.calls).toEqual([[4], [2]])
  })

  it('does not go below 1: removing is a separate, explicit action', async () => {
    const onChange = renderStepper(1)

    await userEvent.click(decrease())

    expect(decrease()).toHaveAttribute('aria-disabled', 'true')
    expect(onChange).not.toHaveBeenCalled()
  })

  it('does not go above 99', async () => {
    const onChange = renderStepper(99)

    await userEvent.click(increase())

    expect(increase()).toHaveAttribute('aria-disabled', 'true')
    expect(onChange).not.toHaveBeenCalled()
  })

  it('keeps the keyboard focus on a button that reaches its limit', async () => {
    renderStepper(1)

    decrease().focus()
    await userEvent.keyboard('{Enter}')

    expect(decrease()).toHaveFocus()
    expect(decrease()).toBeEnabled()
  })
})
