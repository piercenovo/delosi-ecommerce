'use client'

import { useReportWebVitals } from 'next/web-vitals'
import { sendBeacon } from './beacon'

const ENDPOINT = '/api/vitals'

type ReportWebVitalsCallback = Parameters<typeof useReportWebVitals>[0]

// Module-level: a stable reference, so Next never reports the same metric twice.
const sendToEndpoint: ReportWebVitalsCallback = (metric) => {
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
export function WebVitalsReporter() {
  useReportWebVitals(sendToEndpoint)
  return null
}
