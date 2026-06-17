import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  alternates: { canonical: '/disclaimer' },
  title: 'Disclaimer',
  description: 'Important disclaimer regarding the wellness content and AI features on letsthinkpositive.com.',
}

export default function DisclaimerPage() {
  return (
    <>
      <section className="bg-gradient-to-br from-teal-deep to-teal-dark py-16 px-[5%] text-white text-center">
        <h1 className="font-display text-[clamp(2rem,3.5vw,2.8rem)] font-bold mb-3">Disclaimer</h1>
        <p className="text-white/70 text-[1rem]">Please read this before using any wellness content or AI features</p>
      </section>

      <article className="max-w-[760px] mx-auto py-16 px-[5%]">

        <div className="bg-amber/10 border-l-4 border-amber rounded-r-[12px] px-6 py-5 mb-10">
          <p className="font-semibold text-charcoal text-[0.95rem]">
            ⚠️ letsthinkpositive.com is a wellness community platform — not a medical, therapeutic, or crisis service.
          </p>
        </div>

        <div className="space-y-10">
          <section>
            <h2 className="font-display text-[1.15rem] font-semibold text-charcoal mb-3">Not Medical Advice</h2>
            <p className="text-text-mid text-[0.95rem] leading-[1.85]">
              All content on this Platform — including articles, challenge programmes, meditation guides, journaling prompts, and affirmations — is provided for general informational and educational purposes only. It does not constitute medical, psychiatric, psychological, or therapeutic advice of any kind. Always consult a qualified healthcare professional before making changes to your health, diet, exercise, or mental health management.
            </p>
          </section>

          <section>
            <h2 className="font-display text-[1.15rem] font-semibold text-charcoal mb-3">AI Features (Bit & Calm Coach)</h2>
            <p className="text-text-mid text-[0.95rem] leading-[1.85]">
              The Bit chat companion and Calm Coach are powered by artificial intelligence. Their responses are generated algorithmically and may occasionally be incomplete, inaccurate, or inappropriate for your specific situation. These features are designed for general wellness exploration and emotional reflection only — they are not therapists, counsellors, or medical professionals.
            </p>
            <p className="text-text-mid text-[0.95rem] leading-[1.85] mt-3">
              <strong>If you are in crisis, experiencing thoughts of self-harm, or need urgent support, please stop and contact a qualified professional or emergency services immediately.</strong> Find a free, confidential helpline in your country at findahelpline.com — or call your local crisis line or emergency services.
            </p>
          </section>

          <section>
            <h2 className="font-display text-[1.15rem] font-semibold text-charcoal mb-3">Community Content</h2>
            <p className="text-text-mid text-[0.95rem] leading-[1.85]">
              The views, opinions, and experiences shared by community members in posts, circles, and comments are those of the individual authors and do not represent the views of letsthinkpositive.com. We moderate content for safety and community standards but cannot verify the accuracy or reliability of user-generated content.
            </p>
          </section>

          <section>
            <h2 className="font-display text-[1.15rem] font-semibold text-charcoal mb-3">External Links & Resources</h2>
            <p className="text-text-mid text-[0.95rem] leading-[1.85]">
              This Platform may contain links to external websites or resources. We are not responsible for the content, accuracy, or privacy practices of any third-party sites. Linking to an external resource does not imply endorsement.
            </p>
          </section>

          <section>
            <h2 className="font-display text-[1.15rem] font-semibold text-charcoal mb-3">Limitation of Liability</h2>
            <p className="text-text-mid text-[0.95rem] leading-[1.85]">
              To the fullest extent permitted by law, letsthinkpositive.com, its founders, contributors, and staff accept no liability for any direct, indirect, incidental, or consequential harm arising from your use of the Platform, its content, or its AI features. Your use of the Platform is entirely at your own risk.
            </p>
          </section>

          <section>
            <h2 className="font-display text-[1.15rem] font-semibold text-charcoal mb-3">Contact</h2>
            <p className="text-text-mid text-[0.95rem] leading-[1.85]">
              If you have any questions about this disclaimer, or if you have concerns about any content on the Platform, please contact us at <a href="mailto:hello@letsthinkpositive.com" className="text-teal-deep hover:underline">hello@letsthinkpositive.com</a>.
            </p>
          </section>
        </div>

        <div className="mt-14 pt-8 border-t border-teal-light flex flex-col sm:flex-row gap-4 text-[0.85rem] text-text-xlight">
          <Link href="/privacy" className="hover:text-teal-deep transition-colors no-underline">Privacy Policy</Link>
          <Link href="/terms"   className="hover:text-teal-deep transition-colors no-underline">Terms &amp; Conditions</Link>
          <Link href="/contact" className="hover:text-teal-deep transition-colors no-underline">Contact Us</Link>
        </div>
      </article>
    </>
  )
}
