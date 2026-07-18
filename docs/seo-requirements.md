# Sun Florist 官網重建 — SEO 友善規格文件

> 本文件為網站設計與開發的 SEO 需求規格。
> 網站性質：花店形象官網 + 商品展示（無購物車、無線上結帳、無後端 API）
> 目標架構：純靜態網站（建議使用 Astro），託管於 Cloudflare Pages，自訂網域 sunflorist.co

---

## 1. 技術架構要求

- **建置時輸出完整靜態 HTML**：所有頁面內容（含商品名稱、描述、價格）必須在建置時就存在於 HTML 中，不可依賴客戶端 JavaScript 渲染後才出現。搜尋引擎抓到的第一份 HTML 就要是完整內容。
- **零或極少量 JavaScript**：只在真正需要互動的地方使用（如圖片輪播、手機選單），其餘全部為靜態 HTML/CSS。
- **商品資料與樣板分離**：商品資料放在 Markdown 或 JSON 檔（content collections），由樣板自動產生商品頁。新增商品 = 新增一個資料檔 + 圖片。
- **語言宣告**：`<html lang="zh-Hant-TW">`

## 2. URL 結構

- 全站使用簡潔、有語意、全小寫的 URL，單字之間用連字號：
  - 首頁：`/`
  - 商品列表：`/products/`
  - 商品內頁：`/products/{slug}/`（slug 使用英文或拼音，如 `/products/sunflower-bouquet/`）
  - 分類頁（如有）：`/products/category/{category-slug}/`
  - 關於我們：`/about/`
  - 聯絡我們：`/contact/`
- URL 結尾統一（建議統一含 trailing slash），避免同一頁面有多個網址。
- **301 轉址**：整理目前 Shopify 網站（sunflorist.co）已被 Google 收錄的網址清單（尤其 `/products/...` 和 `/collections/...`），若新網址結構不同，必須在 Cloudflare Pages 設定 `_redirects` 檔案做 301 轉址，避免既有排名與外部連結流失。

## 3. 每頁必備的 Meta Tags

每一頁都必須有**獨立且不重複**的：

```html
<title>頁面標題｜Sun Florist 陽光花坊</title>  <!-- 50–60 字元內，重要關鍵字放前面 -->
<meta name="description" content="...">        <!-- 120–158 字元，自然描述頁面內容 -->
<link rel="canonical" href="https://sunflorist.co/當前頁面路徑/">
```

範例：
- 首頁 title：`Sun Florist 陽光花坊｜花束訂購・開幕盆栽・會場佈置`
- 商品頁 title：`{商品名稱}｜Sun Florist 陽光花坊`
- 商品頁 description：使用該商品的描述前段，不可全站共用同一段文字。

## 4. Open Graph / 社群分享標籤

每頁皆需，確保分享到 LINE、Facebook、Instagram 時正確顯示：

```html
<meta property="og:type" content="website">          <!-- 商品頁用 product -->
<meta property="og:title" content="...">
<meta property="og:description" content="...">
<meta property="og:image" content="https://sunflorist.co/og/{page}.jpg">  <!-- 1200×630，絕對路徑 -->
<meta property="og:url" content="https://sunflorist.co/...">
<meta property="og:locale" content="zh_TW">
<meta name="twitter:card" content="summary_large_image">
```

- 商品頁的 og:image 使用該商品主圖（裁切為 1200×630）。

## 5. 結構化資料（JSON-LD）— 重點項目

### 5.1 全站（放在每一頁或首頁）：`Florist`（LocalBusiness 子類型）

```json
{
  "@context": "https://schema.org",
  "@type": "Florist",
  "name": "Sun Florist 陽光花坊",
  "url": "https://sunflorist.co/",
  "image": "https://sunflorist.co/images/storefront.jpg",
  "telephone": "+886-X-XXXX-XXXX",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "（實際地址）",
    "addressLocality": "（城市）",
    "addressRegion": "（縣市）",
    "postalCode": "（郵遞區號）",
    "addressCountry": "TW"
  },
  "geo": { "@type": "GeoCoordinates", "latitude": 0.0, "longitude": 0.0 },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
      "opens": "09:00",
      "closes": "19:00"
    }
  ],
  "sameAs": ["（Facebook 網址）", "（Instagram 網址）", "（LINE 官方帳號網址）"]
}
```

> 開發時以佔位符標示，實際資料由店家填入。地址、電話務必與 Google 商家檔案（Google Business Profile）完全一致。

