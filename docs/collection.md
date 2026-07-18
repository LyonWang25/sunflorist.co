# Collections 分類總覽頁規格

> 設計稿:`Sun Florist Collections.dc.html` — 4a(手機)/ 4d(桌面)
> URL:`/products/`(或 `/collections/`,與 301 對照表一致)

## 結構

1. **Nav**(標準內頁版:白底、深色 logo、桌面文字連結 / 手機漢堡,底部 1px divider)。
2. **頁首**:可見麵包屑「Home · Collections」(11px 大寫,可點)→ `<h1>The Collections</h1>` → 金色細線置中。
3. **分類卡**:四張 — Bouquets / Wedding Bouquets / Preserved Florals / Wedding & Events。
   - 每卡:大圖(手機高 300px 滿寬堆疊;桌面 2×2 grid、高 380px)+ 羅馬數字(金色小字)+ 分類名(Cormorant 600,24–28px)+ 款數(如「12 designs」;Wedding & Events 顯示「By consultation」)。
   - **整卡一個 `<a>`** 連到分類列表頁。
4. **Footer**(精簡版一行 NAP 即可)。

## RWD

- 手機:單欄堆疊,置中;桌面:2×2 grid,gap `--space-6`。

## SEO 要點

- Title:`Flower Collections｜Sun Florist`。
- H1 唯一 =「The Collections」。
- 麵包屑同時輸出 BreadcrumbList JSON-LD(Home → Collections)。
- 圖片 alt 描述分類內容(如 `alt="Fresh hand-tied bouquets"`)。
