---
version: alpha
name: Dual Signal
description: 英語⇔日本語のリアルタイム会話支援ツール。ダークモードを基調にした「開発者ツール／シグナル処理」的な質感と、話す言語ごとに切り替わる二色アクセント（EN=青 / JA=紫）が特徴。
colors:
  bg: "#040711"
  surface: "#080f1e"
  surface-2: "#0d1628"
  surface-3: "#111e34"
  border: "rgba(255,255,255,0.10)"
  border-subtle: "rgba(255,255,255,0.06)"
  text-primary: "#f1f5f9"
  text-secondary: "#b8c5d6"
  text-muted: "#7a8fa8"
  text-ghost: "#364d66"
  primary: "#2563eb"
  primary-dark: "#1d4ed8"
  secondary: "#8652f3"
  secondary-dark: "#7c3aed"
  success: "#34d399"
  info: "#60a5fa"
  warning: "#f59e0b"
  error: "#f87171"
typography:
  label-mono:
    fontFamily: "JetBrains Mono"
    fontSize: 10px
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: 0.1em
  caption:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: 400
    lineHeight: 1.4
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.65
  body-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.85
  body-lg:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: 500
    lineHeight: 1.55
  button-label:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: 600
    letterSpacing: 0.02em
rounded:
  sm: 8px
  md: 12px
  lg: 16px
  xl: 20px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 20px
  "2xl": 28px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.sm}"
    padding: "{spacing.md}"
    typography: "{typography.button-label}"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "{spacing.lg}"
  chip:
    rounded: 4px
    typography: "{typography.label-mono}"
---

## Overview

Conv Assist は、英語話者との会話をリアルタイムで支援する音声アシスタントツール。ターゲットは「英会話中に一瞬詰まる瞬間を減らしたい」日本語話者で、UIは会議室でもカフェでもさっと開いて使える軽量さを重視する。

見た目のトーンは「静かなプロフェッショナルツール」。派手な装飾や強い彩度は避け、漆黒に近い背景（`bg`）の上に、必要な情報だけを浮かび上がらせる。装飾より情報密度を優先し、ラベル類は等幅フォント（`label-mono`）と広めのレタースペーシングで「計測機器・ターミナル」的な精度感を出す。

もっとも特徴的なのは **言語ごとのアクセント切り替え**：EN（相手の英語を聞く）モードは青（`primary`）、JA（自分の日本語を英訳する）モードは紫（`secondary`）。ユーザーが今どちらのモードにいるかを、色だけで即座に把握できるようにする。ダーク/ライト両テーマに対応し、`data-theme` 属性で切り替わる。

## Colors

パレットは「ほぼ黒に近い背景＋4段階のニュートラル面＋2つの言語アクセント＋3つのトーン評価色」で構成される。

