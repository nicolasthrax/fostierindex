// Tells IndexNow engines (Bing, Yandex, Seznam, Naver...) that the site's URLs changed.
// Run after a production deploy:  node scripts/indexnow.mjs            (every URL in site/sitemap.xml)
//                                 node scripts/indexnow.mjs <url> ...   (only these URLs)
// The key is public by design; the build serves it at https://fostierindex.com/<key>.txt.
import { readFileSync } from 'node:fs';

const HOST = 'fostierindex.com';
const KEY = '96b802fd5fe54a224e659a05c0ec8138';

const urlList = process.argv.slice(2).length
  ? process.argv.slice(2)
  : [...readFileSync(new URL('../site/sitemap.xml', import.meta.url), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList }),
});
console.log(`IndexNow: HTTP ${res.status} for ${urlList.length} URL(s)`);
if (res.status >= 400) {
  console.log(await res.text());
  process.exit(1);
}
