/**
 * Sends a small JSON payload that survives the page being closed (sendBeacon), falling back
 * to a keepalive fetch. Fire and forget: reporting must never break the page.
 */
export function sendBeacon(endpoint: string, payload: Record<string, unknown>): void {
  const body = JSON.stringify(payload)
  const sent = navigator.sendBeacon?.(endpoint, new Blob([body], { type: 'application/json' }))
  if (!sent) void fetch(endpoint, { method: 'POST', body, keepalive: true }).catch(() => {})
}
