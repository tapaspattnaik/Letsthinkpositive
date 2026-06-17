import { JsonLd } from '@/components/JsonLd'

// Renders a visible FAQ section AND matching FAQPage structured data.
// Visible content is required for valid FAQ schema (hidden-only violates
// Google's policy) and targets People Also Ask / content depth.

export interface FAQItem { q: string; a: string }

export function ToolFAQ({
  heading = 'Frequently asked questions',
  items,
}: { heading?: string; items: FAQItem[] }) {
  if (!items.length) return null
  return (
    <section className="max-w-2xl mx-auto px-[5%] py-12">
      <h2 className="font-display text-[1.5rem] font-bold text-charcoal mb-6">{heading}</h2>
      <div className="space-y-3">
        {items.map((f, i) => (
          <details key={i} className="group bg-white border border-teal-light rounded-[16px] p-5 open:shadow-card transition-shadow">
            <summary className="cursor-pointer font-semibold text-charcoal text-[0.97rem] list-none flex items-center justify-between gap-3">
              {f.q}
              <span className="text-teal-mid transition-transform group-open:rotate-180 flex-shrink-0" aria-hidden="true">▾</span>
            </summary>
            <p className="text-text-mid text-[0.9rem] leading-[1.75] mt-3">{f.a}</p>
          </details>
        ))}
      </div>

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: items.map(f => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      }} />
    </section>
  )
}
