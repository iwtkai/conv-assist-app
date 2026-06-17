# Deploy to Cloudflare Pages

このプロジェクトのデプロイ手順を実行します。

## 手順

1. `npm run build` を実行してビルドエラーがないか確認する
2. エラーがあれば報告して停止する
3. ビルドが成功したら、現在の変更内容（`git diff`・`git diff --staged`・`git status`）を確認してユーザーに提示する
4. 日本語でコミットメッセージを作成し、ユーザーに内容を確認してからコミット・プッシュしてよいか聞く
5. 承認されたら `git add -u`・`git commit -m "コミットメッセージ"`・`git push origin main` を順に実行する（Cloudflare Pages に自動反映される）
6. 完了後にデプロイされる URL（https://convassist.app）を案内する

## 注意

- `vite.config.js` の `base` が `"/"` であることを確認し、異なる場合は `"/"` に修正してから続行すること
- 未コミットの変更がある場合は、コミット内容をユーザーと確認すること
