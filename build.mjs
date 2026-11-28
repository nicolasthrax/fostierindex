// Builds the static site into ./site from src/ (templates, partials, copy in src/i18n.mjs).
// Usage: node build.mjs   (no dependencies)
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { locales } from './src/i18n.mjs';

const root = dirname(fileURLToPath(import.meta.url));

// ---- Site settings ----------------------------------------------------------
const SITE = {
  origin: 'https://fostierindex.com',
  // Consultation requests open a pre-filled email to this address.
  email: 'contact@fostierindex.com',
  // Leave null until there's a public business number. It's added to the schema when set.
  telephone: null, // e.g. '+852 XXXX XXXX'
  // Official profiles of the firm, used as schema.org sameAs. Add each URL once it exists:
  // LinkedIn company page, Google Business Profile (maps link), Wikidata item, Crunchbase,
  // Facebook / Instagram / YouTube, and HK directory listings that have a stable profile URL.
  sameAs: [],
  // Founder or lead expert, published only with the owner's approval. Example shape:
  // { name: '...', jobTitle: '...', url: 'https://fostierindex.com/about/', sameAs: ['https://www.linkedin.com/in/...'] }
  founder: null,
  foundingDate: null, // e.g. '2026'
  // IndexNow key (public by design): served at /<key>.txt and used by scripts/indexnow.mjs.
  indexNowKey: '96b802fd5fe54a224e659a05c0ec8138',
  guidePublished: '2026-11-28',
};
// -----------------------------------------------------------------------------

const year = new Date().getFullYear();
const order = ['en', 'zh-hant'];
const read = (p) => readFileSync(join(root, p), 'utf8');

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

// Drops undefined/null/empty-array values so optional placeholders never reach the JSON-LD.
const clean = (o) => {
  if (Array.isArray(o)) return o.map(clean);
  if (o && typeof o === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(o)) {
      if (v === undefined || v === null || (Array.isArray(v) && !v.length)) continue;
      out[k] = clean(v);
    }
    return out;
  }
  return o;
};

// Last commit date touching the given sources (falls back to now, e.g. outside git).
const lastModified = (files) => {
  try {
    const out = execFileSync('git', ['log', '-1', '--format=%cI', '--', ...files], { cwd: root, encoding: 'utf8' }).trim();
    if (out) return new Date(out);
  } catch {}
  return new Date();
};
// A date with uncommitted source changes is "now": the build output is newer than the last commit.
const dirty = (files) => {
  try {
    return execFileSync('git', ['status', '--porcelain', '--', ...files], { cwd: root, encoding: 'utf8' }).trim() !== '';
  } catch {
    return false;
  }
};
const modifiedOf = (files) => (dirty(files) ? new Date() : lastModified(files));
const isoDate = (d) => d.toISOString().slice(0, 10);

// Cache-busting: assets are served with a one-year immutable cache (see _headers),
// so every reference carries a content hash.
const assetDir = join(root, 'site/assets');
const hashes = Object.fromEntries(
  readdirSync(assetDir).map((f) => [f, createHash('sha256').update(readFileSync(join(assetDir, f))).digest('hex').slice(0, 10)])
);
const asset = (f) => {
  if (!hashes[f]) throw new Error(`Missing asset: ${f}`);
  return `/assets/${f}?v=${hashes[f]}`;
};
const assets = {
  'asset.favicon': asset('favicon.svg'),
  'asset.styles': asset('styles.css'),
  'asset.three': asset('three.min.js'),
  'asset.field': asset('field.js'),
  'asset.consult': asset('consult.js'),
};

const partials = {
  head: read('src/partials/head.html'),
  header: read('src/partials/header.html'),
  footer: read('src/partials/footer.html'),
};

