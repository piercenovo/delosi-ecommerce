'use client'

import { useReportWebVitals } from 'next/web-vitals'
import { sendBeacon } from './beacon'
import { WEB_VITAL_NAMES } from '../metrics-reporter'

const ENDPOINT = '/api/vitals'

type ReportWebVitalsCallback = Parameters<typeof useReportWebVitals>[0]

// Module-level: a stable reference, so Next never reports the same metric twice.
const TRACKED: ReadonlySet<string> = new Set(WEB_VITAL_NAMES)

const sendToEndpoint: ReportWebVitalsCallback = (metric) => {
  // Next also reports FID (replaced by INP in 2024): send only what /api/vitals accepts.
  if (!TRACKED.has(metric.name)) return

  sendBeacon(ENDPOINT, {
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    id: metric.id,
    navigationType: metric.navigationType,
    route: window.location.pathname,
  })
}

/** Renders nothing: keeps the client boundary to this hook only. */
// In dev, StrictMode mounts twice and web-vitals listeners can't be removed, so each
// metric is logged twice. Production mounts once.
export function WebVitalsReporter() {
  useReportWebVitals(sendToEndpoint)
  return null
}
