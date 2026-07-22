#!/usr/bin/env bash
set -euo pipefail

npm install

curl -fsSL https://claude.ai/install.sh | bash

npm install -g @github/copilot

# gh CLI には copilot サブコマンドが組み込み済みのため、
# gh extension install github/gh-copilot は "built-in command" と衝突し失敗する。
