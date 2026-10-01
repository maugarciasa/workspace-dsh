#!/usr/bin/env bash
#
# sync-symlinks.sh - Sincroniza skills de ~/.agents/skills para ~/.claude/skills e ~/.dsh/skills
# Suporte para Linux, macOS e WSL.
#

set -euo pipefail

AGENTS_DIR="${HOME}/.agents/skills"
CLAUDE_DIR="${HOME}/.claude/skills"
DSH_DIR="${HOME}/.dsh/skills"

echo "==> Iniciando sincronização de symlinks de skills..."

if [ ! -d "${AGENTS_DIR}" ]; then
  echo "Erro: Diretório de origem não encontrado: ${AGENTS_DIR}" >&2
  exit 1
fi

mkdir -p "${CLAUDE_DIR}"
mkdir -p "${DSH_DIR}"

created_claude=0
created_dsh=0
existing=0

for skill_path in "${AGENTS_DIR}"/*; do
  [ -d "${skill_path}" ] || continue
  skill_name="$(basename "${skill_path}")"

  # Link Claude Code
  claude_target="${CLAUDE_DIR}/${skill_name}"
  if [ -L "${claude_target}" ]; then
    existing=$((existing + 1))
  elif [ -e "${claude_target}" ]; then
    echo "Aviso: '${claude_target}' já existe e não é symlink. Pulando."
  else
    ln -s "${skill_path}" "${claude_target}"
    created_claude=$((created_claude + 1))
  fi

  # Link DSH
  dsh_target="${DSH_DIR}/${skill_name}"
  if [ -L "${dsh_target}" ]; then
    :
  elif [ -e "${dsh_target}" ]; then
    :
  else
    ln -s "${skill_path}" "${dsh_target}"
    created_dsh=$((created_dsh + 1))
  fi
done

echo ""
echo "==> Sincronização concluída:"
echo "    - Symlinks criados em ~/.claude/skills: ${created_claude}"
echo "    - Symlinks criados em ~/.dsh/skills:    ${created_dsh}"
echo "    - Links já existentes verificados:     ${existing}"
