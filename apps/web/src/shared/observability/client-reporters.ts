import { sendBeacon } from './beacon'
import { createConsoleReporter } from './console-reporter'
import type { ErrorContext, ErrorReporter } from './error-reporter'

export const CLIENT_ERRORS_ENDPOINT = '/api/errors'
export const MAX_MESSAGE_LENGTH = 500
export const MAX_STACK_LENGTH = 2000

/**
 * Browser adapter: the browser console only reaches the person using the page, so each
 * report is also sent to /api/errors, where the server ErrorReporter logs it (Vercel logs).
 */
export function createClientErrorReporter(
  endpoint: string = CLIENT_ERRORS_ENDPOINT,
  local: ErrorReporter = createConsoleReporter(),
): ErrorReporter {
  return {
    capture(error: unknown, context: ErrorContext) {
      local.capture(error, context)

      const details =
        error instanceof Error
          ? { name: error.name, message: error.message, stack: error.stack }
          : { name: 'NonError', message: String(error) }

      sendBeacon(endpoint, {
        name: details.name.slice(0, 100),
        message: details.message.slice(0, MAX_MESSAGE_LENGTH),
        ...(details.stack ? { stack: details.stack.slice(0, MAX_STACK_LENGTH) } : {}),
        ...(context.digest ? { digest: context.digest } : {}),
        route: window.location.pathname,
      })
    },
  }
}

export const clientErrorReporter: ErrorReporter = createClientErrorReporter()
