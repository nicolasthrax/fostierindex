# Fostier Index — Dark Prism Redesign Spec

Replaces the porcelain/Bodoni/orbit design (PR nicolasthrax/fostierindex#1), which the owner rejected as too soft, too decorative, generic and wrong in type.

## Direction

- **Mood:** dark, cinematic luxury.
- **Accent:** jade green on a deep green-black ground. No pastel.
- **Type:** one big modern sans for headlines and text (Host Grotesk), Noto Sans TC for Chinese.
- **Graphics:** interactive WebGL 3D (Three.js), self-hosted.
- **Logo:** none yet. Use the wordmark "Fostier Index" set in the site typeface. The owner will design a logo later in Claude Design, based on this redesign.

## Languages

- Bilingual only: English at `/`, Traditional Chinese at `/zh-hant/`. French is dropped.
- Language switcher: EN / 繁.

## The 3D object: obsidian prism

- A dark, glossy glass prism (a monolith). It catches studio light and turns slowly toward the pointer.
- **Before/After demo merged into the 3D:** many faint rays (the web's sources) enter the prism. One jade beam exits and lands on a floating citation label, "[1] Your firm". A query label ("Best immigration advisor in Hong Kong?") sits where the rays enter.
- **Scroll:** the prism stays fixed behind the page. The camera orbits and the light changes per scene as the visitor scrolls.
- **Phones:** the same prism, live but lighter (lower DPR, fewer particles and effects). Interactive by touch.
- **Reduced motion:** a still frame.

## Page: short and cinematic (each scene full screen)

1. **Hero:** the headline "Get cited." (獲 AI 引用), one line of support, and a CTA to the consultation request.
2. **Services, with "from" prices only:**
   - Diagnostic from HK$1,500, credited toward a rebuild.
   - Rebuild from HK$12,000.
   - Authority retainer from HK$6,000 a month.
3. **Consultation request**, framed as a free AI visibility consultation:
   - Fields: firm name, website, industry (law, medical/dental, wealth/immigration, B2B consulting, property/luxury, other).
   - Submitting opens a pre-filled email to **nicolas@fostierindex.com**. There is no form backend.
4. **Footer:** wordmark, Hong Kong, ©, EN / 繁. One-line promise: we guarantee the build, never rankings or AI citations.

## Left out for now

- The Fostier Consulting case study, until before/after metrics exist.
- How-it-works steps, the industries scene and a separate honest-promise scene (the promise lives in the footer).
- The trilingual type band and the French pages.

## Kept from v1

- The static build (`node build.mjs` renders `src/template.html` + `src/i18n.mjs` into `site/`). Cloudflare Pages: no framework, output `site`.
- hreflang, JSON-LD, sitemap, robots and 404, updated for two languages.

## Process

The owner sees a screenshot of the hero first. The rest of the page is built only after they approve it.

- **Status:** hero approved. Services, consultation, footer, scroll views, the 404 page and the share image are built.