// ---- Pages ------------------------------------------------------------------
const PAGES = {
  home: {
    template: 'src/template.html',
    path: (L) => L.path,
    sources: (id) => ['src/template.html', 'src/i18n.mjs', 'src/partials'],
    ogType: 'website',
    title: (L) => L['meta.title'],
    description: (L) => L['meta.description'],
  },
  guide: {
    template: 'src/guide.html',
    path: (L) => L.path + L['guide.slug'],
    sources: (id) => ['src/guide.html', `src/content/guide.${id}.html`, 'src/i18n.mjs', 'src/partials'],
    ogType: 'article',
    title: (L) => L['guide.metaTitle'],
    description: (L) => L['guide.metaDescription'],
  },
};
const pageKeys = Object.keys(PAGES);
const url = (key, id) => SITE.origin + PAGES[key].path(locales[id]);
const modified = Object.fromEntries(
  pageKeys.flatMap((key) => order.map((id) => [`${key}:${id}`, modifiedOf(PAGES[key].sources(id))]))
);

// ---- Structured data --------------------------------------------------------
const ORG = `${SITE.origin}/#org`;
const WEBSITE = `${SITE.origin}/#website`;
const HK = { '@type': 'AdministrativeArea', name: 'Hong Kong', sameAs: 'https://www.wikidata.org/wiki/Q8646' };
const LANGS = [
  { '@type': 'Language', name: 'English', alternateName: 'en' },
  { '@type': 'Language', name: 'Chinese (Traditional, Hong Kong)', alternateName: 'zh-Hant-HK' },
];

const services = (L) => [
  { key: 'diagnostic', name: L['svc.diag'], desc: L['s1.desc'], min: 1500, type: 'AEO and GEO audit' },
  { key: 'rebuild', name: L['svc.rebuild'], desc: L['s2.desc'], min: 12000, type: 'Website redesign for SEO, AEO and GEO' },
  { key: 'authority', name: L['svc.retainer'], desc: L['s3.desc'], min: 6000, monthly: true, type: 'Authority building and GEO retainer' },
].map((s) => ({ ...s, id: `${SITE.origin}/#service-${s.key}` }));

const priceSpec = (s) => ({
  '@type': s.monthly ? 'UnitPriceSpecification' : 'PriceSpecification',
  priceCurrency: 'HKD',
  minPrice: s.min,
  ...(s.monthly ? { unitCode: 'MON', referenceQuantity: { '@type': 'QuantitativeValue', value: 1, unitCode: 'MON' } } : {}),
});

const orgNode = (L, homeUrl) => ({
  '@type': 'ProfessionalService',
  '@id': ORG,
  name: 'Fostier Index',
  url: `${SITE.origin}/`,
  logo: { '@type': 'ImageObject', '@id': `${SITE.origin}/#logo`, url: `${SITE.origin}/assets/logo.png`, contentUrl: `${SITE.origin}/assets/logo.png`, width: 512, height: 512, caption: 'Fostier Index' },
  image: `${SITE.origin}/assets/og.png`,
  description: L['meta.description'],
  slogan: L['hero.title'],
  email: SITE.email,
  telephone: SITE.telephone,
  address: { '@type': 'PostalAddress', addressLocality: 'Hong Kong', addressCountry: 'HK' },
  areaServed: HK,
  availableLanguage: LANGS,
  contactPoint: [
    {
      '@type': 'ContactPoint',
      contactType: 'sales',
      email: SITE.email,
      telephone: SITE.telephone,
      url: `${homeUrl}#consult`,
      areaServed: 'HK',
      availableLanguage: ['English', 'Chinese'],
    },
  ],
  sameAs: SITE.sameAs.filter(Boolean),
  founder: SITE.founder ? { '@type': 'Person', ...SITE.founder } : null,
  foundingDate: SITE.foundingDate,
  knowsAbout: ['Search engine optimization', 'Answer engine optimization', 'Generative engine optimization', 'Structured data', 'International SEO'],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: L['svc.title'],
    itemListElement: services(L).map((s) => ({
      '@type': 'Offer',
      itemOffered: { '@id': s.id },
      priceSpecification: priceSpec(s),
      url: `${homeUrl}#services`,
    })),
  },
});

