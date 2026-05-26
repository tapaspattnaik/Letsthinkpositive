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
