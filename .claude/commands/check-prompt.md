# Check AI Prompt

`src/App.jsx` の `PROMPTS` オブジェクトを確認・検証します。

## 手順

1. `src/App.jsx` の `PROMPTS` オブジェクト（`const PROMPTS = {`）を読み込む
2. EN モードと JA モードのプロンプトを並べて表示する
3. 以下の観点でレビューする：
   - JSON レスポンス形式（`nuance`, `tone`, `responses[]`）が明確に指示されているか
   - `tone` の値が `casual | neutral | formal` の3択に限定されているか
   - 日本語ユーザー向けのニュアンスが適切か
4. 改善案があれば提案する（ユーザーの承認なしに変更しない）

## 引数

`$ARGUMENTS` にテスト用の入力テキストが渡された場合は、そのテキストに対してプロンプトを適用したときの期待出力をシミュレートして見せる。
