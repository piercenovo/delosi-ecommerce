'use client'

import { useReportWebVitals } from 'next/web-vitals'

const ENDPOINT = '/api/vitals'

type ReportWebVitalsCallback = Parameters<typeof useReportWebVitals>[0]

// Module-level: a stable reference, so Next never reports the same metric twice.
const sendToEndpoint: ReportWebVitalsCallback = (metric) => {
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    id: metric.id,
    navigationType: metric.navigationType,
    route: window.location.pathname,
  })

  // sendBeacon survives the page being closed; fetch keepalive is the fallback.
  const sent = navigator.sendBeacon?.(ENDPOINT, new Blob([body], { type: 'application/json' }))
  if (!sent) void fetch(ENDPOINT, { method: 'POST', body, keepalive: true }).catch(() => {})
}

/** Renders nothing: keeps the client boundary to this hook only. */
export function WebVitalsReporter() {
  useReportWebVitals(sendToEndpoint)
  return null
}
