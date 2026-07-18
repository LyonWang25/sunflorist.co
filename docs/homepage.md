# Homepage 首頁規格

> 設計稿:`Sun Florist Home v2.dc.html` — 3a(手機)/ 3b(桌面)
> URL:`/`

## 結構(由上而下)

1. **滿版 Hero(100dvh)**
   - 全螢幕花藝照片,上下加漸層遮罩(上 45% / 下 38% 黑,中段透)保持文字可讀。
   - 頂部:白色 logo(左)+ 導覽(桌面:Collections / Weddings / About + 外框 Contact 按鈕;手機:漢堡)。
   - 置中:`<h1>Sun Florist</h1>`(Cormorant 400,手機 54px / 桌面 104px,`letter-spacing 0.06–0.08em`)→ 金色細線 → 一行 tagline「boutique florist | weddings & events」(小寫、`letter-spacing 0.22–0.28em`)。
   - 手機另有一顆白框「Order Flowers」按鈕;底部置中向下箭頭。
   - **H1 必須是真實 HTML 文字**(SEO),不可做成圖片。
2. **一句話介紹**:kicker(服務地區)+ H2「Crafting beauty with flowers.」+ 一句話。桌面版為編輯式兩欄:左照片(背後錯位 `--color-surface` 色塊),右側右對齊標題與文字。文字極簡 — 一句即可。
3. **The Gallery 相牆**:masonry(CSS `column-count`,手機 2 欄 gap 10px / 桌面 3 欄 gap 16px),圖片保持原始比例,8–9 張。純圖無文字。
4. **The Collections**:四個分類卡(圖 + 名稱 + 羅馬數字),手機 2 欄 / 桌面 4 欄,整卡可點連到分類頁。
5. **Statement 帶**:滿版照片,象牙白卡片疊在上方(桌面寬 560px 置中上移 -220px;手機左右留邊上移 -80px),內容:「Made to order. Never off the shelf.」+「Serving DC · MD · VA · NC」+ 一顆按鈕。
6. **How to order**:兩張外框卡並排(手機堆疊):Weddings & Events(i. Let's meet ii. Plan & design iii. We style the day → Start a consultation)/ Signature Bouquets(i. Browse the collection ii. Message us your pick iii. Pick-up or delivery → View bouquets)。
7. **Order direct**:H2 + 一句「Message us — we reply the same day.」+ WhatsApp / WeChat / Instagram / Phone 外框按鈕列。
8. **Footer**:手機置中堆疊;桌面三欄(logo+一句 / Visit NAP / Order 連結)。NAP 每頁一致。

## RWD

- Hero 文字置中不變;桌面導覽 → 手機漢堡。
- 第 2 節桌面兩欄 → 手機單欄置中(色塊錯位效果手機可省略)。
- 相牆 3 欄 → 2 欄;collections 4 欄 → 2 欄;How to order 2 欄 → 堆疊。

## SEO 要點

- Title:`Sun Florist｜Bouquets · Preserved Florals · Weddings — DC, MD, VA, NC`(依關鍵字調整)。
- 唯一 H1 = "Sun Florist"(hero)。層級 h1 → h2 不跳級。
- Florist(LocalBusiness)JSON-LD 放本頁。
- Hero 圖不 lazy、`fetchpriority="high"`;相牆與以下全部 `loading="lazy"`。
