import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { Card } from '../Card'
import { Skeleton } from './Skeleton'

const meta = {
  title: 'Componentes/Skeleton',
  component: Skeleton,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Skeleton>

export default meta
type Story = StoryObj<typeof meta>

export const Variants: Story = {
  render: () => (
    <div className="sb-row">
      <Skeleton variant="circle" />
      <div className="sb-card">
        <Skeleton variant="text" />
        <Skeleton variant="text" />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const skeletons = canvasElement.querySelectorAll('[data-skeleton]')

    await expect(skeletons).toHaveLength(3)
    for (const skeleton of skeletons) {
      await expect(skeleton).toHaveAttribute('aria-hidden', 'true')
    }
  },
}

/** Loading placeholder with exactly the same box as a product card. */
export const ProductCardPlaceholder: Story = {
  render: () => (
    <Card className="sb-card">
      <Card.Media>
        <Skeleton variant="rect" />
      </Card.Media>
      <Card.Body>
        <Skeleton variant="text" />
        <Skeleton variant="text" />
      </Card.Body>
    </Card>
  ),
}
