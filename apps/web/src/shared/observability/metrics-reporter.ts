export const WEB_VITAL_NAMES = ['CLS', 'FCP', 'INP', 'LCP', 'TTFB'] as const
export const WEB_VITAL_RATINGS = ['good', 'needs-improvement', 'poor'] as const

export interface WebVitalMetric {
  name: (typeof WEB_VITAL_NAMES)[number]
  /** Milliseconds, except CLS (unitless score). */
  value: number
  rating: (typeof WEB_VITAL_RATINGS)[number]
  /** Unique per metric and page load: lets a backend deduplicate reports. */
  id: string
  navigationType?: string | undefined
  /** Path without query string: search terms never reach the logs. */
  route: string
}

/** Port for performance metrics, mirroring ErrorReporter. */
export interface MetricsReporter {
  report(metric: WebVitalMetric): void
}
