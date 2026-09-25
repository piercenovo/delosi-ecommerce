import { metricsReporter } from '@/shared/observability/server/reporters'
import { handleVitalsRequest } from '@/shared/observability/server/vitals-request'

export function POST(request: Request) {
  return handleVitalsRequest(request, metricsReporter)
}
