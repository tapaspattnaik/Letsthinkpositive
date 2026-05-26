import nodemailer from 'nodemailer'

const port   = parseInt(process.env.SMTP_PORT ?? '465', 10)
const secure = process.env.SMTP_SECURE !== 'false' && port !== 587

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST ?? 'smtp.hostinger.com',
  port,
  secure,   // true = SSL on 465, false = STARTTLS on 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    // allow self-signed certs on Hostinger shared hosting
    rejectUnauthorized: false,
  },
})

export interface ContactPayload {
  name:    string
  email:   string
  subject: string
  message: string
}

export async function sendWelcomeEmail({ email, name }: { email: string; name: string }) {
  return transporter.sendMail({
    from:    `"letsthinkpositive.com" <${process.env.SMTP_USER}>`,
    to:      email,
    subject: `Welcome to letsthinkpositive — your daily thought starts tomorrow ☀️`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;color:#2E4A4A">
        <h2 style="color:#1A6B6B;border-bottom:2px solid #E8A020;padding-bottom:8px">
          Hello ${name} 🌿
        </h2>
        <p style="font-size:1.05rem;line-height:1.8">
          Welcome to <strong>letsthinkpositive.com</strong> — where every thought begins with hope.
        </p>
        <p style="line-height:1.8">
          Starting tomorrow morning, you'll receive one carefully chosen thought delivered quietly to your inbox.
          No noise. No spam. Just one idea to carry with you into your day.
        </p>
        <blockquote style="border-left:4px solid #E8A020;padding:12px 20px;background:#EEF7F6;border-radius:0 8px 8px 0;margin:24px 0">
          <em style="color:#1A6B6B;font-size:1.1rem">"Positivity practised together is the most contagious force on earth."</em><br/>
          <span style="font-size:0.85rem;color:#4A6565">— Tapas Pattanaik</span>
        </blockquote>
        <p style="line-height:1.8">
          While you wait — explore the site. The <a href="${process.env.NEXT_PUBLIC_SITE_URL}/advisor" style="color:#2D9B8A">Bit Advisor</a> is ready to listen,
          the <a href="${process.env.NEXT_PUBLIC_SITE_URL}/journal" style="color:#2D9B8A">Gratitude Journal</a> is open, and the
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/sounds" style="color:#2D9B8A">Keep Calm Sounds</a> are there whenever you need a moment of peace.
        </p>
        <p style="color:#7A9898;font-size:0.85rem;margin-top:24px">
          You can unsubscribe at any time by replying to any email with "unsubscribe".<br/>
          — Tapas &amp; the letsthinkpositive team
        </p>
      </div>
    `,
  })
}

export async function sendContactEmail(data: ContactPayload) {
  return transporter.sendMail({
    from:    `"letsthinkpositive.com" <${process.env.SMTP_USER}>`,
    to:      process.env.CONTACT_TO ?? process.env.SMTP_USER,
    replyTo: data.email,
    subject: `[LTP Contact] ${data.subject} — from ${data.name}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;color:#2E4A4A">
        <h2 style="color:#1A6B6B;border-bottom:2px solid #E8A020;padding-bottom:8px">
          New message from letsthinkpositive.com
        </h2>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
        <p><strong>Subject:</strong> ${data.subject}</p>
        <hr style="border:none;border-top:1px solid #A8D8D0;margin:16px 0"/>
        <p style="white-space:pre-wrap;line-height:1.8">${data.message}</p>
        <p style="font-size:0.8rem;color:#7A9898;margin-top:24px">
          — letsthinkpositive.com · where every thought begins with hope
        </p>
      </div>
    `,
  })
}
