import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { Input } from './Input'

const meta = {
  title: 'Componentes/Input',
  component: Input,
  args: { label: 'Nombre completo' },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('textbox', { name: 'Nombre completo' })

    await userEvent.type(input, 'Ana Pérez')

    await expect(input).toHaveValue('Ana Pérez')
  },
}

/** Search box of the catalog: the label is hidden visually but still announced. */
export const Search: Story = {
  args: { label: 'Buscar productos', hideLabel: true, type: 'search', placeholder: 'Buscar…' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(canvas.getByRole('searchbox', { name: 'Buscar productos' })).toBeVisible()
    // Visually hidden: it takes no space on screen (measured in the real browser).
    const { width, height } = canvas.getByText('Buscar productos').getBoundingClientRect()
    await expect(width * height).toBeLessThanOrEqual(1)
  },
}

export const WithDescription: Story = {
  args: {
    label: 'Correo',
    type: 'email',
    description: 'Te enviaremos la confirmación del pedido.',
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('textbox')).toHaveAccessibleDescription(
      'Te enviaremos la confirmación del pedido.',
    )
  },
}

export const WithError: Story = {
  args: {
    label: 'Correo',
    type: 'email',
    defaultValue: 'ana@',
    description: 'Te enviaremos la confirmación del pedido.',
    error: 'Escribe un correo válido, por ejemplo ana@correo.com.',
  },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('textbox')

    await expect(input).toBeInvalid()
    await expect(input).toHaveAccessibleDescription(
      'Te enviaremos la confirmación del pedido. Escribe un correo válido, por ejemplo ana@correo.com.',
    )
  },
}
