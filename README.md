# letsthinkpositive.com

> *where every thought begins with hope*

A full-stack wellness platform built with Next.js 14, Tailwind CSS, and Together AI.

## Features

- **Home** — daily rotating quote, 4 pillars, SuperbMan philosophy
- **Blog** — community stories and articles
- **Gratitude Journal** — private daily journaling with mood tracking (localStorage)
- **Keep Calm Sounds** — layered ambient soundscapes with breathing guides
- **Bit Advisor** — AI wellness companion powered by Together AI (Llama 3.3)
- **Contact** — form with Hostinger SMTP email delivery

## Tech Stack

| Layer      | Tech                          |
|------------|-------------------------------|
| Framework  | Next.js 14 (App Router)       |
| Styling    | Tailwind CSS                  |
| AI         | Together AI — Llama 3.3 70B   |
| Email      | Nodemailer + Hostinger SMTP   |
| Hosting    | Hostinger (Node.js app)       |
| Repo       | GitHub                        |

## Getting Started

```bash
npm install
cp .env.example .env.local
# fill in .env.local with your keys
npm run dev
```

## Environment Variables

See `.env.example` for all required variables.

## Deployment (Hostinger)

1. Connect this GitHub repo in Hostinger hPanel → Node.js
2. Set startup file: `server.js`
3. Set Node.js version: 18 or 20
4. Add environment variables in hPanel
5. Run: `npm install && npm run build`

## Adding Sounds

Upload `.mp3` files to `public/sounds/`:
- `rain.mp3`, `forest.mp3`, `ocean.mp3`, `bowls.mp3`
- `fire.mp3`, `wind.mp3`, `birds.mp3`, `binaural.mp3`

Free sources: freesound.org, pixabay.com/music
