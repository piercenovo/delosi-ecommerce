import { handleClientErrorRequest } from '@/shared/observability/server/client-error-request'
import { errorReporter } from '@/shared/observability/server/reporters'

export function POST(request: Request) {
  return handleClientErrorRequest(request, errorReporter)
}
