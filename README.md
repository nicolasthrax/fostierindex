# Fostier Index website

Static, trilingual (EN / 繁中 / FR) marketing site for Fostier Index. No framework and no dependencies, so it deploys on Cloudflare Pages for free.

```
src/template.html   page markup (one template for all languages)
src/i18n.mjs        all copy, per language
src/404.html        not-found page
site/assets/        styles.css, main.js (hero animation + before/after demo), favicon, og.png
build.mjs           writes site/index.html, site/zh-hant/, site/fr/, 404, sitemap.xml, robots.txt
```

## Before going live

Open `build.mjs` and fill in the `SITE` block:

- `whatsapp`: your number, digits only with country code (e.g. `85291234567`). The WhatsApp button stays hidden until this is set.
- `proofUrl`: the Fostier Consulting URL. The case-study link stays hidden until this is set.
- `bookingUrl` (optional): a Cal.com or Calendly link. Without one, "Book a call" opens an email to `hello@fostierindex.com`.

Then run `node build.mjs` and commit the regenerated `site/` folder.

## Edit copy

Change text in `src/i18n.mjs` (same key in all three languages), then run `node build.mjs`.

## Preview locally

```bash
node build.mjs
```

```bash
cd site && python3 -m http.server 8000
```

Open http://localhost:8000.

## Deploy on Cloudflare Pages

Connect this repository in Cloudflare Pages with:

- Framework preset: None
- Build command: `node build.mjs`
- Build output directory: `site`

Add `fostierindex.com` as the custom domain.
