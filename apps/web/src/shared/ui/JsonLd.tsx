type JsonLdData = Record<string, unknown>

/**
 * JSON for a `<script type="application/ld+json">`. Escaping `<` keeps data such as
 * "</script>" from closing the tag and injecting HTML; JSON parsers read `<` back as `<`.
 */
export function serializeJsonLd(data: JsonLdData): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

/** Structured data (schema.org) for search engines. */
export function JsonLd({ data }: { data: JsonLdData }) {
  // Safe: serializeJsonLd escapes `<`, so the data cannot close this tag.
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  )
}
