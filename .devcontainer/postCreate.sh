#!/usr/bin/env bash
set -euo pipefail

npm install

curl -fsSL https://claude.ai/install.sh | bash

npm install -g @github/copilot

# コンテナ再ビルド時など既にインストール済みだと install が失敗するため upgrade にフォールバック
if ! gh extension install github/gh-copilot; then
  gh extension upgrade gh-copilot
fi
