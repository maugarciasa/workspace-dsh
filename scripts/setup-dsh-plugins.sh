#!/usr/bin/env bash
#
# setup-dsh-plugins.sh - Provisiona todos os plugins do DSH (Linux / macOS)
#

set -euo pipefail

PROFILE_DIR="${HOME}/.dsh/profiles/web"

echo "==> Configurando ecossistema completo de plugins do DSH..."

mkdir -p "${PROFILE_DIR}"
cd "${PROFILE_DIR}"

PLUGINS=(
  "@dawsondx/dsh-web-open@^0.1.2"
  "@khalilhsu/dsh-ui-query-navigator@^0.1.1"
  "@linxin666/dsh-client-ui-skill-explorer@^0.4.2"
  "dsh-agy@^0.4.0"
  "dsh-better-sidebar@^0.21.1"
  "github:1841220388zzzcccxxx-star/dsh-git-graph"
  "github:tonnymoura/dsh-locale-pt-br"
  "dsh-plugin-subscriptions@^0.9.6"
  "dsh-undo-savepoint@^0.4.9"
)

if command -v pnpm &>/dev/null; then
  echo "Instalando plugins via pnpm..."
  pnpm add "${PLUGINS[@]}"
elif command -v npm &>/dev/null; then
  echo "Instalando plugins via npm..."
  npm install "${PLUGINS[@]}"
else
  echo "Erro: pnpm ou npm é necessário para instalar os plugins." >&2
  exit 1
fi

echo ""
echo "==> Todos os plugins foram instalados com sucesso!"
echo "    Reinicie o DeepSeek Harness para carregar as alterações."
