import { z } from 'zod'

export const productDtoSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1),
  price: z.number().nonnegative(),
  description: z.string(),
  category: z.string().min(1),
  image: z.url(),
  rating: z.object({
    rate: z.number().min(0).max(5),
    count: z.number().int().nonnegative(),
  }),
})

export const productListDtoSchema = z.array(productDtoSchema)

export const categoryListDtoSchema = z.array(z.string().min(1))

/** Product id (as string) → public path of the locally served image. */
export const localImagesSchema = z.record(z.string(), z.string().startsWith('/images/products/'))

export const fakeStoreSnapshotSchema = z.object({
  source: z.url(),
  capturedAt: z.iso.datetime(),
  products: productListDtoSchema,
  categories: categoryListDtoSchema,
  images: localImagesSchema,
})

export type ProductDto = z.infer<typeof productDtoSchema>
export type LocalImages = z.infer<typeof localImagesSchema>
export type FakeStoreSnapshot = z.infer<typeof fakeStoreSnapshotSchema>
