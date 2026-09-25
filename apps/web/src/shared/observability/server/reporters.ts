import { createConsoleReporter } from '../console-reporter'
import type { ErrorReporter } from '../error-reporter'
import type { MetricsReporter } from '../metrics-reporter'

// Server adapters (instrumentation, API routes). The browser uses client-reporters.ts,
// which forwards to /api/errors and ends up here. Swap adapters here (ADR 0008).
const consoleReporter = createConsoleReporter()

export const errorReporter: ErrorReporter = consoleReporter
export const metricsReporter: MetricsReporter = consoleReporter
