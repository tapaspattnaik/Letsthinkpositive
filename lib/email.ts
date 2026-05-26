import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST   ?? 'mail.letsthinkpositive.com',
  port:   parseInt(process.env.SMTP_PORT ?? '465', 10),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
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
      <div style="font-family:sans-serif;max-width:600px">
        <h2 style="color:#1A6B6B">New message from letsthinkpositive.com</h2>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Subject:</strong> ${data.subject}</p>
        <hr/>
        <p style="white-space:pre-wrap">${data.message}</p>
      </div>
    `,
  })
}
