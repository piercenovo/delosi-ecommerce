import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'
import { Badge } from './Badge'

const meta = {
  title: 'Componentes/Badge',
  component: Badge,
  args: { children: 'Nuevo' },
  argTypes: {
    tone: { control: 'inline-radio', options: ['neutral', 'primary', 'highlight'] },
  },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Neutral: Story = {}

export const Primary: Story = {
  args: { tone: 'primary', children: '20 productos' },
}

/**
 * Cart count: the number is visible and screen readers get the full context.
 * (`aria-label` is not allowed on a generic `<span>` in ARIA 1.2.)
 */
export const CartCount: Story = {
  args: { tone: 'highlight', children: '3', label: '3 productos en el carrito' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(canvas.getByText('3')).toHaveAttribute('aria-hidden', 'true')
    await expect(canvas.getByText('3 productos en el carrito')).toBeInTheDocument()
  },
}
