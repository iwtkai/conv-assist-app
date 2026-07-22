# Conv Assist

英会話をリアルタイムでサポートするWebアプリです。マイクで音声を拾い、AIが発言のニュアンス解説と返答例を即座に提示します。

---

## 使い方

### モードの選択

画面上部のタブで2つのモードを切り替えます。

| モード | 使うシーン |
|--------|-----------|
| **EN モード** 🇺🇸 | 相手の英語を聞き取って、どう返すか確認したいとき |
| **JA モード** 🇯🇵 | 自分の言いたい日本語を、自然な英語にしたいとき |

---

### EN モード（相手の英語を解析）

1. **録音ボタンをタップ**して、相手の英語を聞かせる
2. 発話が終わると自動で解析が始まる
3. 結果として以下が表示される
   - **NUANCE** — 相手の発言の意味・ニュアンス・文化的背景の解説（日本語）
   - **トーン** — カジュアル / ニュートラル / フォーマルの判定
   - **RESPONSE OPTIONS** — 自然な返答例3つ（英語 + 日本語訳）
4. 気に入った返答の **copy** ボタンでクリップボードにコピー

---

### JA モード（日本語を英語に変換）

1. **録音ボタンをタップ**して、言いたいことを日本語で話す
2. 自動で解析が始まる
3. 結果として以下が表示される
   - **INTENT CHECK** — 意図の確認（日本語）
   - **ENGLISH PHRASES** — 自然な英語フレーズ3つ（+ 日本語補足）
4. **copy** ボタンで英文をコピーして使う

---

### その他の操作

| 操作 | 説明 |
|------|------|
| **自動解析トグル** | ON のとき、発話後2秒で自動的に解析。OFF にすると「解析する」ボタンを押すまで待機 |
| **テキスト編集** | 書き起こしエリアの下部で誤認識を手動修正できる |
| **新しい録音を始める** | 結果をクリアして最初からやり直す |
| **☀️ / 🌙 ボタン** | ライト / ダークモードの切替。設定はブラウザに記憶される |

---

### ブラウザ要件

音声認識は **Chrome / Edge** のみ対応しています（Web Speech API）。Safari・Firefox では音声入力が使えません。

---

## 技術仕様

### スタック

| レイヤー | 技術 |
|----------|------|
| フロントエンド | React 18 + Vite |
| 音声認識 | Web Speech API（ブラウザネイティブ） |
| AI | Claude API（`claude-sonnet-4-20250514`） |
| プロキシ | Cloudflare Workers |
| デプロイ | Cloudflare Pages |

### アーキテクチャ

```
ブラウザ
  └─ Web Speech API（音声→テキスト）
       └─ Cloudflare Worker（プロキシ）
            └─ Anthropic API（Claude）
```

フロントエンドから直接 Anthropic API を呼ぶと API キーが露出するため、Cloudflare Workers をプロキシとして挟んでいます。

### AI プロンプト設計

解析結果は Claude に JSON 形式で返させています。

```json
{
  "nuance": "ニュアンス解説（日本語）",
  "tone": "casual | neutral | formal",
  "responses": [
    { "english": "返答例", "japanese": "日本語訳", "label": "ラベル" }
  ]
}
```

- EN モード：相手の英語 → ニュアンス解説 + 日本語返答案
- JA モード：自分の日本語 → 自然な英語フレーズ案

### テーマ

- ダーク / ライトモードを CSS カスタムプロパティ（`data-theme` 属性）で切替
- 初期値はシステムの `prefers-color-scheme` を自動参照
- 選択内容は `localStorage` に保存

---

## Claude Code での開発

[Claude Code](https://claude.ai/code) を使う場合、以下のスラッシュコマンドが利用できます。

| コマンド | 説明 |
|----------|------|
| `/run` | 開発サーバーを起動してブラウザで動作確認 |
| `/deploy` | ビルド確認 → 差分提示 → コミット確認 → `git push` を順次実行 |
| `/check-prompt [テキスト]` | `PROMPTS` オブジェクトをレビュー。テキストを渡すと期待動作をシミュレート |
| `/code-review` | コードレビュー（バグ・改善点の検出） |

---

## ローカル開発

```bash
npm install
npm run dev
```

`http://localhost:5173` でアクセスできます。

### ビルド & プレビュー

```bash
npm run build
npm run preview
```

### デプロイ（Cloudflare Pages）

```bash
git push origin main
```

Cloudflare Pages が自動でビルド・デプロイします。`vite.config.js` の `base` は `"/"` のままで問題ありません。

---

## GitHub Codespaces で開発

GitHub 上でリポジトリの **Code → Codespaces → Create codespace on main** から起動できます。`.devcontainer/devcontainer.json` により、起動時に `npm install` が自動実行されます。

Codespace 内のターミナルで以下を実行してください。

```bash
npm run dev
```

ポート `5173` が自動でフォワードされるので、「PORTS」タブに表示される URL（HTTPS）を開けばアクセスできます。マイク権限が必要な音声認識機能も、HTTPS 経由なので問題なく動作します（**Chrome / Edge** のみ対応。ブラウザの Codespaces 上でも同様）。

### GitHub Copilot / Claude Code / GitHub CLI

`.devcontainer/devcontainer.json` で以下を自動セットアップ済みです。

| ツール | 内容 |
|--------|------|
| **GitHub Copilot** | `GitHub.copilot` / `GitHub.copilot-chat` 拡張機能をプリインストール。Copilot ライセンスを持つ GitHub アカウントでサインインすれば利用可能 |
| **Claude Code** | `anthropic.claude-code` 拡張機能をプリインストール。加えて `postCreateCommand` で公式インストーラー（`curl -fsSL https://claude.ai/install.sh \| bash`）により CLI をセットアップ |
| **GitHub CLI（`gh`）** | devcontainer feature（`ghcr.io/devcontainers/features/github-cli`）で導入。Codespaces では自動的に認証済み |
| **GitHub Copilot CLI** | `postCreateCommand` で `gh extension install github/gh-copilot` を実行し、`gh copilot suggest` / `gh copilot explain` が使用可能 |

- **Claude Code**：初回起動時（`claude` コマンド実行、または拡張機能からの起動時）に Anthropic アカウントでのログインが必要です。ブラウザ認証のリンクが表示されるので、指示に従ってサインインしてください。
- **GitHub Copilot CLI**：Copilot ライセンスを持つアカウントであれば `gh auth login` 済みの状態（Codespaces では自動）で `gh copilot suggest "<やりたいこと>"` のように使えます。
