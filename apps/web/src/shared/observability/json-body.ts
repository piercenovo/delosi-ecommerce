type JsonBody = { ok: true; json: unknown } | { ok: false; status: 400 | 413 }

/**
 * Reads a small JSON body from a public endpoint: rejects by the declared size before
 * reading (413), re-checks the actual size, and answers 400 when it is not JSON.
 */
export async function readJsonBody(request: Request, maxBytes: number): Promise<JsonBody> {
  const declared = Number(request.headers.get('content-length') ?? 0)
  if (declared > maxBytes) return { ok: false, status: 413 }

  const text = await request.text()
  if (text.length > maxBytes) return { ok: false, status: 413 }

  try {
    return { ok: true, json: JSON.parse(text) as unknown }
  } catch {
    return { ok: false, status: 400 }
  }
}
