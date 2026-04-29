# letsthinkpositive.com — Landing Page
**"where every thought begins with hope"**

---

## Files in this package

```
letsthinkpositive/
├── index.html          ← Main landing page (upload to root)
├── css/
│   └── style.css       ← All styles — brand colours, layout, animations
├── js/
│   └── main.js         ← Quote rotation, form validation, scroll effects
├── images/
│   └── favicon.svg     ← Browser tab icon (SVG, works in all modern browsers)
└── README.md           ← This file
```

---

## How to upload via FileZilla

### Step 1 — Connect to Hostinger
1. Open FileZilla
2. Go to **File > Site Manager > New Site**
3. Fill in:
   - **Host:** your Hostinger FTP hostname (find in hPanel > Hosting > FTP Accounts)
   - **Protocol:** FTP – File Transfer Protocol
   - **Encryption:** Use explicit FTP over TLS if available
   - **Logon Type:** Normal
   - **User:** your FTP username (from hPanel)
   - **Password:** your FTP password
4. Click **Connect**

### Step 2 — Navigate to the right folder
In the **right panel** (remote server), navigate to:
```
/public_html/
```
This is your website's root directory.

### Step 3 — Upload the files
Drag and drop these items from the **left panel** (your computer) into `/public_html/`:
- `index.html`
- `css/` folder
- `js/` folder
- `images/` folder

**Important:** Upload the FILES and FOLDERS — not the `letsthinkpositive/` wrapper folder itself.

### Step 4 — Verify
Visit `https://letsthinkpositive.com` in your browser. You should see the landing page.

---

## Customisation notes

### Change the email capture
The form currently logs the email to the console. To connect it to **Brevo (Sendinblue)**:
1. Create a Brevo account and get your API key
2. In `js/main.js`, find the `TODO` comment and replace with a `fetch()` call to the Brevo contacts API

### Change the quote
The quote rotates daily from the array in `js/main.js`. Edit the `quotes` array to add/remove quotes anytime.

### Update social links
In `index.html`, update the `<a href="...">` links in the footer with your real YouTube, Instagram, and LinkedIn URLs.

### Add a real favicon PNG
For older browser support, export a 32×32 PNG from the logo and save as `images/favicon-32.png`.

---

*letsthinkpositive.com · Built with purpose by Tapas Pattanaik · 2025*