const serviceNodes = (L) =>
  services(L).map((s) => ({
    '@type': 'Service',
    '@id': s.id,
    name: s.name,
    description: s.desc,
    serviceType: s.type,
    provider: { '@id': ORG },
    areaServed: HK,
    availableLanguage: LANGS,
    offers: { '@type': 'Offer', priceSpecification: priceSpec(s) },
  }));

const websiteNode = () => ({
  '@type': 'WebSite',
  '@id': WEBSITE,
  url: `${SITE.origin}/`,
  name: 'Fostier Index',
  inLanguage: order.map((id) => locales[id].htmlLang),
  publisher: { '@id': ORG },
});

const webPageNode = (L, key, id, extra = {}) => {
  const canonical = url(key, id);
  return {
    '@type': 'WebPage',
    '@id': `${canonical}#page`,
    url: canonical,
    name: PAGES[key].title(L),
    description: PAGES[key].description(L),
    inLanguage: L.htmlLang,
    isPartOf: { '@id': WEBSITE },
    about: { '@id': ORG },
    primaryImageOfPage: { '@type': 'ImageObject', url: `${SITE.origin}/assets/og.png` },
    dateModified: isoDate(modified[`${key}:${id}`]),
    ...extra,
  };
};

const graphFor = (key, id) => {
  const L = locales[id];
  const canonical = url(key, id);
  const homeUrl = url('home', id);
  const base = [orgNode(L, homeUrl), websiteNode()];
  if (key === 'home') {
    return [
      ...base,
      ...serviceNodes(L),
      webPageNode(L, key, id, { hasPart: [{ '@id': `${canonical}#faq` }, { '@id': `${canonical}#definitions` }] }),
      {
        '@type': 'FAQPage',
        '@id': `${canonical}#faq`,
        url: `${canonical}#faq`,
        name: L['faq.title'],
        inLanguage: L.htmlLang,
        isPartOf: { '@id': `${canonical}#page` },
        mainEntity: L.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
      },
      {
        '@type': 'DefinedTermSet',
        '@id': `${canonical}#definitions`,
        name: L['def.title'],
        inLanguage: L.htmlLang,
        hasDefinedTerm: L.defs.map((d) => ({
          '@type': 'DefinedTerm',
          '@id': `${canonical}#term-${d.id}`,
          name: d.name,
          alternateName: d.id.toUpperCase(),
          description: d.text,
          inDefinedTermSet: { '@id': `${canonical}#definitions` },
        })),
      },
    ];
  }
  // Guide
  const author = SITE.founder ? { '@type': 'Person', ...SITE.founder, worksFor: { '@id': ORG } } : { '@id': ORG };
  return [
    ...base,
    webPageNode(L, key, id, { breadcrumb: { '@id': `${canonical}#breadcrumb` }, mainEntity: { '@id': `${canonical}#article` } }),
    {
      '@type': 'BreadcrumbList',
      '@id': `${canonical}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: L['nav.home'], item: homeUrl },
        { '@type': 'ListItem', position: 2, name: L['guide.crumb'], item: canonical },
      ],
    },
    {
      '@type': 'Article',
      '@id': `${canonical}#article`,
      headline: L['guide.h1'],
      description: L['guide.metaDescription'],
      inLanguage: L.htmlLang,
      image: `${SITE.origin}/assets/og.png`,
      datePublished: SITE.guidePublished,
      dateModified: isoDate(modified[`${key}:${id}`]),
      author,
      publisher: { '@id': ORG },
      mainEntityOfPage: { '@id': `${canonical}#page` },
      isPartOf: { '@id': WEBSITE },
      about: L.defs.map((d) => ({ '@type': 'Thing', name: d.name })),
    },
  ];
};

const jsonldFor = (key, id) =>
  JSON.stringify(clean({ '@context': 'https://schema.org', '@graph': graphFor(key, id) })).replace(/</g, '\\u003c');

