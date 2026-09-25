import type { Instrumentation } from 'next'
import { errorReporter } from '@/shared/observability/server/reporters'

/** Every server error (render, route handler, action, proxy) goes to the ErrorReporter. */
export const onRequestError: Instrumentation.onRequestError = (error, request, context) => {
  const digest =
    typeof error === 'object' && error !== null && 'digest' in error
      ? String(error.digest)
      : undefined

  errorReporter.capture(error, {
    source: 'server',
    digest,
    route: context.routePath,
    routeType: context.routeType,
    method: request.method,
  })
}
