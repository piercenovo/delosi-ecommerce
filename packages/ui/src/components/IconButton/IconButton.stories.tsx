import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { IconButton } from './IconButton'

function CartIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M3 4h2l2.4 11.2a1 1 0 0 0 1 .8h8.9a1 1 0 0 0 1-.8L20 8H6" />
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="17" cy="20" r="1.5" />
    </svg>
  )
}

const meta = {
  title: 'Componentes/IconButton',
  component: IconButton,
  args: { 'aria-label': 'Ver carrito', children: <CartIcon />, onClick: fn() },
  argTypes: {
    variant: { control: 'inline-radio', options: ['ghost', 'secondary'] },
    size: { control: 'inline-radio', options: ['sm', 'md'] },
  },
} satisfies Meta<typeof IconButton>

export default meta
type Story = StoryObj<typeof meta>

export const Ghost: Story = {
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole('button', { name: 'Ver carrito' })

    await userEvent.tab()
    await expect(button).toHaveFocus()

    await userEvent.keyboard('{Enter}')
    await expect(args.onClick).toHaveBeenCalledOnce()
  },
}

export const Secondary: Story = {
  args: { variant: 'secondary' },
}

/** The minimum touch target is 44×44 px even at the small size. */
export const Small: Story = {
  args: { size: 'sm' },
  play: async ({ canvasElement }) => {
    const { width, height } = within(canvasElement).getByRole('button').getBoundingClientRect()

    await expect(Math.min(width, height)).toBeGreaterThanOrEqual(44)
  },
}

/** At a limit (e.g. quantity 1): announced as unavailable, still focusable, dimmed. */
export const Unavailable: Story = {
  args: { 'aria-disabled': true, 'aria-label': 'Disminuir cantidad' },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button', { name: 'Disminuir cantidad' })

    await userEvent.tab()
    await expect(button).toHaveFocus()
    await expect(button).toHaveAttribute('aria-disabled', 'true')
    await expect(Number(getComputedStyle(button).opacity)).toBeLessThan(1)
  },
}
