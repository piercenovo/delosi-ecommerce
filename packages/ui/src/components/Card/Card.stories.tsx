import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import landscapeImage from '../../stories-assets/landscape-product.png'
import portraitImage from '../../stories-assets/portrait-product.png'
import { IconButton } from '../IconButton'
import { Card } from './Card'

const meta = {
  title: 'Componentes/Card',
  component: Card,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

function CartPlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 4h2l2.4 11.2a1 1 0 0 0 1 .8h8.9a1 1 0 0 0 1-.8L20 8H6" />
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="17" cy="20" r="1.5" />
      <path d="M13 9v5M10.5 11.5h5" />
    </svg>
  )
}

interface ProductCardProps {
  title: string
  price: string
  rating: string
  image: string
  onQuickAdd?: () => void
}

/** Composed like the store's product card: photo, title, rating, price and a quick add. */
function ProductCard({ title, price, rating, image, onQuickAdd }: ProductCardProps) {
  return (
    <Card className="sb-card">
      <Card.Media>
        <img src={image} alt="" />
      </Card.Media>
      <Card.Body>
        <Card.Title>
          <Card.Link href="#producto">{title}</Card.Link>
        </Card.Title>
        <p className="sb-muted">{rating}</p>
        <p className="sb-price">{price}</p>
      </Card.Body>
      <Card.Action>
        <IconButton
          variant="floating"
          shape="circle"
          size="sm"
          aria-label={`Agregar «${title}» al carrito`}
          onClick={onQuickAdd}
        >
          <CartPlusIcon />
        </IconButton>
      </Card.Action>
    </Card>
  )
}

const quickAdd = fn()

export const Product: Story = {
  render: () => (
    <ProductCard
      title="WD 2TB Elements Portable External Hard Drive - USB 3.0"
      price="USD 64.00"
      rating="★ 3.3 (203)"
      image={portraitImage}
      onQuickAdd={quickAdd}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const link = canvas.getByRole('link', {
      name: 'WD 2TB Elements Portable External Hard Drive - USB 3.0',
    })
    const action = canvas.getByRole('button', { name: /^Agregar «WD 2TB/ })

    await expect(canvas.getByRole('article')).toContainElement(link)
    await expect(canvas.getByRole('heading', { level: 3 })).toContainElement(link)
    // No border: the rounded photo carries the shape.
    await expect(getComputedStyle(canvas.getByRole('article')).borderTopStyle).toBe('none')

    // Tab order reads the title first, then the action over the photo.
    await userEvent.tab()
    await expect(link).toHaveFocus()
    await userEvent.tab()
    await expect(action).toHaveFocus()

    // The action works on its own, above the stretched link.
    await userEvent.click(action)
    await expect(quickAdd).toHaveBeenCalledOnce()
  },
}

/** Portrait and landscape images get the same media box: no layout shift in a grid. */
export const MixedImageRatios: Story = {
  render: () => (
    <div className="sb-row">
      <ProductCard
        title="WD 2TB Elements Portable External Hard Drive - USB 3.0"
        price="USD 64.00"
        rating="★ 3.3 (203)"
        image={portraitImage}
      />
      <ProductCard
        title="Solid Gold Petite Micropave"
        price="USD 168.00"
        rating="★ 3.9 (70)"
        image={landscapeImage}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const media = canvasElement.querySelectorAll('[data-card-media]')
    const [first, second] = [...media].map((element) => element.getBoundingClientRect())

    await expect(media).toHaveLength(2)
    await expect(first?.height).toBeCloseTo(first?.width ?? 0, 0)
    await expect(second?.height).toBeCloseTo(first?.height ?? 0, 0)

    // Each image fills the inner frame, inset from the media box on every side.
    for (const box of media) {
      const outer = box.getBoundingClientRect()
      const image = box.querySelector('img')?.getBoundingClientRect()

      await expect(image?.width).toBeLessThan(outer.width)
      await expect(image?.height).toBeCloseTo(image?.width ?? 0, 0)
      await expect(image?.top).toBeGreaterThan(outer.top)
      await expect(image?.bottom).toBeLessThan(outer.bottom)
    }
  },
}

export const LandscapeMedia: Story = {
  render: () => (
    <Card className="sb-card">
      <Card.Media ratio="landscape">
        <img src={landscapeImage} alt="" />
      </Card.Media>
      <Card.Body>
        <Card.Title as="h2">Solid Gold Petite Micropave</Card.Title>
        <p>Diseñado y vendido por Hafeez Center en Estados Unidos.</p>
      </Card.Body>
    </Card>
  ),
}
