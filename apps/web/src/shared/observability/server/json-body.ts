type JsonBody = { ok: true; json: unknown } | { ok: false; status: 400 | 413 }

/**
 * Reads a small JSON body from a public endpoint: rejects by the declared size before
 * reading (413), re-checks the actual size, and answers 400 when it is not JSON or the client
 * aborted the upload.
 */
export async function readJsonBody(request: Request, maxBytes: number): Promise<JsonBody> {
  const declared = Number(request.headers.get('content-length') ?? 0)
  if (declared > maxBytes) return { ok: false, status: 413 }

  let text: string
  try {
    text = await request.text()
  } catch {
    // The client went away mid-body (e.g. a tab closed while a beacon was in flight): nothing
    // to answer, and not a server error worth logging.
    return { ok: false, status: 400 }
  }
  if (text.length > maxBytes) return { ok: false, status: 413 }

  try {
    return { ok: true, json: JSON.parse(text) as unknown }
  } catch {
    return { ok: false, status: 400 }
  }
}
