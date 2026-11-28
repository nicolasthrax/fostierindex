// All visible copy, per language. Keys are referenced from src/template.html as {{key}}.

export const locales = {
  en: {
    path: '/',
    htmlLang: 'en',
    hreflang: 'en',
    ogLocale: 'en_HK',
    langName: 'English',
    langShort: 'EN',
    'meta.title': 'Fostier Index | Get your Hong Kong firm cited by AI search',
    'meta.description':
      'Fostier Index rebuilds websites for established Hong Kong firms so Google ranks them and ChatGPT, Gemini and Perplexity cite them.',
    skip: 'Skip to content',
    langLabel: 'Language',

    'hero.title': 'Get cited.',
    'hero.sub':
      'We rebuild websites for established Hong Kong firms so Google ranks them and ChatGPT, Gemini and Perplexity cite them.',
    'hero.cta': 'Request a free AI visibility consultation',
    'hero.sceneAlt':
      'A field of fine jade light, like the sources of the web. One point shines brighter than the rest.',

    'svc.title': 'How you get cited.',
    'svc.sub': 'Fixed scope and price, agreed before any work starts.',
    's1.name': 'Diagnostic',
    's1.desc': 'How your site compares with two local competitors, in Google and in AI search. Credited toward your rebuild.',
    's1.lead': 'From',
    's1.amount': 'HK$1,500',
    's1.tail': '',
    's2.name': 'Rebuild',
    's2.desc': 'New site architecture, schema markup and answer-first pages, in the languages your clients search in.',
    's2.lead': 'From',
    's2.amount': 'HK$12,000',
    's2.tail': '',
    's3.name': 'Authority',
    's3.desc': 'Directory listings, press and expert content that give AI tools reasons to cite you. Three-month minimum.',
    's3.lead': 'From',
    's3.amount': 'HK$6,000',
    's3.tail': 'a month',

    'c.title': 'See who AI cites instead of you.',
    'c.sub':
      'Request a free AI visibility consultation. We check your firm in Google, ChatGPT, Gemini and Perplexity, then walk you through what we find.',
    'c.firm': 'Firm name',
    'c.site': 'Website',
    'c.sitePh': 'yourfirm.com.hk',
    'c.industry': 'Industry',
    'c.choose': 'Choose your industry',
    industries: ['Law firm', 'Medical or dental clinic', 'Wealth or immigration advisory', 'B2B consultancy', 'Property or luxury', 'Other'],
    'c.submit': 'Request consultation',
    'c.note': 'This opens your email app with the request ready to send to contact@fostierindex.com.',
    'c.opened': 'Your email app should open with the request filled in.',
    'c.fallback': 'Nothing opened? Send it another way:',
    'c.copy': 'Copy request',
    'c.copiedBtn': 'Copied',
    'c.copied': 'Copied. Paste it into an email to contact@fostierindex.com.',
    'c.subject': 'Free AI visibility consultation',

    'foot.promise': 'Results depend on factors beyond any agency’s control, including search engines and AI platforms.',
    'foot.place': 'Hong Kong',

    'svc.diag': 'AEO/GEO Diagnostic',
    'svc.rebuild': 'SEO/GEO website rebuild',
    'svc.retainer': 'Monthly authority and GEO retainer',
    // ---- Answer-first content (home page, below the consultation form) ----
    'def.title': 'SEO, AEO and GEO, in plain terms.',
    'def.sub': 'Three names for one job: making your firm the answer when clients search, whether they ask Google or an AI assistant.',
    defs: [
      {
        id: 'seo',
        term: 'Search engine optimisation (SEO)',
        name: 'Search engine optimisation',
        text: 'Search engine optimisation (SEO) is the work of making your website easy for Google and Bing to crawl, understand and rank for the searches your clients make. It is still the foundation. Google’s AI Overviews and AI Mode are built on Google Search, and ChatGPT search and Copilot rely on search indexes, so a site that search engines can’t read is invisible to AI answers too.',
      },
      {
        id: 'aeo',
        term: 'Answer engine optimisation (AEO)',
        name: 'Answer engine optimisation',
        text: 'Answer engine optimisation (AEO) is the work of making your firm the source an answer engine quotes or names when someone asks a direct question. Answer engines include Google AI Overviews and AI Mode, ChatGPT, Gemini, Perplexity and Copilot. AEO favours pages that state the answer first, in clear passages that make sense on their own, backed by structured data.',
      },
      {
        id: 'geo',
        term: 'Generative engine optimisation (GEO)',
        name: 'Generative engine optimisation',
        text: 'Generative engine optimisation (GEO) is the wider work of shaping what generative AI tools say about your firm and your field: whether they mention you, describe you accurately and recommend you. Beyond your own site, it depends on what the rest of the web says about you, in directories, press, reviews and expert profiles.',
      },
    ],
    'def.hk':
      'For a Hong Kong firm, all three run in two languages. Clients search in English and in Traditional Chinese, so each language needs its own page, written the way people actually ask, and linked with hreflang tags so search engines show the right version.',
    'def.more': 'Read the full guide to SEO, AEO and GEO for Hong Kong firms',

    'method.title': 'How we work.',
    'method.sub': 'Four steps. The scope and price of each are agreed before it starts.',
    steps: [
      {
        name: 'Diagnose',
        text: 'We put the questions your clients ask to Google, ChatGPT, Gemini and Perplexity, and compare your firm with two local competitors. You see who gets cited, and why.',
      },
      {
        name: 'Rebuild',
        text: 'We rebuild your site’s architecture, structured data and key pages so that each page answers a real client question first, in English and Traditional Chinese.',
      },
      {
        name: 'Build authority',
        text: 'We get your firm listed and mentioned where AI tools look for corroboration: directories, industry bodies, press and expert content.',
      },
      {
        name: 'Measure',
        text: 'We re-check the same questions in the same AI tools and report what changed, so decisions rest on evidence rather than guesswork.',
      },
    ],

    'faq.title': 'Questions firms ask us.',
    faq: [
      {
        q: 'What is AEO, and how is it different from SEO?',
        a: 'SEO gets your pages ranked in search results. AEO gets your firm quoted or named inside the answer itself, in Google AI Overviews, ChatGPT, Gemini or Perplexity. The two overlap: answer engines mostly cite pages that search engines already index and trust, so AEO builds on SEO rather than replacing it.',
      },
      {
        q: 'Why does a Hong Kong firm need AEO now?',
        a: 'Many clients now ask an AI assistant before they search or call. When someone asks which firm to use, the assistant names only a few. If yours isn’t one of them, you aren’t on the shortlist, however good your website looks.',
      },
      {
        q: 'Can you guarantee that ChatGPT or Google will cite my firm?',
        a: 'No. No agency controls what search engines or AI platforms show. What we can do is remove the reasons they pass you over: pages they can’t read, answers they can’t quote, and a firm the rest of the web doesn’t mention. Scope and price are agreed before we start.',
      },
      {
        q: 'What is the difference between the free consultation and the Diagnostic?',
        a: 'In the free consultation we check your firm in Google, ChatGPT, Gemini and Perplexity and walk you through what we find. The Diagnostic goes further: it compares your site with two local competitors in Google and in AI search. It starts from HK$1,500, and the fee is credited toward a rebuild.',
      },
      {
        q: 'Do I need separate English and Chinese pages?',
        a: 'Yes, if your clients search in both languages. AI tools answer in the language of the question and tend to favour sources written in that language. A machine translation rarely matches how people in Hong Kong phrase a question in Traditional Chinese, so each version should be written for its readers and linked with hreflang tags.',
      },
      {
        q: 'How long does it take to see results?',
        a: 'It depends on how often search engines and AI tools revisit your site, and on your competition. Technical fixes can be picked up within weeks. Authority from directories, press and expert content builds over months, which is why the Authority service has a three-month minimum.',
      },
      {
        q: 'Which firms do you work with?',
        a: 'Established Hong Kong firms whose clients research carefully before they choose: law firms, medical and dental clinics, wealth and immigration advisers, B2B consultancies, and property and luxury businesses.',
      },
      {
        q: 'How much does it cost?',
        a: 'Prices are fixed and agreed before work starts. The Diagnostic starts from HK$1,500, a website rebuild from HK$12,000, and the Authority service from HK$6,000 a month, with a three-month minimum.',
      },
    ],

    // ---- Guide page ----
    'guide.slug': 'aeo-guide/',
    'guide.metaTitle': 'SEO, AEO and GEO guide for Hong Kong firms | Fostier Index',
    'guide.metaDescription':
      'What SEO, AEO and GEO mean, how AI answers pick their sources, and what a Hong Kong firm should fix on and off its website to be cited.',
    'guide.h1': 'SEO, AEO and GEO for Hong Kong firms',
    'guide.crumb': 'Guide',
    'guide.updated': 'Updated',
    'guide.ctaTitle': 'See who AI cites instead of you.',
    'guide.ctaText': 'Request a free AI visibility consultation. We check your firm in Google, ChatGPT, Gemini and Perplexity, then walk you through what we find.',
    'nav.home': 'Home',
    'nav.guide': 'Guide',
    'nav.faq': 'FAQ',
    'nav.label': 'Site',
    'nav.crumbs': 'Breadcrumb',

    '404.title': 'This page isn’t here.',
    '404.body': 'The link may be old, or the address mistyped.',
    '404.cta': 'Go to the home page',
  },

  'zh-hant': {
    path: '/zh-hant/',
    htmlLang: 'zh-Hant-HK',
    hreflang: 'zh-Hant-HK',
    ogLocale: 'zh_HK',
    langName: '繁體中文',
    langShort: '繁',
    'meta.title': 'Fostier Index | 讓您的香港企業獲 AI 搜尋引用',
    'meta.description':
      'Fostier Index 為香港具規模的企業重建網站，讓 Google 為您排名，讓 ChatGPT、Gemini 及 Perplexity 引用您。',
    skip: '跳至內容',
    langLabel: '語言',

    'hero.title': '獲 AI 引用',
    'hero.sub': '我們為香港具規模的企業重建網站，讓 Google 為您排名，讓 ChatGPT、Gemini 及 Perplexity 引用您。',
    'hero.cta': '預約免費 AI 能見度諮詢',
    'hero.sceneAlt': '一片如網絡資料來源般的翡翠色微光，其中一點比其他更明亮。',

    'svc.title': '如何獲得引用',
    'svc.sub': '範圍與價格固定，開始前雙方確認。',
    's1.name': '診斷',
    's1.desc': '比較您與兩間本地競爭對手在 Google 及 AI 搜尋中的表現。費用可抵扣網站重建。',
    's1.lead': '',
    's1.amount': 'HK$1,500',
    's1.tail': '起',
    's2.name': '網站重建',
    's2.desc': '全新網站架構、結構化資料標記及答案優先頁面，以您客戶搜尋時所用的語言呈現。',
    's2.lead': '',
    's2.amount': 'HK$12,000',
    's2.tail': '起',
    's3.name': '權威建立',
    's3.desc': '名錄登錄、媒體報道及專業內容，給 AI 工具引用您的理由。最少三個月。',
    's3.lead': '每月',
    's3.amount': 'HK$6,000',
    's3.tail': '起',

    'c.title': '看看 AI 引用了誰，而不是您',
    'c.sub': '預約免費 AI 能見度諮詢。我們會檢查貴公司在 Google、ChatGPT、Gemini 及 Perplexity 的表現，並與您講解結果。',
    'c.firm': '公司名稱',
    'c.site': '網站',
    'c.sitePh': 'yourfirm.com.hk',
    'c.industry': '行業',
    'c.choose': '請選擇行業',
    industries: ['律師行', '醫療或牙科診所', '財富管理或移民顧問', 'B2B 顧問公司', '地產或奢侈品', '其他'],
    'c.submit': '提交諮詢申請',
    'c.note': '按下後會開啟您的電郵程式，並預先填好發送至 contact@fostierindex.com 的申請。',
    'c.opened': '您的電郵程式應會開啟並填好申請。',
    'c.fallback': '沒有開啟？改用以下方式發送：',
    'c.copy': '複製申請內容',
    'c.copiedBtn': '已複製',
    'c.copied': '已複製，請貼上並電郵至 contact@fostierindex.com。',
    'c.subject': '免費 AI 能見度諮詢',

    'foot.promise': '成效受搜尋引擎及 AI 平台等外在因素影響，非任何機構所能控制。',
    'foot.place': '香港',

    'svc.diag': 'AEO/GEO 診斷',
    'svc.rebuild': 'SEO/GEO 網站重建',
    'svc.retainer': '每月權威建立及 GEO 服務',
    // ---- 答案優先內容（主頁，諮詢表格下方）----
    'def.title': 'SEO、AEO 與 GEO 是甚麼？',
    'def.sub': '三個名稱，同一個目標：無論客戶問 Google 還是 AI 助理，答案都是您的公司。',
    defs: [
      {
        id: 'seo',
        term: '搜尋引擎優化（SEO）',
        name: '搜尋引擎優化',
        text: '搜尋引擎優化（SEO）是讓 Google 及 Bing 能順利抓取及理解您的網站，並在客戶搜尋相關問題時為您排名。這仍然是一切的基礎：Google 的 AI 摘要及 AI 模式建基於 Google 搜尋，ChatGPT 搜尋及 Copilot 亦依賴搜尋索引，搜尋引擎讀不到的網站，AI 答案同樣看不見。',
      },
      {
        id: 'aeo',
        term: '答案引擎優化（AEO）',
        name: '答案引擎優化',
        text: '答案引擎優化（AEO）是讓答案引擎在回答直接提問時，引用或提及您的公司。答案引擎包括 Google AI 摘要及 AI 模式、ChatGPT、Gemini、Perplexity 及 Copilot。AEO 著重頁面開門見山地回答問題，以清晰、可獨立引用的段落表達，並配合結構化資料。',
      },
      {
        id: 'geo',
        term: '生成式引擎優化（GEO）',
        name: '生成式引擎優化',
        text: '生成式引擎優化（GEO）的範圍更廣，目標是影響生成式 AI 工具如何談論您的公司及所屬行業：會否提及您、描述是否準確、會否推薦您。除了您自己的網站，這亦取決於網上其他地方如何介紹您，例如名錄、媒體報道、評價及專業人士簡介。',
      },
    ],
    'def.hk':
      '對香港企業而言，三者都要以兩種語言進行。客戶會以英文及繁體中文搜尋，因此每種語言都需要獨立頁面，按客戶實際的提問方式撰寫，並以 hreflang 標籤連結，讓搜尋引擎顯示正確的版本。',
    'def.more': '閱讀完整指南：香港企業的 SEO、AEO 與 GEO',

    'method.title': '我們的做法',
    'method.sub': '四個步驟，每一步的範圍及價格都會在開始前確認。',
    steps: [
      {
        name: '診斷',
        text: '我們把客戶常問的問題交給 Google、ChatGPT、Gemini 及 Perplexity，並將貴公司與兩間本地競爭對手比較。您會看到誰獲引用，以及原因。',
      },
      {
        name: '重建',
        text: '我們重建網站架構、結構化資料及重點頁面，讓每一頁都先回答一個真實的客戶問題，並提供英文及繁體中文版本。',
      },
      {
        name: '建立權威',
        text: '我們讓貴公司在 AI 工具查證資料的地方出現及獲提及：名錄、行業組織、媒體及專業內容。',
      },
      {
        name: '追蹤成效',
        text: '我們在同樣的 AI 工具重新檢查同一組問題，並匯報有何變化，讓決策有根有據，而非憑感覺。',
      },
    ],

    'faq.title': '企業常問的問題',
    faq: [
      {
        q: 'AEO 是甚麼？與 SEO 有何不同？',
        a: 'SEO 讓您的網頁在搜尋結果中排名；AEO 則讓貴公司在答案本身中獲引用或提及，例如 Google AI 摘要、ChatGPT、Gemini 或 Perplexity。兩者互相重疊：答案引擎大多引用搜尋引擎已收錄及信任的網頁，所以 AEO 是建基於 SEO，而非取而代之。',
      },
      {
        q: '為何香港企業現在就需要 AEO？',
        a: '不少客戶在搜尋或致電之前，會先問 AI 助理。當有人問應該找哪間公司時，AI 助理只會列出幾間。如果貴公司不在其中，無論網站多精美，您都不在候選名單之內。',
      },
      {
        q: '你們能保證 ChatGPT 或 Google 會引用我的公司嗎？',
        a: '不能。沒有任何機構能控制搜尋引擎或 AI 平台顯示甚麼。我們能做的，是消除它們略過您的原因：讀不到的網頁、無法引用的答案，以及網上其他地方從未提及的公司。範圍及價格會在開始前確認。',
      },
      {
        q: '免費諮詢與診斷有何分別？',
        a: '免費諮詢會檢查貴公司在 Google、ChatGPT、Gemini 及 Perplexity 的表現，並與您講解結果。診斷則更深入：比較您的網站與兩間本地競爭對手在 Google 及 AI 搜尋中的表現。費用 HK$1,500 起，並可抵扣網站重建費用。',
      },
      {
        q: '我需要分開的英文及中文網頁嗎？',
        a: '如果您的客戶會以兩種語言搜尋，就需要。AI 工具會以提問的語言作答，並傾向引用以該語言撰寫的資料。機器翻譯很少能貼近香港人以繁體中文提問的方式，所以每個語言版本都應為其讀者撰寫，並以 hreflang 標籤連結。',
      },
      {
        q: '需要多久才見到成效？',
        a: '這取決於搜尋引擎及 AI 工具多久重新瀏覽您的網站，以及行業的競爭程度。技術修正可在數星期內被讀取；來自名錄、媒體及專業內容的權威則需時數月累積，因此權威建立服務最少為期三個月。',
      },
      {
        q: '你們與哪類公司合作？',
        a: '客戶在選擇前會仔細比較的香港企業：律師行、醫療及牙科診所、財富管理及移民顧問、B2B 顧問公司，以及地產及奢侈品業務。',
      },
      {
        q: '收費是多少？',
        a: '價格固定，並在開始前確認。診斷 HK$1,500 起，網站重建 HK$12,000 起，權威建立服務每月 HK$6,000 起，最少三個月。',
      },
    ],

    // ---- 指南頁 ----
    'guide.slug': 'aeo-guide/',
    'guide.metaTitle': '香港企業的 SEO、AEO 與 GEO 指南 | Fostier Index',
    'guide.metaDescription':
      'SEO、AEO 與 GEO 是甚麼、AI 答案如何選擇資料來源，以及香港企業要在網站內外做好哪些事，才能以中英文獲 AI 引用。',
    'guide.h1': '香港企業的 SEO、AEO 與 GEO',
    'guide.crumb': '指南',
    'guide.updated': '更新日期',
    'guide.ctaTitle': '看看 AI 引用了誰，而不是您',
    'guide.ctaText': '預約免費 AI 能見度諮詢。我們會檢查貴公司在 Google、ChatGPT、Gemini 及 Perplexity 的表現，並與您講解結果。',
    'nav.home': '主頁',
    'nav.guide': '指南',
    'nav.faq': '常見問題',
    'nav.label': '網站',
    'nav.crumbs': '導覽路徑',

    '404.title': '找不到此頁面',
    '404.body': '連結可能已過時，或網址輸入有誤。',
    '404.cta': '返回主頁',
  },
};
