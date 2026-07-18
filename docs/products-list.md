# Products List 分類列表頁規格

> 設計稿:`Sun Florist Collections.dc.html` — 4b(手機)/ 4e(桌面),以 Bouquets 為例
> URL:`/products/category/{category-slug}/`(四個分類各一頁,樣板共用)

## 結構

1. **Nav**(標準內頁版)。
2. **頁首**:麵包屑「Home · Collections · {分類名}」→ `<h1>{分類名}</h1>` → 金色細線 → 一句副標「Ready-made designs. Message us your pick.」。
3. **商品網格**:
   - 手機 2 欄(gap 直 18.4px / 橫 13.8px),圖高 ~210px;桌面 3 欄,圖高 ~340px。
   - 每格:圖(`object-fit: cover`,直角無框)+ 商品名(Cormorant 600,17–20px)+ 價格(金色 `tnum`,桌面與名稱同行左右對齊)。
   - **整卡一個 `<a>`** 連到商品內頁。無多餘文字、無標籤、無評分。
4. **Footer**。

## 資料驅動

- 商品來自 content collection(Markdown/JSON),欄位:name / slug / price / category / images / palette / size / no.(編號如 B-01)/ description。
- 新增商品 = 加一個資料檔 + 圖片,列表自動生成。
- 排序:手動 order 欄位或按編號。

## RWD

- 2 欄 → 3 欄唯一變化;版心 1280px 置中。

## SEO 要點

- Title:`{分類名}｜Sun Florist`;description 用分類簡介。
- H1 = 分類名。
- BreadcrumbList JSON-LD(Home → Collections → 分類)。
- 圖片 alt = 商品描述性文字(如 `alt="Peach and cream garden rose bouquet"`),非商品名重複。
- 列表首屏 4–6 張不 lazy,其餘 lazy。
