import { z } from 'zod'

const urlWithoutTrailingSlash = z.url().transform((value) => value.replace(/\/+$/, ''))

const serverEnvSchema = z.object({
  PRODUCTS_API_BASE_URL: urlWithoutTrailingSlash.default('https://fakestoreapi.com'),
  NEXT_PUBLIC_SITE_URL: urlWithoutTrailingSlash.default('http://localhost:3000'),
  REVALIDATE_SECRET: z.string().min(16).optional(),
})

export type ServerEnv = z.infer<typeof serverEnvSchema>

export function parseServerEnv(source: Record<string, string | undefined>): ServerEnv {
  const result = serverEnvSchema.safeParse(source)

  if (!result.success) {
    throw new Error(`Invalid environment variables:\n${z.prettifyError(result.error)}`)
  }

  return result.data
}
