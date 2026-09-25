import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { Button } from './Button'

const meta = {
  title: 'Componentes/Button',
  component: Button,
  args: { children: 'Agregar al carrito', onClick: fn() },
  argTypes: {
    variant: { control: 'inline-radio', options: ['primary', 'secondary', 'ghost'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole('button', { name: 'Agregar al carrito' })

    await userEvent.click(button)

    await expect(args.onClick).toHaveBeenCalledOnce()
    await expect(button).toHaveAttribute('type', 'button')
  },
}

export const Secondary: Story = {
  args: { variant: 'secondary', children: 'Ver detalle' },
}

export const Ghost: Story = {
  args: { variant: 'ghost', children: 'Limpiar filtros' },
}

export const Sizes: Story = {
  render: (args) => (
    <div className="sb-row">
      <Button {...args} size="sm">
        Pequeño
      </Button>
      <Button {...args} size="md">
        Mediano
      </Button>
      <Button {...args} size="lg">
        Grande
      </Button>
    </div>
  ),
}

export const FullWidth: Story = {
  args: { fullWidth: true },
  parameters: { layout: 'padded' },
}

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole('button', { name: 'Agregar al carrito' })

    await userEvent.click(button, { pointerEventsCheck: 0 })

    await expect(button).toBeDisabled()
    await expect(args.onClick).not.toHaveBeenCalled()
  },
}

export const Loading: Story = {
  args: { loading: true },
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole('button', { name: 'Agregar al carrito' })

    await userEvent.click(button, { pointerEventsCheck: 0 })

    await expect(button).toHaveAttribute('aria-busy', 'true')
    await expect(button).toBeDisabled()
    await expect(args.onClick).not.toHaveBeenCalled()
  },
}
