/**
 * JsonLd — renders a <script type="application/ld+json"> block.
 * Use in Server Components (page.tsx / layout.tsx) for structured data.
 * Safe: data is JSON.stringified so no XSS risk from content fields.
 */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
