import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import landscapeImage from '../../stories-assets/landscape-product.png'
import portraitImage from '../../stories-assets/portrait-product.png'
import { Button } from '../Button'
import { Card } from './Card'

const meta = {
  title: 'Componentes/Card',
  component: Card,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

interface ProductCardProps {
  title: string
  price: string
  image: string
  onAddToCart?: () => void
}

function ProductCard({ title, price, image, onAddToCart }: ProductCardProps) {
  return (
    <Card className="sb-card">
      <Card.Media>
        <img src={image} alt="" />
      </Card.Media>
      <Card.Body>
        <Card.Title>
          <Card.Link href="#producto">{title}</Card.Link>
        </Card.Title>
        <p>{price}</p>
      </Card.Body>
      <Card.Footer>
        <Button size="sm" onClick={onAddToCart}>
          Agregar al carrito
        </Button>
      </Card.Footer>
    </Card>
  )
}

const addToCart = fn()

export const Product: Story = {
  render: () => (
    <ProductCard
      title="WD 2TB Elements Portable External Hard Drive - USB 3.0"
      price="US$ 64.00"
      image={portraitImage}
      onAddToCart={addToCart}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const link = canvas.getByRole('link', {
      name: 'WD 2TB Elements Portable External Hard Drive - USB 3.0',
    })

    await expect(canvas.getByRole('article')).toContainElement(link)
    await expect(canvas.getByRole('heading', { level: 3 })).toContainElement(link)

    // The footer action works on its own, above the stretched link.
    await userEvent.click(canvas.getByRole('button', { name: 'Agregar al carrito' }))
    await expect(addToCart).toHaveBeenCalledOnce()
  },
}

/** Portrait and landscape images get the same media box: no layout shift in a grid. */
export const MixedImageRatios: Story = {
  render: () => (
    <div className="sb-row">
      <ProductCard
        title="WD 2TB Elements Portable External Hard Drive - USB 3.0"
        price="US$ 64.00"
        image={portraitImage}
      />
      <ProductCard title="Solid Gold Petite Micropave" price="US$ 168.00" image={landscapeImage} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const media = canvasElement.querySelectorAll('[data-card-media]')
    const [first, second] = [...media].map((element) => element.getBoundingClientRect())

    await expect(media).toHaveLength(2)
    await expect(first?.height).toBeCloseTo(first?.width ?? 0, 0)
    await expect(second?.height).toBeCloseTo(first?.height ?? 0, 0)
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
