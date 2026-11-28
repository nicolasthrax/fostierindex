# Fostier Index website

Bilingual (English / Traditional Chinese) site for Fostier Index: dark green-black and jade, with an interactive field of fine jade dust (Three.js, self-hosted) that stays behind the page and gathers into a new form for each scene as you scroll. It's a static site with no build dependencies and deploys free on Cloudflare Pages.

```
src/template.html      page markup (one template for both languages)
src/i18n.mjs           all copy, per language
src/404.html           not-found page
site/assets/field.js   the 3D scene: particle field, service forms, the final point, scroll states
site/assets/consult.js consultation form -> pre-filled email
site/assets/           styles.css, three.min.js (r149), favicon, og.png
build.mjs              writes site/index.html, site/zh-hant/, 404, sitemap.xml, robots.txt
.plans/                design specs (particle-field-spec.md is current)
```

## Edit copy or prices

Change the text in `src/i18n.mjs`, using the same key in both languages. Then run:

```bash
node build.mjs
```

## Consultation requests

The form doesn't send anything itself. It opens the visitor's email app with a pre-filled request to `contact@fostierindex.com`. To change the address, edit `SITE.email` in `build.mjs` and rebuild.

## Preview locally

```bash
node build.mjs
```

```bash
cd site && python3 -m http.server 8000
```

Open http://localhost:8000. The 3D view needs WebGL; without it, the page falls back to a jade glow.

## Deploy on Cloudflare Pages

- Framework preset: None
- Build command: `node build.mjs`
- Build output directory: `site`

Add `fostierindex.com` as the custom domain.
