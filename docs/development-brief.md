# Sun Florist 官網 — 開發任務說明(Development Brief)

> 本文件是開發的**起點與總綱**。動工前必須先完整閱讀 `docs/` 內所有規格文件,規格文件的內容優先於你的預設習慣。

---

## 1. 專案概述

- **目標**:為花店 Sun Florist(sunflorist.co)建置全新官網 — 純靜態網站,取代現有 Shopify 網站。
- **性質**:形象官網 + 商品展示。**無購物車、無線上結帳、無會員、無後端 API、無資料庫、無 CMS**。轉換方式為訪客透過 WhatsApp / WeChat / Instagram / 電話直接聯絡下單。
- **目標市場**:美國(DC · MD · VA · NC 地區),**全站英文**。
- **部署**:Cloudflare Pages(靜態輸出)。你只需確保 `npm run build` 產出可部署的 `dist/`,不需處理部署設定。

## 2. 技術堆疊(不可擅自更換)

| 項目 | 選型 |
|---|---|
| 框架 | **Astro**(最新穩定版),`output: 'static'` |
| 樣式 | 原生 CSS(CSS variables 定義 design tokens),**不使用** Tailwind 或 CSS 框架 |
| 字體 | Google Fonts:Cormorant Garamond + Lora,`font-display: swap` |
| 圖片 | Astro 內建 `astro:assets`(`<Image />` / `<Picture />`) |
| 內容 | Astro Content Collections(商品資料 = Markdown/JSON 檔) |
| JavaScript | 原生 vanilla JS,僅限規格允許的互動(手機選單、商品圖輪播);**禁止**引入 React/Vue/jQuery 或任何 UI 函式庫 |
| Integrations | 僅允許:`@astrojs/sitemap`。其他依賴新增前必須先說明理由 |
| 工具腳本依賴 | 僅允許:`sharp`、`heic-convert`(devDependencies,供第 7 節圖片腳本使用) |

## 3. 必讀文件與優先序

開發任何頁面前,依序閱讀:

1. `docs/design-system.md` — 全站視覺系統(色彩 tokens、字體、間距、元件、RWD 原則)
2. `docs/seo-requirements.md` — SEO 規格(meta、JSON-LD、URL 結構、sitemap)
3. `docs/media-performance-spec.md` — 圖片與影片載入規格(格式、尺寸、lazy load、CLS)
4. 各頁面規格:`homepage.md`、`collection.md`、`products-list.md`、`product-detail.md`、`about-us.md`、`contact-us.md`
5. `images/` 內各頁設計參考圖(mobile 390px / desktop 1280px 兩版)

**衝突處理**:頁面規格 > design-system > 參考圖(參考圖為示意,尺寸細節以規格文字為準)。若規格之間矛盾或有缺漏,**停下來提問**,不要自行腦補。

## 4. 專案結構

```
/
├── docs/                      # 規格文件(唯讀,不要修改)
├── public/
│   ├── favicon.svg / robots.txt
│   └── og/                    # 各頁 og:image(1200×630)
├── src/
│   ├── assets/
│   │   └── products/          # 商品原圖(建置時處理)
│   ├── components/            # Nav.astro / Footer.astro / ProductCard.astro / Seo.astro ...
│   ├── content/
│   │   ├── config.ts          # collections schema
│   │   └── products/          # 每個商品一個 .md 檔
│   ├── layouts/
│   │   └── Base.astro         # 含 <head>、meta、JSON-LD 注入點
│   ├── pages/
│   │   ├── index.astro
│   │   ├── about.astro
│   │   ├── contact.astro
│   │   ├── 404.astro
│   │   └── products/
│   │       ├── index.astro                    # 分類總覽
│   │       ├── [slug].astro                   # 商品內頁
│   │       └── category/[category].astro      # 分類列表
│   └── styles/
│       └── global.css         # design tokens + 基礎樣式
├── astro.config.mjs
└── package.json
```

## 5. 商品資料 Schema(Content Collection)

`src/content/products/{slug}.md`,frontmatter 欄位:

```yaml
name: "The Meridian"        # 商品名
slug: "the-meridian"        # URL slug(英文小寫連字號)
no: "B-01"                  # 商品編號
category: "bouquets"        # bouquets | wedding-bouquets | preserved-florals
price: 120                  # USD,數字
palette: "Peach · Cream · Sage"
size: "Standard / Deluxe"
images:                     # 相對 src/assets/products/ 路徑,第一張為主圖
  - "the-meridian-01.jpg"
  - "the-meridian-02.jpg"
description: "一句話描述"    # 也作為 meta description 素材
order: 1                    # 列表排序
draft: false
---
(選填:較長的內文描述)
```

分類定義(四類,`wedding-events` 無商品列表、僅諮詢):資料放 `src/content/` 或常數檔,含 name / slug / cover image / intro。

## 6. 佔位資料原則

- 目前**尚無實際商品資料與實拍照片**。請建立每分類 4–6 個示意商品(合理的花藝命名與價格),圖片使用 `src/assets/` 內的佔位圖。
- 以下資訊使用**明顯的佔位符**,集中定義在一個檔案(如 `src/data/site.ts`),方便日後一次替換:
  - 地址、電話、WhatsApp 號碼、WeChat ID、Instagram 帳號、營業時間、Google Maps embed 網址
  - 範例:`phone: "+1-XXX-XXX-XXXX" // TODO: 實際電話`
