/**
 * The product photo is one object across pages: the catalog card, a related-product card and
 * the detail page give its well the same view transition name, so navigating morphs it from
 * one place to the other. One name per product: a page never shows the same product twice.
 */
export function productImageTransitionName(productId: number): string {
  return `product-image-${productId}`
}

/** View transition class of the morph (styled in globals.css). */
export const PRODUCT_IMAGE_TRANSITION_CLASS = 'product-image'