- **bg (#040711):** アプリ全体の最背面。漆黒に近い紺。
- **surface / surface-2 / surface-3:** カード・入力欄・トグル等の階層を表す面色。数字が大きいほど明るく、手前に浮く。
- **text-primary 〜 text-ghost:** テキストの視覚的重要度を4段階で表現するニュートラルランプ（本文 → 補足 → キャプション → プレースホルダ）。
- **primary (#2563eb) / primary-dark (#1d4ed8):** EN モード（相手の英語を聞き取る）のアクセント。マイクボタンや解析ボタンのグラデーション（`primary-dark → primary`）に使用。白文字との組み合わせで WCAG AA（4.5:1）を満たすよう調整済み。
- **secondary (#8652f3) / secondary-dark (#7c3aed):** JA モード（自分の日本語を英訳する）のアクセント。役割は primary と同じで、モードが変わると同じ場所の色だけが切り替わる。同じくコントラスト調整済み。
- **success / info / warning:** 会話のトーン判定（casual / neutral / formal）に対応する評価色。トーン表示チップの背景・文字色に使う。
- **error (#f87171):** エラーメッセージ、音声認識非対応の警告表示。

ライトテーマでは `bg`〜`text-ghost` のニュートラル系のみを明るい配色に反転させ、アクセント・評価色はそのまま維持する（コントラストを保ちつつブランドの色相は変えない）。

| トークン | Dark | Light |
|---|---|---|
| bg | #040711 | #f5f7fa |
| surface | #080f1e | #ffffff |
| surface-2 | #0d1628 | #eef1f6 |
| surface-3 | #111e34 | #e4e9f2 |
| text-primary | #f1f5f9 | #0f172a |
| text-secondary | #b8c5d6 | #334155 |
| text-muted | #7a8fa8 | #64748b |
| text-ghost | #364d66 | #9aabbd |

## Typography

英語ラベル・数値・タイムスタンプ相当の要素には `JetBrains Mono` を使い、機器のような精密さを演出する（`label-mono`：10px・広いレタースペーシング・大文字トラッキング）。それ以外の本文・会話内容は `Inter` を主用し、和文は `Hiragino Sans` → `Noto Sans JP` → `Yu Gothic` の順にフォールバックする（`font-family: 'Inter', 'Hiragino Sans', 'Noto Sans JP', 'Yu Gothic', sans-serif`）。

- **label-mono:** セクション見出し、トーンラベル、コピーボタンなどのUIメタ情報。全て大文字・広いトラッキング。
- **caption / body-sm:** 補助説明、ボタン内の小さな文字。
- **body-md:** 利用規約・プライバシーポリシーなど長文の説明文（line-height 1.85 とゆったり取り、読みやすさを優先）。
- **body-lg:** 解析結果のメイン回答文（English response）。ユーザーが最終的に読み上げる／コピーする最重要テキストなので、他より一段大きく・太くする。
- **button-label:** ボタン内テキスト。13px・600ウェイト。

> **CJKタイポグラフィ対応（`.jp-text` ユーティリティ）:** 和文本文（プライバシーページ、ニュアンス解説、日本語訳）には `letter-spacing: 0.04em` と `font-feature-settings: "palt"`（プロポーショナル和文組版）を適用し、和欧混植時の詰まった印象を緩和している。`label-mono` や英語主体のUIラベルには適用しない。

## Layout

厳密なグリッドは持たず、**1カラムの縦積みレイアウト**（最大幅を持つ中央寄せカード群）で構成される。画面はモバイル〜デスクトップの単一ビューポートを想定し、レスポンシブブレークポイントは持たない軽量設計。

余白は 4px ベースのスケール（`spacing` トークン参照）に沿う：

- **xs (4px):** アイコンとテキストの間隔など最小単位
- **sm (8px):** チップ内側パディング、要素間の詰まった間隔
- **md (12px):** ボタン内側パディング、標準的なコンポーネント間隔
- **lg (16px):** カード内側パディング、セクション間の主要な間隔
- **xl (20px):** モーダル・シートの外側余白
- **2xl (28px):** プライバシーシートなど大きな塊の内側パディング

## Elevation & Depth

シャドウによる立体表現はほぼ使わず、**面の明度差**（surface → surface-2 → surface-3）と**1px の半透明ボーダー**（`border` / `border-subtle`）で階層を表現するフラット寄りの設計。例外はモーダル（`privacy-sheet`）のみで、`box-shadow: 0 24px 64px rgba(0,0,0,0.4)` を用いて前面レイヤーであることを強調する。

## Shapes

角丸は「柔らかいが子供っぽくならない」中間的な丸みで統一（`rounded` トークン参照）：

- **sm (8px):** ボタン、入力欄、トグルのトラック
- **md (12px):** カード全般（card, response-card）
- **lg (16px):** 大きめのセクションブロック
- **xl (20px):** プライバシーシートなどのモーダル
- **full (9999px):** ピル型ボタン（コーヒーを奢る、フィードバック等）、言語切り替えの丸トグル

例外として、トーンを示すラベルチップ（`label-tag`）のみ `4px` の小さめ角丸を使い、情報密度の高い「タグ」であることを視覚的に区別している。

## Components

- **button-primary（analyze-btn / mic-btn）:** 背景は単色ではなく `primary-dark → primary`（もしくは `secondary-dark → secondary`、アクティブな言語モードに追従）の斜めグラデーション。文字色は常に白、角丸は `rounded.sm`、パディングは `spacing.md`。ホバーで `opacity: 0.88` + わずかに浮き上がる。
- **card / response-card:** 背景 `surface`、ボーダー `border`、角丸 `rounded.md`、パディングは `spacing.lg` 前後。ホバーで `surface-2` に明るくなる。
- **chip（label-tag / トーン表示）:** 角丸 `4px`、`label-mono` タイポグラフィ、背景・文字色はトーン評価色（`success` / `info` / `warning`）の組み合わせ。
- **lang-tab（EN/JAトグル）:** アクティブ時は該当言語の `accent-dark` を背景に敷き、非アクティブ時は透明。単一コンポーネントが2つの言語アクセントを行き来する点が本デザインの核。
- **input（transcript / textarea）:** 背景は透明、枠線なし。プレースホルダーは `text-ghost`、入力中は `text-primary`、認識途中の中間テキストは `text-muted` で区別する。

## Do's and Don'ts

- Do: 言語モードの切り替えは色（青⇔紫）だけで判別できるようにする。アイコンや文言に頼りすぎない。
- Do: `label-mono` はUIのメタ情報（ラベル・タグ・ボタン内小文字）専用に限定し、本文には使わない。
- Do: ニュートラルランプ（`text-primary`〜`text-ghost`）で情報の重要度階層を表現し、新しい灰色を安易に増やさない。
- Don't: アクセント色（`primary` / `secondary`）を3つ目の役割に使わない。EN/JAの言語識別という役割を薄めてしまう。
- Don't: 角丸を混在させない。ボタン・カード・チップでそれぞれ決まった `rounded` トークンを守る。
- Don't: `body-lg`（解析結果のメイン回答）以外に太字・大きめサイズを多用しない。画面内の視線誘導が崩れる。

> **アクセシビリティ:** `primary` / `secondary` はいずれも白文字との組み合わせで WCAG AA の通常テキスト基準（4.5:1）を満たすよう調整済み（`design.md lint` で検証: primary 5.17:1, secondary 4.65:1）。今後アクセント色を変更する際は同様にコントラストを検証すること。