// ---- HTML fragments ---------------------------------------------------------
const defsHtml = (L) =>
  L.defs.map((d) => `<div class="def" id="term-${d.id}"><dt>${esc(d.term)}</dt><dd>${esc(d.text)}</dd></div>`).join('');
const stepsHtml = (L) => L.steps.map((s) => `<li><h3>${esc(s.name)}</h3><p>${esc(s.text)}</p></li>`).join('');
const faqHtml = (L) =>
  L.faq.map((f, i) => `<div class="qa" id="faq-${i + 1}"><h3>${esc(f.q)}</h3><p>${esc(f.a)}</p></div>`).join('');

const dateText = (d, L) =>
  new Intl.DateTimeFormat(L.htmlLang === 'en' ? 'en-GB' : 'zh-Hant-HK', { dateStyle: 'long', timeZone: 'Asia/Hong_Kong' }).format(d);

// ---- Render -----------------------------------------------------------------
const outputs = [];
for (const key of pageKeys) {
  const tpl = read(PAGES[key].template);
  for (const id of order) {
    const L = locales[id];
    const canonical = url(key, id);
    const pagePath = PAGES[key].path(L);
    const alternates = [
      ...order.map((o) => `<link rel="alternate" hreflang="${locales[o].hreflang}" href="${url(key, o)}">`),
      `<link rel="alternate" hreflang="x-default" href="${url(key, 'en')}">`,
    ].join('\n');
    const langLinks = order
      .map((o) => {
        const t = locales[o];
        const cur = o === id ? ' aria-current="page"' : '';
        return `<a href="${PAGES[key].path(t)}" hreflang="${t.hreflang}" lang="${t.htmlLang}" aria-label="${esc(t.langName)}"${cur}>${t.langShort}</a>`;
      })
      .join('');
    const ogLocaleAlternates = order
      .filter((o) => o !== id)
      .map((o) => `<meta property="og:locale:alternate" content="${locales[o].ogLocale}">`)
      .join('\n');
    const mod = modified[`${key}:${id}`];

    const vars = {
      ...L,
      ...SITE,
      ...assets,
      year,
      canonical,
      home: L.path,
      guideHref: PAGES.guide.path(L),
      guideCurrent: key === 'guide' ? ' aria-current="page"' : '',
      pageTitle: PAGES[key].title(L),
      pageDescription: PAGES[key].description(L),
      ogType: PAGES[key].ogType,
      alternates,
      ogLocaleAlternates,
      langLinks,
      jsonld: jsonldFor(key, id),
      industries: L.industries.map((n) => `<option value="${esc(n)}">${esc(n)}</option>`).join(''),
      defsHtml: defsHtml(L),
      stepsHtml: stepsHtml(L),
      faqHtml: faqHtml(L),
      guideBody: key === 'guide' ? read(`src/content/guide.${id}.html`) : '',
      modified: isoDate(mod),
      modifiedText: dateText(mod, L),
    };
    vars.head = render(partials.head, vars);
    vars.header = render(partials.header, vars);
    vars.footer = render(partials.footer, vars);

    const outDir = join(root, 'site', pagePath);
    mkdirSync(outDir, { recursive: true });
    writeFileSync(join(outDir, 'index.html'), render(tpl, vars));
    outputs.push(pagePath);
    if (key === 'home' && id === 'en') {
      writeFileSync(join(root, 'site', '404.html'), render(read('src/404.html'), { ...vars, base: '/', home: '/' }));
    }
  }
}

// ---- sitemap.xml with hreflang alternates and lastmod ------------------------
const urls = pageKeys
  .flatMap((key) =>
    order.map((id) => {
      const alts = [
        ...order.map((o) => `    <xhtml:link rel="alternate" hreflang="${locales[o].hreflang}" href="${url(key, o)}"/>`),
        `    <xhtml:link rel="alternate" hreflang="x-default" href="${url(key, 'en')}"/>`,
      ].join('\n');
      return `  <url>\n    <loc>${url(key, id)}</loc>\n    <lastmod>${isoDate(modified[`${key}:${id}`])}</lastmod>\n${alts}\n  </url>`;
    })
  )
  .join('\n');
