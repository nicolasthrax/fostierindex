# Fostier Index website

Bilingual (English / Traditional Chinese) site for Fostier Index: dark green-black and jade, with an interactive field of fine jade dust (Three.js, self-hosted) that stays behind the page and gathers into a new form for each scene as you scroll. It's a static site with no build dependencies and deploys free on Cloudflare Pages.

```
src/template.html      home page markup (one template for both languages)
src/guide.html         guide page markup; its body text is in src/content/guide.<lang>.html
src/partials/          shared <head>, header and footer
src/i18n.mjs           all copy, per language, including the definitions, method and FAQ
src/_headers           security and cache headers, copied to site/_headers
src/404.html           not-found page
scripts/indexnow.mjs   pings IndexNow (Bing and others) after a deploy
wrangler.jsonc         Cloudflare Workers config: serves ./site
site/assets/field.js   the 3D scene: particle field, service forms, the final point, scroll states
site/assets/consult.js consultation form -> pre-filled email
site/assets/           styles.css, three.min.js (r149), favicon, og.png
build.mjs              writes the pages, 404, JSON-LD, sitemap.xml, robots.txt, llms.txt and _headers
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

## AEO notes

- `node build.mjs` also writes the JSON-LD (organisation, services, FAQ, definitions, guide article), `robots.txt` with AI-crawler groups and a Content-Signal line, `llms.txt`, and `sitemap.xml` with `lastmod` from git.
- Profiles, phone number and founder details are placeholders in `SITE` at the top of `build.mjs`. Fill them in there and rebuild; nothing is published until then.
- Keep exactly three `[data-scene]` sections and three `.menu li` rows on the home page: `site/assets/field.js` maps its particle scenes to them. New home-page content goes in the `.read` block, which has no `data-scene`.
- Assets are cached for a year and referenced with a content hash (`?v=`), so a rebuild is enough to bust caches.
- After a production deploy, run `node scripts/indexnow.mjs` to tell Bing and other IndexNow engines what changed.