- **不可虛構**看起來像真的地址或電話寫死在頁面裡。

## 7. 圖片整理腳本(import-images)— 必做

商品照片絕大多數來自 iPhone(**HEIC 格式**),且檔名為 IMG_XXXX。專案必須內建一個入庫腳本,讓維護者「整包丟原始照片 → 一個指令 → 可直接使用的商品圖」。

### 規格

- 位置:`scripts/import-images.mjs`;`package.json` 加入 `"images": "node scripts/import-images.mjs"`。
- 輸入資料夾:`raw/`(加入 `.gitignore`,原始照片不進版控)。
- 支援輸入格式:**HEIC / HEIF**、JPG / JPEG、PNG、WebP;混合放置皆可,忽略其他檔案類型。
- 處理流程(每張):
  1. HEIC/HEIF 先轉 JPEG(`heic-convert`),其餘格式直接進下一步。
  2. 依 EXIF orientation **自動轉正**,之後**清除全部 metadata(含 GPS 定位)**(`sharp`)。
  3. 長邊 > 2000px 者等比縮至 2000px,以品質 85 輸出 JPEG(WebP/srcset 交給 Astro 建置時處理,此腳本只負責產出乾淨的「原圖」)。
  4. 重新命名:
     - 有 `--slug` 參數:依拍攝時間排序命名為 `{slug}-01.jpg`、`{slug}-02.jpg`…
     - 無 `--slug`:保留原檔名(轉小寫、空格與底線轉連字號),輸出到 `raw/processed/` 供人工挑選。
  5. 輸出至 `src/assets/products/`(可用 `--dest` 覆寫)。
- 檔名衝突:預設中止並提示,`--force` 才允許覆蓋;**不可靜默覆蓋**。
- Console 輸出每張的「原檔名 → 新檔名、輸出尺寸、檔案大小」,結尾總結張數。
- 附簡短使用說明(README 一節或腳本頂部註解),範例:

```bash
# 把 iPhone 照片全部丟進 raw/ 後:
npm run images -- --slug the-meridian
# → src/assets/products/the-meridian-01.jpg, -02.jpg ...
```

### 驗收

- 丟入混合的 HEIC + JPG + PNG(含直式拍攝的 HEIC)可一次處理完成。
- 輸出圖片方向正確、以 exiftool 或同等工具驗證 **metadata(含 GPS)已清空**。
- 輸出檔可直接被頁面的 `<Image />` 引用並正常建置。

## 8. 開發順序

1. 專案初始化:Astro + config + `global.css`(design tokens)+ Base layout(含 Seo component、JSON-LD 注入)
2. 共用元件:Nav(標準版 + hero 透明版)、Footer、ProductCard
3. Content collections:schema + 佔位商品資料
4. 頁面(依此順序):首頁 → 分類總覽 → 分類列表 → 商品內頁 → About → Contact → 404
5. 圖片整理腳本:`scripts/import-images.mjs`(規格見第 7 節)
6. SEO 收尾:sitemap、robots.txt、各頁 og:image 佔位、Rich Results 驗證
7. 效能收尾:對照 `media-performance-spec.md` 與 `seo-requirements.md` 的驗收清單逐項自查

每完成一個階段,停下來總結完成內容與下一步,等確認後再繼續。

## 9. 硬性規則

- 所有頁面內容必須存在於建置後的靜態 HTML 中(關閉 JS 仍可讀到全部文字與連結)。
- 輪播與手機選單必須**漸進增強**:無 JS 時輪播退化為顯示第一張圖,選單退化為可見連結或錨點。
- 禁止使用 `<form>` 提交任何後端(本站沒有後端);聯絡一律為深連結按鈕。
- 禁止引入分析、追蹤、cookie 橫幅、第三方 embed script(Google Maps iframe 除外,須 lazy)。
- 不建立 CMS、admin、任何伺服器端功能。
- commit 訊息用英文,粒度為每個階段或每頁一個 commit。

## 10. 驗收標準

- `npm run build` 無錯誤無警告,`dist/` 可直接靜態伺服。
- `docs/seo-requirements.md` 與 `docs/media-performance-spec.md` 文末的 checklist **全數通過**(佔位資料項目除外,標註 TODO)。
- Lighthouse(行動版,throttling 預設):Performance ≥ 90、SEO = 100、Accessibility ≥ 95。
- 手機 390px 與桌面 1280px 兩種寬度下,版面與設計參考圖一致。
- 全站無 console error;所有內部連結可達,無 404。

## 11. 明確不做的事(Out of Scope)

- 購物車 / 結帳 / 金流 / 會員(未來如需,以嵌入式服務擴充,現在不預留程式碼)
- 多語系(全站英文,不做 i18n 架構)
- 部落格 / FAQ(第二階段再說)
- Shopify 301 轉址對照表(部署階段由專案負責人提供,屆時只需產出 `_redirects` 檔)
