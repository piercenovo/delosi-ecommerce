import { z } from 'zod'
import type { ErrorReporter } from '../error-reporter'
import { readJsonBody } from './json-body'

/** A truncated message and stack fit well below this. */
const MAX_BODY_BYTES = 4096

const clientErrorSchema = z.object({
  name: z.string().min(1).max(100),
  message: z.string().max(500),
  stack: z.string().max(2000).optional(),
  digest: z.string().max(64).optional(),
  // Path only, as with web vitals: no query strings in the logs.
  route: z
    .string()
    .max(200)
    .regex(/^\/[^?#]*$/),
})

/** POST /api/errors: logs errors caught in the browser with the server ErrorReporter. */
export async function handleClientErrorRequest(
  request: Request,
  reporter: ErrorReporter,
): Promise<Response> {
  const body = await readJsonBody(request, MAX_BODY_BYTES)
  if (!body.ok) return new Response(null, { status: body.status })

  const result = clientErrorSchema.safeParse(body.json)
  if (!result.success) return new Response(null, { status: 400 })

  const { name, message, stack, digest, route } = result.data
  const error = Object.assign(new Error(message), { name, stack })
  reporter.capture(error, { source: 'client', digest, route })
  return new Response(null, { status: 204 })
}
