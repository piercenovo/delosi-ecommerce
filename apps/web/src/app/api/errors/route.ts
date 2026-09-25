import { handleClientErrorRequest } from '@/shared/observability/client-error-request'
import { errorReporter } from '@/shared/observability/reporters'

export function POST(request: Request) {
  return handleClientErrorRequest(request, errorReporter)
}
