# Product Detail 商品內頁規格

> 設計稿:`Sun Florist Collections.dc.html` — 4c(手機)/ 4f(桌面)
> URL:`/products/{slug}/`(slug 用英文,如 `/products/the-meridian/`)

## 結構

### 手機(單欄)
1. Nav。
2. **滿寬主圖**(高 ~430px)+ 輪播圓點(唯一允許的 JS 互動之一;無 JS 時退化為第一張圖)。
3. 置中資訊:麵包屑(Collections · Bouquets)→ `<h1>{商品名}</h1>`(36px)→ 價格(金色 16px)→ 一句描述(≤ 2 行)。
4. **規格表**:三行髮絲線表 — No.(編號如 B-01)/ Palette / Size(Standard / Deluxe)。
5. **To order this piece 卡片**(1px 外框):說明「Message us "{商品名} · {編號}"」+ WhatsApp / WeChat / Instagram 按鈕。這是本頁唯一轉換點,無購物車。
6. **You may also like**:同分類 3 款,3 欄小圖 + 名稱。
7. Footer。

### 桌面(兩欄 grid,1.1fr / 1fr)
- 左:大圖(高 ~560px)+ 3 張縮圖列(點擊換主圖,同輪播 JS)。
- 右:麵包屑 → H1(52px)→ 價格 → 描述 → 規格表 → To order 卡片。
- 下方滿寬:You may also like 3 欄。

## RWD

- 兩欄 → 單欄;縮圖列 → 圓點輪播。
- 按鈕觸控目標 ≥ 44px。

## SEO 要點(本站最重要頁面)

- Title:`{商品名}｜Sun Florist`;description 取商品描述前段,**每頁獨立**。
- H1 = 商品名。
- **Product JSON-LD**:name / image[] / description / brand / offers(price、priceCurrency: USD、availability: InStock、url)。無線上結帳仍標 Offer。
- BreadcrumbList JSON-LD + 頁面可見麵包屑。
- og:type = product;og:image = 商品主圖 1200×630 裁切。
- 主圖不 lazy + `fetchpriority="high"`;縮圖與 related lazy。
- 圖片檔名有語意(`the-meridian-01.webp`)。
