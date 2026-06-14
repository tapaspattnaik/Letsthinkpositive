import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  alternates: { canonical: '/privacy' },
  title: 'Privacy Policy',
  description: 'How letsthinkpositive.com collects, uses, and protects your personal information.',
}

const sections = [
  {
    title: '1. Information We Collect',
    body: `When you create an account, we collect your name, email address, and optionally a phone number, profile photo, and short bio. When you use features like the Gratitude Journal, Challenges, or Community, we store the content you choose to share. We also collect standard server logs (IP address, browser type, pages visited) for security and performance purposes.`,
  },
  {
    title: '2. How We Use Your Information',
    body: `We use your information to: provide and improve the platform and its features; personalise your experience (e.g. mood-based coach responses, challenge progress); send you transactional emails (welcome, password reset, challenge completions); notify you of community activity you have opted into; and maintain the safety and integrity of the community through moderation.`,
  },
  {
    title: '3. What We Do Not Do',
    body: `We do not sell, rent, or trade your personal information to any third party. We do not serve behavioural advertising. We do not share your data with external analytics companies beyond what is necessary for the platform to function.`,
  },
  {
    title: '4. Cookies',
    body: `We use session cookies to keep you logged in and to remember your preferences. We do not use third-party tracking cookies. You may disable cookies in your browser, but some features (such as staying signed in) will not work without them.`,
  },
  {
    title: '5. Third-Party Services',
    body: `We use the following third-party services, each governed by their own privacy policy: Together AI (for Bit and Calm Coach AI responses — messages are processed but not retained by us beyond the session); Google OAuth (if you choose to sign in with Google); and Hostinger (our hosting provider, which processes server traffic under its own terms).`,
  },
  {
    title: '6. Data Retention',
    body: `Your account data is retained for as long as your account is active. Journal entries, community posts, and challenge progress are stored as long as your account exists. You may request deletion of your account and associated data by emailing hello@letsthinkpositive.com. We will process your request within 14 days.`,
  },
  {
    title: '7. Children\'s Privacy',
    body: `The Kids Zone section is designed for children to use under parental supervision. We do not knowingly collect personal information from children under 13. The Kids Zone does not require account creation. If you believe a child has provided us with personal data, please contact us immediately.`,
  },
  {
    title: '8. Security',
    body: `We take security seriously. Passwords are hashed using bcrypt and never stored in plain text. All data is transmitted over HTTPS. Access to the database is restricted and monitored. However, no system is 100% secure, and we encourage you to use a strong, unique password.`,
  },
  {
    title: '9. Your Rights',
    body: `You have the right to: access the personal data we hold about you; correct inaccurate information through your profile settings; request deletion of your account and data; withdraw consent for optional communications (e.g. unsubscribe from emails). To exercise any of these rights, email hello@letsthinkpositive.com.`,
  },
  {
    title: '10. Changes to This Policy',
    body: `We may update this Privacy Policy from time to time. We will notify registered users of material changes via email. Continued use of the platform after changes are posted constitutes your acceptance of the updated policy.`,
  },
  {
    title: '11. Contact',
    body: `For any privacy-related questions or requests, please contact: Tapas Pattanaik · hello@letsthinkpositive.com · letsthinkpositive.com`,
  },
]

export default function PrivacyPage() {
  return (
    <>
      <section className="bg-gradient-to-br from-teal-deep to-teal-dark py-16 px-[5%] text-white text-center">
        <h1 className="font-display text-[clamp(2rem,3.5vw,2.8rem)] font-bold mb-3">Privacy Policy</h1>
        <p className="text-white/70 text-[1rem]">Last updated: January 2026</p>
      </section>

      <article className="max-w-[760px] mx-auto py-16 px-[5%]">
        <p className="text-text-mid text-[1rem] leading-[1.9] mb-10">
          At <strong className="text-teal-deep">letsthinkpositive.com</strong>, your privacy matters deeply to us.
          This policy explains in plain English what information we collect, why we collect it, and how we protect it.
        </p>

        <div className="space-y-10">
          {sections.map(s => (
            <section key={s.title}>
              <h2 className="font-display text-[1.15rem] font-semibold text-charcoal mb-3">{s.title}</h2>
              <p className="text-text-mid text-[0.95rem] leading-[1.85]">{s.body}</p>
            </section>
          ))}
        </div>

        <div className="mt-14 pt-8 border-t border-teal-light flex flex-col sm:flex-row gap-4 text-[0.85rem] text-text-xlight">
          <Link href="/terms"      className="hover:text-teal-deep transition-colors no-underline">Terms &amp; Conditions</Link>
          <Link href="/disclaimer" className="hover:text-teal-deep transition-colors no-underline">Disclaimer</Link>
          <Link href="/contact"    className="hover:text-teal-deep transition-colors no-underline">Contact Us</Link>
        </div>
      </article>
    </>
  )
}
