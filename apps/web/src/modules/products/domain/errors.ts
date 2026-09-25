export class CatalogUnavailableError extends Error {
  override readonly name = 'CatalogUnavailableError'

  constructor(message: string, options?: ErrorOptions) {
    super(message, options)
  }
}
