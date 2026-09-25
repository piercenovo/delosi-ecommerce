import { createConsoleReporter } from './console-reporter'
import type { ErrorReporter } from './error-reporter'
import type { MetricsReporter } from './metrics-reporter'

// The adapters the app uses, on the server and in the browser. Swap them here (ADR 0008).
const consoleReporter = createConsoleReporter()

export const errorReporter: ErrorReporter = consoleReporter
export const metricsReporter: MetricsReporter = consoleReporter