writeFileSync(
  join(root, 'site', 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`
);

// ---- robots.txt -------------------------------------------------------------
// Content-Signal (contentsignals.org): search = build a search index and show links;
// ai-input = use content in AI answers (retrieval/grounding); ai-train = train or fine-tune models.
// A crawler obeys only the most specific group that names it, so every group repeats the signal.
const SIGNAL = 'Content-Signal: search=yes, ai-input=yes, ai-train=yes';
const group = (comment, agents) => [`# ${comment}`, ...agents.map((a) => `User-agent: ${a}`), SIGNAL, 'Allow: /', ''].join('\n');
writeFileSync(
  join(root, 'site', 'robots.txt'),
  [
    '# Fostier Index crawler policy. Everything public is open to search, AI answers and AI training.',
    '',
    group('Search engines', ['Googlebot', 'Bingbot', 'Applebot', 'DuckDuckBot', 'Baiduspider', 'YandexBot']),
    group('AI search and answer crawlers, and fetches made for a user', [
      'OAI-SearchBot', 'ChatGPT-User', 'Claude-SearchBot', 'Claude-User', 'PerplexityBot', 'Perplexity-User', 'MistralAI-User', 'DuckAssistBot',
    ]),
    group('AI training crawlers (allowed: ai-train=yes)', [
      'GPTBot', 'ClaudeBot', 'Google-Extended', 'Applebot-Extended', 'CCBot', 'Meta-ExternalAgent', 'Amazonbot', 'Bytespider', 'cohere-ai',
    ]),
    group('Everyone else', ['*']),
    `Sitemap: ${SITE.origin}/sitemap.xml`,
    '',
  ].join('\n')
);

// ---- llms.txt (llmstxt.org): a plain summary for tools that look for one ------
const en = locales.en;
const zh = locales['zh-hant'];
writeFileSync(
  join(root, 'site', 'llms.txt'),
  [
    '# Fostier Index',
    '',
    `> Fostier Index is a Hong Kong agency that rebuilds websites for established firms so Google ranks them and AI search tools such as ChatGPT, Gemini and Perplexity cite them. It works in English and Traditional Chinese (Hong Kong).`,
    '',
    'Services (prices in Hong Kong dollars, fixed and agreed before work starts):',
    '',
    `- ${en['svc.diag']}: from HK$1,500. ${en['s1.desc']}`,
    `- ${en['svc.rebuild']}: from HK$12,000. ${en['s2.desc']}`,
    `- ${en['svc.retainer']}: from HK$6,000 a month. ${en['s3.desc']}`,
    '',
    `Contact: ${SITE.email}. Consultation requests: ${url('home', 'en')}#consult`,
    '',
    '## Pages',
    '',
    `- [Home](${url('home', 'en')}): services, prices, definitions of SEO, AEO and GEO, method and FAQ`,
    `- [${en['guide.h1']}](${url('guide', 'en')}): ${en['guide.metaDescription']}`,
    '',
    '## 繁體中文',
    '',
    `- [主頁](${url('home', 'zh-hant')}): 服務、價格、SEO／AEO／GEO 定義、做法及常見問題`,
    `- [${zh['guide.h1']}](${url('guide', 'zh-hant')}): ${zh['guide.metaDescription']}`,
    '',
    '## Optional',
    '',
    `- [Sitemap](${SITE.origin}/sitemap.xml)`,
    '',
  ].join('\n')
);

// ---- Cloudflare static-asset headers ----------------------------------------
writeFileSync(join(root, 'site', '_headers'), read('src/_headers'));

// ---- IndexNow key file ------------------------------------------------------
writeFileSync(join(root, 'site', `${SITE.indexNowKey}.txt`), SITE.indexNowKey);

console.log(`Built ${outputs.length} pages (${outputs.join(', ')}) + 404, sitemap.xml, robots.txt, llms.txt, _headers into ./site`);
