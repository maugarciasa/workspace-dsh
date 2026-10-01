#!/usr/bin/env bash
#
# setup-dsh-plugins.sh - Instala dsh-agy e dsh-plugin-subscriptions no DSH (Linux / macOS)
#

set -euo pipefail

PROFILE_DIR="${HOME}/.dsh/profiles/web"

echo "==> Configurando plugins dsh-agy e dsh-plugin-subscriptions no DSH..."

mkdir -p "${PROFILE_DIR}"
cd "${PROFILE_DIR}"

if command -v pnpm &>/dev/null; then
  pnpm add dsh-agy@^0.4.0 dsh-plugin-subscriptions@^0.9.6
elif command -v npm &>/dev/null; then
  npm install dsh-agy@^0.4.0 dsh-plugin-subscriptions@^0.9.6
else
  echo "Erro: pnpm ou npm é necessário para instalar os plugins do perfil." >&2
  exit 1
fi

echo ""
echo "==> Plugins dsh-agy e dsh-plugin-subscriptions instalados com sucesso!"
echo "    Reinicie o DeepSeek Harness para aplicar as alterações."
