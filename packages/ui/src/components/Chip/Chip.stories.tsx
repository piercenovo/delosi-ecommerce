import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, userEvent, within } from 'storybook/test'
import { Chip } from './Chip'

const meta = {
  title: 'Componentes/Chip',
  component: Chip,
  args: { children: 'Joyería' },
} satisfies Meta<typeof Chip>

export default meta
type Story = StoryObj<typeof meta>

/** As a toggle button it exposes `aria-pressed`. */
export const Toggle: Story = {
  render: () => {
    function ToggleChip() {
      const [selected, setSelected] = useState(false)
      return (
        <Chip selected={selected} onClick={() => setSelected((value) => !value)}>
          Solo con descuento
        </Chip>
      )
    }
    return <ToggleChip />
  },
  play: async ({ canvasElement }) => {
    const chip = within(canvasElement).getByRole('button', { name: 'Solo con descuento' })
    await expect(chip).toHaveAttribute('aria-pressed', 'false')

    await userEvent.click(chip)

    await expect(chip).toHaveAttribute('aria-pressed', 'true')
  },
}

/** As a link (e.g. a category filter) the selected chip is the current page. */
export const Links: Story = {
  render: () => (
    <nav aria-label="Categorías">
      <ul className="sb-row sb-list">
        <li>
          <Chip as="a" href="?category=electronics">
            Electrónica
          </Chip>
        </li>
        <li>
          <Chip as="a" href="?category=jewelery" selected>
            Joyería
          </Chip>
        </li>
        <li>
          <Chip as="a" href="?category=mens-clothing">
            Ropa de hombre
          </Chip>
        </li>
      </ul>
    </nav>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(canvas.getByRole('link', { name: 'Joyería' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    await expect(canvas.getByRole('link', { name: 'Electrónica' })).not.toHaveAttribute(
      'aria-current',
    )
  },
}
