import type { ErrorContext, ErrorReporter } from './error-reporter'
import type { MetricsReporter, WebVitalMetric } from './metrics-reporter'

interface ConsoleSink {
  error(line: string): void
  info(line: string): void
}

interface ConsoleReporterOptions {
  sink?: ConsoleSink
  now?: () => Date
}

/**
 * Adapter for both ports: one JSON object per line, which Vercel's log view (and any log
 * pipeline) can filter by `event`, `digest` or `route`. Replacing it with Sentry or Datadog
 * means writing another adapter; nothing else in the app changes (ADR 0008).
 */
export function createConsoleReporter({
  sink = console,
  now = () => new Date(),
}: ConsoleReporterOptions = {}): ErrorReporter & MetricsReporter {
  return {
    capture(error: unknown, context: ErrorContext) {
      const details =
        error instanceof Error
          ? { name: error.name, message: error.message, stack: error.stack }
          : { name: 'NonError', message: String(error) }

      sink.error(
        JSON.stringify({
          level: 'error',
          event: 'error',
          ...details,
          ...context,
          timestamp: now().toISOString(),
        }),
      )
    },

    report(metric: WebVitalMetric) {
      sink.info(
        JSON.stringify({
          level: 'info',
          event: 'web_vital',
          ...metric,
          timestamp: now().toISOString(),
        }),
      )
    },
  }
}
