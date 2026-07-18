# Sun Florist — Design System 規格

> 視覺方向:Classical(書卷式、精品編輯感)。參考設計稿:`Sun Florist Home v2.dc.html`、`Sun Florist Collections.dc.html`、`Sun Florist Pages.dc.html`。
> 本文件描述 layout / CSS / RWD 原則,供 Astro 靜態站實作。

## 1. 色彩 Tokens

| Token | 值 | 用途 |
|---|---|---|
| `--color-bg` | `#ffffff` | 全站頁面背景(純白) |
| `--color-surface` | `#f5f3ef` | 次要底色(卡片內襯、色塊) |
| `--color-text` | `#201f1d` | 主要文字(近黑暖墨色) |
| `--color-accent` | `#b68235` | 金色 — 只用於「描邊、細線、底線」,不做大面積填色 |
| `--color-accent-700` | `#7d5411` | 內文尺寸的金色文字(對比度足夠) |
| `--color-divider` | `rgba(32,31,29,0.16)` | 髮絲分隔線 |
| 深色段落底 | `#232019` | 首頁 statement 深色帶(唯一深色區塊) |

原則:**顏色以線條呈現,不以色塊呈現**。按鈕是金色外框、透明底;卡片是 1px 邊框、無填色。大面積只允許白、`#f5f3ef`、`#232019` 三種。

## 2. 字體

- 標題:**Cormorant Garamond**(Google Fonts),400/600。尺寸越大字重越輕 — display 級用 400,小標用 600。不用 bold。
- 內文:**Lora**,400/600。
- 中文不適用此站(全英文)。
- 數字作為編號/價格時開 `font-feature-settings: 'tnum'`。
- 字級參考:H1 手機 40px / 桌面 56px(hero 主標可到 104px);H2 30/38px;內文 14–16px;kicker 11px 全大寫 `letter-spacing: 0.14–0.18em`。
- `font-display: swap` 必開。

## 3. 間距與圓角

- spacing scale(1.15× 密度):4.6 / 9.2 / 13.8 / 18.4 / 27.6 / 36.8px,對應 `--space-1..8`。
- 圓角:`--radius-sm 2px / md 4px / lg 7px`,只用於按鈕與卡片,圖片一律直角。
- 版心:桌面內距 36.8px(`--space-8`),大 section 間距 88px;手機內距 18.4px。

## 4. 元件

### 按鈕
- Primary:1px 金色邊框、金色字、透明底、radius 4px、`letter-spacing 0.06em`;hover 淡金底(12% accent)。**絕不做實心填色按鈕**(深色照片上例外:白色 1px 外框、白字)。
- Secondary:1px divider 邊框。
- Ghost:純文字金色 + 底線。
- 手機主要 CTA 可 `btn-block` 滿寬,高度 ≥ 44px(觸控目標)。

### 導覽 Nav
- 桌面:左 logo(高 36px),右側文字連結(14px)+ 一顆外框 Contact 按鈕;底部 1px divider。
- 手機:左 logo(高 32px),右側兩條細線漢堡(觸控區 ≥ 44px)。
- Hero 疊圖時:logo 與連結轉白色(logo 用 `filter: brightness(0) invert(1)`),無底線。

### 圖片
- **無邊框、無濾鏡、無圓角**,乾淨滿版 `object-fit: cover`。
- 一律標明 `width`/`height` 防 CLS;首屏外 `loading="lazy"`;hero 主圖 `fetchpriority="high"`。
- WebP + srcset(詳見 SEO 規格文件)。

### 分隔與節奏
- Section 標題套路:kicker(11px 大寫灰)→ H2 → 44–56px 金色細線(1px)置中。
- 列表用髮絲線分隔(1px divider),不重底色。
- 編號用小寫羅馬數字(i. ii. iii.)金色,呼應書卷感。

## 5. 互動狀態

- 所有互動元素要有 hover(淡金底或金色文字)與 `:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 2px; }`。
- 連結預設無底線、hover 轉 `--color-accent-700`。

## 6. RWD 原則

- **Mobile-first**,單一斷點策略:`min-width: 768px` 進平板/桌面,`min-width: 1100px` 進寬版(版心 max-width 1280px 置中)。
- 手機:單欄堆疊、置中排版;桌面:左右分欄(hero、about、product detail 均為兩欄 grid)。
- 網格:collections 手機 1–2 欄 → 桌面 2×2 或 4 欄;商品列表手機 2 欄 → 桌面 3 欄;相牆 masonry 手機 2 欄 → 桌面 3 欄(CSS `column-count`)。
- 觸控目標 ≥ 44px。
- Hero 高度:`100dvh`(手機用 dvh 避免網址列跳動)。

## 7. 圖示

- Lucide(https://lucide.dev)線條圖示,`currentColor`,僅在必要時使用(選單、箭頭、聯絡渠道)。整體風格以文字與數字為主,少用圖示。
