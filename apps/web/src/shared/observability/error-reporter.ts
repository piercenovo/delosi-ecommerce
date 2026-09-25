/** Where an error was caught. */
export interface ErrorContext {
  source: 'server' | 'client'
  /** Server errors: React's hash of the original error, shown to the client instead of details. */
  digest?: string | undefined
  /** Route pattern or path where it happened. */
  route?: string | undefined
  [key: string]: unknown
}

/** Port: the app reports errors here; an adapter decides where they go (console, Sentry…). */
export interface ErrorReporter {
  capture(error: unknown, context: ErrorContext): void
}
