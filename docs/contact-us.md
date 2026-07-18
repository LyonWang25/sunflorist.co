# Contact Us 聯絡我們規格

> 設計稿:`Sun Florist Pages.dc.html` — 5b(手機)/ 5d(桌面)
> URL:`/contact/`

## 結構

### 手機(單欄)
1. Nav。
2. 麵包屑「Home · Contact」→ `<h1>Contact</h1>` → 金色細線 → 一句「Message us — we reply the same day.」。
3. **聯絡按鈕直排**(滿寬 `btn-block`,高 ≥ 44px):WhatsApp / WeChat / Instagram(金色外框)+ Call +1 …(secondary 外框)。各按鈕為真實深連結:`https://wa.me/{號碼}`、`weixin://`(或 WeChat ID 彈層/QR)、`https://instagram.com/{帳號}`、`tel:+1…`。
4. **資訊表**(髮絲線三行):Visit(文字版地址)/ Hours(Mon–Sat · 9:00–19:00)/ Serving(DC · MD · VA · NC)。
5. **Google 地圖 embed**(高 ~240px;iframe lazy load)。
6. Footer。

### 桌面(兩欄)
- 左:按鈕 2×2 grid + 資訊表(多一行 Phone);右:地圖(高 ~420px)。

## RWD

- 兩欄 → 單欄;按鈕 2×2 → 直排滿寬。

## SEO 要點(在地 SEO 核心頁)

- Title:`Contact｜Sun Florist`;description 含地址與服務地區。
- H1 唯一。
- 文字版 NAP(店名/地址/電話)必須與 Florist JSON-LD、Google 商家檔案**完全一致**;營業時間同步 `openingHoursSpecification`。
- 地圖 iframe 設 `loading="lazy"` 且不阻塞 LCP。
- WeChat 無標準網頁深連結 — 建議顯示 WeChat ID + QR code 圖片。
