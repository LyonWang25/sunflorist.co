# Sun Florist 官網 — 圖片與影片載入效能規格

> 本文件定義全站圖片與影片的處理、載入與呈現規範。
> 目標：全站任一頁面首次載入 < 1MB，行動版 LCP < 2.5s，載入過程無版面跳動、無明顯「轉圈圈」等待感。
> 適用架構:Astro 靜態網站 + Cloudflare Pages。

---

## 1. 圖片來源與目錄規範

- 原始圖片統一放在 `src/assets/`（交由 Astro 建置時處理），**不放** `public/`。
  - `public/` 只放不需處理的檔案：favicon、og 分享圖、影片 poster。
- 檔名使用有意義的英文小寫 + 連字號：`sunflower-bouquet-01.jpg`，不可出現 `IMG_1234.jpg`、中文或空格。
- 原圖規格:長邊 ≥ 1600px 的 JPEG/PNG 即可，**不需要**事先手動壓縮——壓縮與轉檔由建置流程統一處理，確保品質一致。
- 商品圖統一比例（建議 4:5 或 1:1，擇一全站統一），避免列表頁高低不齊。

## 2. 圖片輸出規範（建置時自動處理）

全站圖片一律使用 Astro 的 `<Image />` / `<Picture />` 元件，禁止直接手寫 `<img src="原圖">`。

| 用途 | 輸出寬度 (widths) | 格式 | 品質 |
|------|------------------|------|------|
| 首頁主視覺 | 640 / 1024 / 1600 / 2000 | AVIF + WebP，JPEG fallback | 80 |
| 商品列表縮圖 | 320 / 480 / 640 | WebP | 75 |
| 商品內頁主圖 | 480 / 800 / 1200 | AVIF + WebP | 80 |
| 商品內頁附圖 | 480 / 800 | WebP | 75 |
| 內容頁插圖 | 480 / 800 | WebP | 75 |

範例（商品列表縮圖）：

```astro
---
import { Image } from 'astro:assets';
import photo from '../assets/products/sunflower-bouquet-01.jpg';
---
<Image
  src={photo}
  widths={[320, 480, 640]}
  sizes="(max-width: 640px) 50vw, 320px"
  format="webp"
  quality={75}
  alt="向日葵韓式花束，黃色系包裝"
  loading="lazy"
  decoding="async"
/>
```

## 3. 載入優先序規則

- **首屏（above the fold）**：
  - 主視覺圖片：`loading="eager"` + `fetchpriority="high"`，並於 `<head>` 加上 `<link rel="preload" as="image">`（僅限 LCP 那一張）。
  - 每頁最多 1 張 eager 圖片。
- **首屏以下**：一律 `loading="lazy"` + `decoding="async"`。
- 商品列表頁:第一排（首屏可見的 2–4 張）eager，其餘 lazy。

## 4. 防版面跳動（CLS）

- 所有圖片必須有明確的長寬比：Astro `<Image>` 會自動輸出 `width`/`height`；自訂容器使用 CSS `aspect-ratio`。
- 圖片載入前的佔位：
  - 商品縮圖：淡灰色底（`background: #f3f1ee` 之類的品牌淺色）即可。
  - 主視覺與商品主圖：使用 **blur-up**——內嵌一張 ~20px 寬的模糊縮圖（base64，< 1KB）作為背景，清晰圖 `onload` 後 200ms 淡入。
- 驗收標準：整頁載入過程 CLS < 0.1，肉眼不可見任何內容位移。

## 5. 影片規範

### 5.1 自行託管（僅限背景短片 / 商品動態展示）

適用：首頁背景影片、商品頁短循環影片。**必須全部符合**：

- 長度 5–15 秒，無聲。
- 編碼：H.264 MP4（相容性）+ WebM（較小，優先提供），720p、去除音軌。
- 檔案大小上限：**5MB**（目標 2–3MB）。
- 壓縮指令參考：

```bash
ffmpeg -i input.mov -an -vf "scale=-2:720" -c:v libx264 -crf 28 -preset slow -movflags +faststart hero.mp4
ffmpeg -i input.mov -an -vf "scale=-2:720" -c:v libvpx-vp9 -crf 38 -b:v 0 hero.webm
```

- 標籤寫法：

```html
<video autoplay muted loop playsinline
       preload="metadata"
       poster="/videos/hero-poster.webp"
       width="1280" height="720">
  <source src="/videos/hero.webm" type="video/webm">
  <source src="/videos/hero.mp4" type="video/mp4">
</video>
```

- `poster` 為必填：從影片截一張畫面輸出 WebP，使用者在影片載入前看到的是這張靜態圖，體感為「秒開」。
- 影片檔放 `public/videos/`,由 Cloudflare CDN 快取。
- 行動版可考慮以 `<source media>` 或 CSS 直接改為僅顯示 poster 靜態圖，不載入影片。

### 5.2 外部託管（超過 15 秒或有聲音的影片）

適用：品牌介紹影片、花藝教學、活動紀錄。

- 一律使用 YouTube（可設不公開）或 Cloudflare Stream，**禁止**將長影片檔放入專案。
- 嵌入必須採 **click-to-load（facade）模式**：頁面上先只放封面圖 + 播放按鈕（純 HTML/CSS），使用者點擊後才動態載入播放器 iframe。
  - 建議使用 `lite-youtube-embed` 元件或等效自製 facade。
  - 理由：YouTube iframe 本身 > 1MB JS，直接嵌入會拖垮整頁效能。

## 6. CDN 與快取

- Cloudflare Pages 預設對靜態資產（含圖片、影片）提供全球 CDN 快取，無需額外設定。
- Astro 建置產出的圖片檔名含 hash，天然支援長效快取(immutable)。
- `public/` 下的影片與 poster 檔更新時**必須改檔名**（如 `hero-v2.mp4`），避免使用者拿到舊快取。

## 7. 其他

- 禁止使用 CSS `background-image` 呈現內容性圖片（無法 lazy load、無 alt）；背景裝飾圖除外。
- 圖片輪播（如商品多圖）：只 eager 載入第一張，其餘 lazy;不使用重型輪播函式庫，優先 CSS scroll-snap。
- Instagram 貼文牆（如有）：不直接嵌入官方 embed script，改為建置時抓取縮圖或手動放置圖片 + 外連。

---

## 驗收清單（Checklist）

- [ ] 全站無任何直接引用原圖的 `<img>`，皆經 Astro `<Image>` 輸出 WebP/AVIF + srcset
- [ ] 每頁僅一張 eager + fetchpriority="high" 的 LCP 圖片，其餘 lazy load
- [ ] 所有圖片有描述性 alt 與明確寬高，整頁 CLS < 0.1
- [ ] 主視覺 / 商品主圖有 blur-up 或色塊佔位，無「圖片突然蹦出」
- [ ] 自託管影片:≤ 5MB、無聲、有 poster、`preload="metadata"`、MP4+WebM 雙格式
- [ ] 長影片皆為外部託管 + click-to-load facade，未直接嵌入 iframe
- [ ] 商品列表頁首次載入總量 < 1MB（DevTools Network 驗證）
- [ ] PageSpeed Insights 行動版：LCP < 2.5s、CLS < 0.1
