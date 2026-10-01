#!/usr/bin/env bash
#
# menu.sh - Menu interativo unificado do Workspace DSH (Linux / macOS / WSL)
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

show_header() {
  clear 2>/dev/null || true
  echo "=========================================================="
  echo "     Workspace DSH - Centro de Controle de IA"
  echo "=========================================================="
  echo ""
}

while true; do
  show_header
  echo " [1] Provisionar os 11 Plugins do DSH (setup-dsh-plugins)"
  echo " [2] Sincronizar Symlinks das Skills (sync-symlinks)"
  echo " [3] Buscar Skill por Palavra-Chave no Catálogo"
  echo " [4] Validar Conformidade da Skill (validate-skill)"
  echo " [0] Sair"
  echo ""
  read -rp "Escolha uma opção (0-4): " choice

  case "$choice" in
    1)
      show_header
      bash "${SCRIPT_DIR}/setup-dsh-plugins.sh"
      echo ""
      read -rp "Pressione Enter para continuar..."
      ;;
    2)
      show_header
      bash "${SCRIPT_DIR}/sync-symlinks.sh"
      echo ""
      read -rp "Pressione Enter para continuar..."
      ;;
    3)
      show_header
      read -rp "Digite o termo de busca (ex: video, ui, test, seo, caveman): " term
      if [ -n "$term" ]; then
        echo ""
        echo "Resultados encontrados no catálogo:"
        grep -i "$term" "${REPO_ROOT}/references/skills-catalog.md" || echo "Nenhum resultado."
      fi
      echo ""
      read -rp "Pressione Enter para continuar..."
      ;;
    4)
      show_header
      cd "${REPO_ROOT}"
      node "${SCRIPT_DIR}/validate-skill.mjs"
      echo ""
      read -rp "Pressione Enter para continuar..."
      ;;
    0)
      echo "Até logo!"
      exit 0
      ;;
    *)
      echo "Opção inválida."
      sleep 1
      ;;
  esac
done
