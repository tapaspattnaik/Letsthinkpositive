import type { Metadata } from 'next'
import { ToolFAQ, type FAQItem } from '@/components/ToolFAQ'

export const metadata: Metadata = {
  alternates: { canonical: '/reframe' },
  title: 'Free CBT Thought Reframing Tool — Reframe Negative Thoughts',
  description: 'A free online CBT thought-reframing tool to challenge negative thoughts and overthinking. Private, evidence-based thought record — no signup, no app.',
}

const FAQ: FAQItem[] = [
  { q: 'Is the thought reframing tool free?', a: 'Yes — free and private, with no signup or app needed.' },
  { q: 'What is cognitive reframing?', a: 'Reframing is a core CBT technique: you take a negative or distorted thought and find a more balanced, evidence-based way to see the same situation.' },
  { q: 'Can reframing help with overthinking?', a: 'Yes. Naming and challenging a spiralling thought reduces its grip, which is why CBT reframing is widely used for anxiety and rumination.' },
  { q: 'Is this a replacement for therapy?', a: 'No. It\'s a self-help tool for everyday negative thoughts, not a substitute for professional care. If you\'re struggling, please reach out to a qualified professional.' },
]

export default function ReframeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}<ToolFAQ items={FAQ} /></>
}
