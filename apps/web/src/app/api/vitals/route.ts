import { metricsReporter } from '@/shared/observability/reporters'
import { handleVitalsRequest } from '@/shared/observability/vitals-request'

export function POST(request: Request) {
  return handleVitalsRequest(request, metricsReporter)
}
