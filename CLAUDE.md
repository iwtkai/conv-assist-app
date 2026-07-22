# CLAUDE.md

このファイルは Claude Code (claude.ai/code) 向けのプロジェクト設定です。

## 言語ルール

- ユーザーとのやりとりは**必ず日本語**で行う。
- コミットメッセージは**必ず日本語**で記述する。
- PR のタイトル・本文も**必ず日本語**で記述する。

## Commands

```bash
npm run dev      # 開発サーバー起動 (http://localhost:5173)
npm run build    # 本番ビルド (dist/)
npm run preview  # ビルド結果をローカルプレビュー
```

テストフレームワークは未導入。動作確認はブラウザで行う（`/run` スキルを活用）。

デプロイは `git push origin main` のみ（Cloudflare Pages に自動反映）。

## アーキテクチャ

### データフロー

```
ブラウザ (Web Speech API)
  → src/App.jsx (React state)
    → Cloudflare Workers プロキシ (WORKER_URL)
      → Anthropic API (claude-sonnet-5)
        → JSON レスポンス → UI に表示
```

### ファイル構成

- **src/App.jsx** — アプリの UI が集約されたメインコンポーネント。CSS-in-JS（`<style>` タグに文字列で定義）を使用。音声認識まわりは `useSpeechRecognition` フックに切り出し済み。
- **src/useSpeechRecognition.js** — 音声認識（`SpeechRecognition`）のロジックを持つカスタムフック。`input`/`interim`/`listening`/`stopping`/`supported`/`error` と操作関数（`toggleListen`/`stopForReconfigure`/`resetInput`/`setInput`/`setError`）を返す。
- **src/theme.js** — `getInitialTheme()`（localStorage / `prefers-color-scheme` からテーマ初期値を決定）。App.jsx と LegalPage.jsx の両方から参照される共有ユーティリティ。
- **src/pages/LegalPage.jsx** — 法的ページ共通レイアウト。About / Terms / Privacy / Commercial がこれをラップする。
- **src/main.jsx** — React Router のルーティング設定のみ。

### 重要な実装ポイント

**プロキシ経由の API 呼び出し**：`WORKER_URL` 定数（App.jsx内）が Cloudflare Worker のエンドポイント。フロントから直接 Anthropic API を叩かないのは API キー保護のため。Worker URL を変更する場合はここだけ修正すればよい。

**音声認識の再初期化**：`SpeechRecognition` インスタンスは `langCode` と `autoAnalyze` の変更で再生成される（`useSpeechRecognition.js` 内 useEffect の依存配列）。音声認識まわりを変更する場合は、同ファイル内の `recognitionRef`・`silenceTimer`・`langRef`・`stopRequestedAtRef`・`stopTimeoutRef` の連携に注意。録音中に `lang`/`autoAnalyze` を変更する操作（言語タブ切替・自動解析トグル）は、フックが返す `stopForReconfigure()` を経由して停止すること（直接 `recognitionRef.current.stop()` を呼ぶと「停止処理中」の最低表示時間が保証されない）。

**プロンプト**：`PROMPTS` オブジェクト（App.jsx:24）に EN / JA 両モードのシステムプロンプトが定義されている。Claude への指示を変えたい場合はここを編集する。レスポンスは必ず `{ nuance, tone, responses[] }` の JSON 形式で返すよう指示されている。

**テーマ**：`data-theme` 属性（`light` / `dark`）を `<div>` のルートに付与し、CSS カスタムプロパティで切り替える。`localStorage` に保存され、初期値はシステムの `prefers-color-scheme` を参照。

**vite.config.js の `base`**：Cloudflare Pages では `"/"` のままで問題ない（GitHub Pages 運用時はリポジトリ名に合わせる必要があったが、現在は不要）。
