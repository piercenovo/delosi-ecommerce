import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'
import { Button } from '../Button'
import { EmptyState } from './EmptyState'

const meta = {
  title: 'Componentes/EmptyState',
  component: EmptyState,
  parameters: { layout: 'padded' },
  args: { title: 'No encontramos productos' },
} satisfies Meta<typeof EmptyState>

export default meta
type Story = StoryObj<typeof meta>

export const NoResults: Story = {
  args: {
    description: 'Prueba con otra búsqueda o quita los filtros para ver todo el catálogo.',
    action: <Button variant="secondary">Quitar filtros</Button>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(
      canvas.getByRole('heading', { level: 2, name: 'No encontramos productos' }),
    ).toBeVisible()
    await expect(canvas.getByRole('button', { name: 'Quitar filtros' })).toBeVisible()
  },
}

export const EmptyCart: Story = {
  args: {
    title: 'Tu carrito está vacío',
    description: 'Agrega productos desde el catálogo y aparecerán aquí.',
    headingLevel: 'h1',
    action: <a href="#catalogo">Ir al catálogo</a>,
  },
}