### 5.2 商品內頁：`Product`

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "{商品名稱}",
  "image": ["{商品圖1}", "{商品圖2}"],
  "description": "{商品描述}",
  "brand": { "@type": "Brand", "name": "Sun Florist" },
  "offers": {
    "@type": "Offer",
    "price": "{價格}",
    "priceCurrency": "TWD",
    "availability": "https://schema.org/InStock",
    "url": "https://sunflorist.co/products/{slug}/"
  }
}
```

> 無線上結帳仍可標示 Offer 與價格；購買方式為門市／LINE 訂購。

### 5.3 商品內頁與分類頁：`BreadcrumbList`

首頁 → 商品列表 →（分類）→ 商品，並在頁面上有對應的可見麵包屑導覽。

## 6. HTML 語意結構

- 每頁**只有一個 `<h1>`**，且包含該頁核心關鍵字（商品頁 h1 = 商品名稱）。
- 標題層級不跳級：h1 → h2 → h3。
- 使用語意標籤：`<header>`、`<nav>`、`<main>`、`<footer>`、`<article>`。
- 導覽與頁尾使用真實的 `<a href>` 連結（不可用 JS onclick 導頁），確保爬蟲可以順著連結抓完全站。
- 每個商品卡片整體可點擊，連到商品內頁。

## 7. 圖片最佳化（花店網站的重中之重）

- 格式：輸出 **WebP**（或 AVIF），並保留 JPEG fallback。
- 尺寸：依實際顯示尺寸輸出多種解析度，使用 `srcset` / `sizes` 響應式圖片。
- 每張圖片都要有**具描述性的 `alt` 文字**（如 `alt="向日葵韓式花束，黃色系包裝"`），不可空白或只寫「圖片」。
- 首屏以下的圖片使用 `loading="lazy"`；首屏主圖不要 lazy load，並可加 `fetchpriority="high"`。
- 圖片檔名使用有意義的英文（`sunflower-bouquet.webp`，而非 `IMG_1234.jpg`）。
- 明確標注 `width` / `height` 屬性，避免版面位移（CLS）。

## 8. 效能要求（Core Web Vitals）

以 PageSpeed Insights 行動版為準，目標：

| 指標 | 目標 |
|------|------|
| LCP（最大內容繪製） | < 2.5s |
| CLS（累計版面位移） | < 0.1 |
| INP（互動延遲） | < 200ms |
| Lighthouse SEO 分數 | 100 |
| Lighthouse Performance | ≥ 90（行動版） |

具體做法：
- CSS 精簡並內聯關鍵 CSS；不引入用不到的框架與函式庫。
- 字型：中文字型使用 `font-display: swap`，並考慮子集化（subset）或直接使用系統字型堆疊以減少載入量。
- 不使用第三方追蹤以外的外部腳本；Google Analytics（GA4）以延遲載入方式加入。

## 9. Sitemap 與 Robots

- 自動產生 `sitemap.xml`（Astro 有官方 integration），包含全部頁面。
- `robots.txt`：

```
User-agent: *
Allow: /
Sitemap: https://sunflorist.co/sitemap-index.xml
```

- 上線後將 sitemap 提交至 **Google Search Console** 與 **Bing Webmaster Tools**。

## 10. 在地 SEO（Local SEO）

- 聯絡頁嵌入 Google 地圖，並提供文字版地址、電話、營業時間（與 JSON-LD 一致）。
- 頁尾（footer）每頁顯示：店名、地址、電話（NAP 一致性）。
- 若尚未建立，申請並驗證 **Google 商家檔案**，網站連結指向新官網。
- 文案中自然包含地區關鍵字（如「{城市}花店」「{地區}花束訂購」），但不堆砌。

## 11. 內容頁建議（有利長期 SEO，可列為第二階段）

- `/faq/`：訂花常見問題（配送範圍、保存方式、客製流程），可加上 `FAQPage` 結構化資料。
- 節慶主題頁：母親節、情人節、畢業季花束（節慶關鍵字搜尋量大）。
- 花藝知識短文（照顧方式、花語），累積自然流量。

## 12. 其他

- **404 頁面**：自訂 404，提供回首頁與商品列表的連結。
- **favicon 與 web manifest**：完整提供各尺寸。
- **HTTPS**：全站強制 HTTPS（Cloudflare Pages 預設提供），HTTP 與 www/非 www 統一 301 到 `https://sunflorist.co`。
- 上線前用以下工具驗收：
  - Google Rich Results Test（驗證 JSON-LD）
  - PageSpeed Insights（效能）
  - Search Console URL 檢查（確認可正常索引）

---

## 驗收清單（Checklist）

- [ ] 所有內容在靜態 HTML 中即完整呈現（關閉 JS 仍可看到全部文字內容）
- [ ] 每頁有獨立 title、description、canonical
- [ ] 每頁有 Open Graph 標籤，商品頁分享到 LINE/FB 顯示正確圖文
- [ ] 全站 Florist JSON-LD、商品頁 Product JSON-LD、麵包屑 BreadcrumbList 通過 Rich Results Test
- [ ] 圖片為 WebP + srcset + alt + 寬高屬性，首屏外 lazy load
- [ ] sitemap.xml、robots.txt、自訂 404
- [ ] Shopify 舊網址 301 轉址對照表已設定
- [ ] PageSpeed 行動版 LCP < 2.5s、CLS < 0.1、SEO 100 分
- [ ] Search Console 已提交 sitemap 並確認收錄
