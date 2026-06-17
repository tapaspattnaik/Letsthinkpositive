import { ToolFAQ, type FAQItem } from '@/components/ToolFAQ'

// Metadata for /meditation lives in page.tsx; this layout adds the FAQ.

const FAQ: FAQItem[] = [
  { q: 'Is this guided meditation free?', a: 'Yes — free guided meditation right in your browser, with no app download and no signup.' },
  { q: 'How long should I meditate?', a: 'Beginners can start with 5 minutes. Consistency matters more than length — a short daily practice beats an occasional long one.' },
  { q: 'Can meditation help with anxiety and sleep?', a: 'Yes. Regular mindfulness meditation is associated with lower stress and better sleep, and the sessions here are designed for both.' },
  { q: 'Do I need any experience to start?', a: 'None at all. Each session guides you step by step, so you can begin even if you\'ve never meditated before.' },
]

export default function MeditationLayout({ children }: { children: React.ReactNode }) {
  return <>{children}<ToolFAQ items={FAQ} /></>
}
