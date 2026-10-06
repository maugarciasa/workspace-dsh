#!/usr/bin/env bash
#
# install.sh - Instalador One-Liner do Workspace DSH para Linux, macOS e WSL.
# Uso: curl -fsSL https://raw.githubusercontent.com/maugarciasa/workspace-dsh/main/install.sh | bash
#

set -euo pipefail

# Falhar aqui com uma mensagem clara é melhor do que morrer num
# "git: command not found" no meio do passo 1.
for required in git node; do
  if ! command -v "${required}" >/dev/null 2>&1; then
    echo "Erro: '${required}' não encontrado no PATH. Instale e rode novamente." >&2
    exit 1
  fi
done

echo "=========================================================="
echo "    Instalador One-Liner do Workspace DSH (Linux / macOS) "
echo "=========================================================="
echo ""

TARGET_DIR="${HOME}/.agents/skills/workspace-dsh"
CLAUDE_DIR="${HOME}/.claude/skills/workspace-dsh"
DSH_DIR="${HOME}/.dsh/skills/workspace-dsh"
REPO_URL="https://github.com/maugarciasa/workspace-dsh.git"

# 1. Clonar ou atualizar repositório
if [ -d "${TARGET_DIR}" ]; then
  echo "[1/4] Repositório já presente em ${TARGET_DIR}. Atualizando..."
  git -C "${TARGET_DIR}" pull --ff-only || true
else
  echo "[1/4] Clonando workspace-dsh em ${TARGET_DIR}..."
  mkdir -p "$(dirname "${TARGET_DIR}")"
  git clone "${REPO_URL}" "${TARGET_DIR}"
fi

# 2. Criar Symlinks para Claude Code e DSH
echo "[2/4] Configurando symlinks para Claude Code e DSH..."
mkdir -p "$(dirname "${CLAUDE_DIR}")"
mkdir -p "$(dirname "${DSH_DIR}")"

rm -rf "${CLAUDE_DIR}" 2>/dev/null || true
ln -s "${TARGET_DIR}" "${CLAUDE_DIR}"

rm -rf "${DSH_DIR}" 2>/dev/null || true
ln -s "${TARGET_DIR}" "${DSH_DIR}"

# 3. Sincronizar catálogo geral de skills
echo "[3/4] Sincronizando catálogo geral de skills..."
chmod +x "${TARGET_DIR}/scripts/sync-symlinks.sh"
"${TARGET_DIR}/scripts/sync-symlinks.sh"

# 4. Perguntar sobre plugins do DSH se estiver rodando interativamente
echo ""
echo "[4/4] Ecossistema de Plugins do DeepSeek Harness (ChatGPT, AGY, etc.)"
if [ -t 0 ]; then
  read -rp "Deseja provisionar os 11 plugins do DSH agora? (S/N) [Padrão: S]: " install_plugins
  install_plugins=${install_plugins:-S}
  if [[ "${install_plugins}" =~ ^[sSyY]$ ]]; then
    chmod +x "${TARGET_DIR}/scripts/setup-dsh-plugins.sh"
    "${TARGET_DIR}/scripts/setup-dsh-plugins.sh"
  fi
else
  echo "Instalação não interativa detectada. Para provisionar plugins do DSH, execute:"
  echo "bash ${TARGET_DIR}/scripts/setup-dsh-plugins.sh"
fi

echo ""
echo "=========================================================="
echo "  Instalação concluída com sucesso!                      "
echo "  Abra o menu executando:                                "
echo "  bash ${TARGET_DIR}/scripts/menu.sh                    "
echo "=========================================================="
