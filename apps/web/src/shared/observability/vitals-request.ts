import { z } from 'zod'
import {
  WEB_VITAL_NAMES,
  WEB_VITAL_RATINGS,
  type MetricsReporter,
  type WebVitalMetric,
} from './metrics-reporter'

/** A metric is ~200 bytes; anything much larger is not a web vitals beacon. */
const MAX_BODY_BYTES = 2048

const webVitalSchema = z.object({
  name: z.enum(WEB_VITAL_NAMES),
  value: z.number().finite().nonnegative(),
  rating: z.enum(WEB_VITAL_RATINGS),
  id: z.string().min(1).max(100),
  navigationType: z.string().max(40).optional(),
  // Path only: a query string could carry search terms or other personal data.
  route: z
    .string()
    .max(200)
    .regex(/^\/[^?#]*$/),
}) satisfies z.ZodType<WebVitalMetric>

/** POST /api/vitals: validates the beacon sent by WebVitalsReporter and reports it. */
export async function handleVitalsRequest(
  request: Request,
  reporter: MetricsReporter,
): Promise<Response> {
  // Reject by the declared size before reading; re-check the actual size after.
  const declared = Number(request.headers.get('content-length') ?? 0)
  if (declared > MAX_BODY_BYTES) return new Response(null, { status: 413 })

  const body = await request.text()
  if (body.length > MAX_BODY_BYTES) return new Response(null, { status: 413 })

  let json: unknown
  try {
    json = JSON.parse(body)
  } catch {
    return new Response(null, { status: 400 })
  }

  const result = webVitalSchema.safeParse(json)
  if (!result.success) return new Response(null, { status: 400 })

  reporter.report(result.data)
  return new Response(null, { status: 204 })
}
