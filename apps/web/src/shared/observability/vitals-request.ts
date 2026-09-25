import { z } from 'zod'
import { readJsonBody } from './json-body'
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
  const body = await readJsonBody(request, MAX_BODY_BYTES)
  if (!body.ok) return new Response(null, { status: body.status })

  const result = webVitalSchema.safeParse(body.json)
  if (!result.success) return new Response(null, { status: 400 })

  reporter.report(result.data)
  return new Response(null, { status: 204 })
}
