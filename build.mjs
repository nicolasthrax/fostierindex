// Builds the static site into ./site from src/template.html + src/i18n.mjs.
// Usage: node build.mjs   (no dependencies)
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { locales } from './src/i18n.mjs';

const root = dirname(fileURLToPath(import.meta.url));

// ---- Site settings ----------------------------------------------------------
const SITE = {
  origin: 'https://fostierindex.com',
  // Consultation requests open a pre-filled email to this address.
  email: 'nicolas@fostierindex.com',
};
// -----------------------------------------------------------------------------

const year = new Date().getFullYear();
const order = ['en', 'zh-hant'];

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const render = (tpl, vars) =>
  tpl
    .replace(/\{\{\{\s*([\w.]+)\s*\}\}\}/g, (_, k) => {
      if (!(k in vars)) throw new Error(`Missing raw key: ${k}`);
      return vars[k];
    })
    .replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, k) => {
      if (!(k in vars)) throw new Error(`Missing key: ${k}`);
      return esc(vars[k]);
    });

const page = readFileSync(join(root, 'src/template.html'), 'utf8');
const notFound = readFileSync(join(root, 'src/404.html'), 'utf8');

const alternates = [
  ...order.map((id) => `<link rel="alternate" hreflang="${locales[id].hreflang}" href="${SITE.origin}${locales[id].path}">`),
  `<link rel="alternate" hreflang="x-default" href="${SITE.origin}/">`,
].join('\n');

for (const id of order) {
  const L = locales[id];
  const depth = L.path.split('/').filter(Boolean).length;
  const base = depth ? '../'.repeat(depth) : '';
  const canonical = SITE.origin + L.path;

  const langLinks = order
    .map((o) => {
      const t = locales[o];
      const href = base + t.path.replace(/^\//, '') || './';
      const cur = o === id ? ' aria-current="page"' : '';
      return `<a href="${href}" hreflang="${t.hreflang}" lang="${t.htmlLang}" aria-label="${esc(t.langName)}"${cur}>${t.langShort}</a>`;
    })
    .join('');

  const industries = L.industries
    .map((name) => `<option value="${esc(name)}">${esc(name)}</option>`)
    .join('');

  // "From" prices, matching what the page shows.
  const offer = (name, min, monthly) => ({
    '@type': 'Offer',
    itemOffered: { '@type': 'Service', name },
    priceSpecification: {
      '@type': monthly ? 'UnitPriceSpecification' : 'PriceSpecification',
      priceCurrency: 'HKD',
      minPrice: min,
      ...(monthly ? { unitCode: 'MON' } : {}),
    },
  });

  const jsonld = JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ProfessionalService',
        '@id': `${SITE.origin}/#org`,
        name: 'Fostier Index',
        url: `${SITE.origin}/`,
        email: SITE.email,
        image: `${SITE.origin}/assets/og.png`,
        description: L['meta.description'],
        address: { '@type': 'PostalAddress', addressLocality: 'Hong Kong', addressCountry: 'HK' },
        areaServed: { '@type': 'City', name: 'Hong Kong' },
        availableLanguage: ['en', 'zh-Hant'],
        knowsAbout: ['Search engine optimization', 'Answer engine optimization', 'Generative engine optimization'],
        makesOffer: [
          offer(L['svc.diag'], 1500),
          offer(L['svc.rebuild'], 12000),
          offer(L['svc.retainer'], 6000, true),
        ],
      },
      {
        '@type': 'WebPage',
        '@id': `${canonical}#page`,
        url: canonical,
        name: L['meta.title'],
        inLanguage: L.htmlLang,
        about: { '@id': `${SITE.origin}/#org` },
      },
    ],
  }).replace(/</g, '\\u003c');

  const vars = {
    ...L,
    ...SITE,
    base,
    year,
    canonical,
    home: base || './',
    alternates,
    langLinks,
    industries,
    jsonld,
  };

  const outDir = join(root, 'site', L.path);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'index.html'), render(page, vars));
  if (id === 'en') {
    writeFileSync(join(root, 'site', '404.html'), render(notFound, { ...vars, base: '/', home: '/' }));
  }
}

// sitemap.xml with hreflang alternates
const xhtml = order
  .map((o) => `    <xhtml:link rel="alternate" hreflang="${locales[o].hreflang}" href="${SITE.origin}${locales[o].path}"/>`)
  .join('\n');
const urls = order
  .map(
    (id) => `  <url>\n    <loc>${SITE.origin}${locales[id].path}</loc>\n${xhtml}\n    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE.origin}/"/>\n  </url>`
  )
  .join('\n');
writeFileSync(
  join(root, 'site', 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`
);
writeFileSync(join(root, 'site', 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE.origin}/sitemap.xml\n`);

console.log(`Built ${order.length} pages + 404, sitemap.xml, robots.txt into ./site`);
