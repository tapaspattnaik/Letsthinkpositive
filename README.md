# letsthinkpositive.com — Full Website
**"where every thought begins with hope"**

---

## File Structure

```
letsthinkpositive_full/
├── index.html          ← All 10 pages (SPA — single file)
├── css/
│   └── style.css       ← Complete styles for all pages
├── js/
│   └── main.js         ← Navigation, quotes, forms, animations
├── images/
│   └── favicon.svg     ← Browser tab icon
└── README.md           ← This file
```

---

## Pages Included

1. **Home** — Hero, mission, pillars, latest posts, newsletter
2. **About** — Tapas's story, SuperbMan philosophy, vision & mission
3. **Positive Thinking** — 9 articles with category filter (Mindset, Negativity, Gratitude, Confidence, Habits)
4. **Daily Inspiration** — Featured quote, 6 affirmations, 3 motivational stories
5. **Spiritual Wisdom** — Bhagavad Gita verses, Hindu philosophy tabs, meditation guide
6. **Videos / YouTube** — Channel section, 6 video cards
7. **Resources** — Books, meditation guides, habit trackers
8. **Community** — 30-Day Challenge, reader contributions, story submission
9. **Blog** — 5 posts with sidebar, tags, subscribe widget
10. **Contact** — Full form, contact methods, social links

---

## How to Upload via FileZilla

### Step 1 — Connect to Hostinger
1. Open FileZilla → File > Site Manager > New Site
2. Host: your Hostinger FTP hostname (from hPanel → Hosting → FTP Accounts)
3. Protocol: FTP | Encryption: Explicit FTP over TLS
4. Logon: Normal | Enter your FTP username and password
5. Click Connect

### Step 2 — Navigate on the server
In the right panel, navigate to: `/public_html/`

### Step 3 — IMPORTANT: Replace the old landing page
Before uploading, DELETE the old files in `/public_html/`:
- Delete the old `index.html`
- Delete the old `css/` folder
- Delete the old `js/` folder

### Step 4 — Upload the new files
Drag and drop from your computer's left panel into `/public_html/`:
- `index.html`
- `css/` folder
- `js/` folder
- `images/` folder (if not already there)

### Step 5 — Verify
Visit https://letsthinkpositive.com — the full 10-page site will load.

---

## Customisation Notes

### Connect the newsletter form to Brevo
In `js/main.js`, find the `TODO` comment inside the form handler and replace with a Brevo API fetch call.

### Add real YouTube videos
In `index.html`, on the Videos page, replace the `.video-thumb` divs with actual YouTube embed iframes:
```html
<iframe src="https://www.youtube.com/embed/VIDEO_ID" allowfullscreen></iframe>
```

### Add your photo (About page)
Replace the 🧘 emoji in `.about-photo` with:
```html
<img src="images/tapas.jpg" alt="Tapas Pattanaik" style="width:100%;height:100%;object-fit:cover">
```

### Update social links
Search for `youtube.com/@letsthinkpositive`, `instagram.com/letsthinkpositive`, and `linkedin.com/in/tapaspattanaik` and replace with your real URLs.

---

*letsthinkpositive.com · Full Website · Built with purpose · 2026*
