import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { Select } from './Select'

const sortOptions = [
  { value: '', label: 'Relevancia' },
  { value: 'price-asc', label: 'Precio: menor a mayor' },
  { value: 'price-desc', label: 'Precio: mayor a menor' },
  { value: 'rating', label: 'Mejor valorados' },
  { value: 'name', label: 'Nombre' },
]

const meta = {
  title: 'Componentes/Select',
  component: Select,
  args: { label: 'Ordenar por', options: sortOptions, onChange: fn() },
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const select = within(canvasElement).getByRole('combobox', { name: 'Ordenar por' })

    await userEvent.selectOptions(select, 'price-asc')

    await expect(select).toHaveValue('price-asc')
    await expect(args.onChange).toHaveBeenCalledOnce()
  },
}

export const HiddenLabel: Story = {
  args: { hideLabel: true, defaultValue: 'rating' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('combobox', { name: 'Ordenar por' })).toHaveValue(
      'rating',
    )
  },
}
