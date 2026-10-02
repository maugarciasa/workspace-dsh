# Workspace DSH (Agent Skill & Environment Kit)

[![Release: v1.1.0](https://img.shields.io/badge/Release-v1.2.0-blue.svg)](https://github.com/maugarciasa/workspace-dsh/releases/tag/v1.2.0)
[![Validate Agent Skill](https://github.com/maugarciasa/workspace-dsh/actions/workflows/validate.yml/badge.svg)](https://github.com/maugarciasa/workspace-dsh/actions/workflows/validate.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![OS: Linux | macOS | Windows](https://img.shields.io/badge/OS-Linux%20%7C%20macOS%20%7C%20Windows-blue)](https://github.com/maugarciasa/workspace-dsh)
[![Platform: Agent Skills](https://img.shields.io/badge/Standard-Agent%20Skills%20(skills.sh)-success)](https://skills.sh/)

> **Skill mestra de orquestração com mais de 120 skills indexadas, diretrizes comprovadas de economia de tokens (Caveman, Ponytail, Karpathy) e provisionamento completo dos plugins do DeepSeek Harness (DSH).**

Compatível com **DeepSeek Harness (DSH)**, **Claude Code**, **Cursor**, **Codex**, **Gemini CLI** e qualquer runtime aderente à especificação [Agent Skills](https://agentskills.io).

---

## ⚡ Instalação One-Liner em 1 Comando (Novo Computador)

Para configurar sua máquina do zero (clonar skill, criar links simbólicos e provisionar plugins):

### 🪟 No Windows (PowerShell):
```powershell
irm https://raw.githubusercontent.com/maugarciasa/workspace-dsh/main/install.ps1 | iex
```

### 🐧 No Linux / 🍎 macOS / WSL (Terminal):
```bash
curl -fsSL https://raw.githubusercontent.com/maugarciasa/workspace-dsh/main/install.sh | bash
```

---

## 🚀 Instalação Alternativa (Gerenciador Oficial / Manual)

### 1. Via Gerenciador Oficial de Skills (Recomendado)
Funciona de forma idêntica no **Linux**, **macOS** e **Windows**:

```bash
npx skills add maugarciasa/workspace-dsh -g
```

### 2. Via Git Clone Manual
Caso prefira clonar diretamente na pasta de skills do usuário:

- **Linux / macOS / WSL:**
  ```bash
  git clone https://github.com/maugarciasa/workspace-dsh.git ~/.agents/skills/workspace-dsh
  ```
- **Windows (PowerShell):**
  ```powershell
  git clone https://github.com/maugarciasa/workspace-dsh.git "$HOME\.agents\skills\workspace-dsh"
  ```

---

## 🔌 Ecossistema de Plugins do DeepSeek Harness (DSH)

Este repositório inclui a receita completa de automação para provisionar todos os **11 plugins** que equipam o DeepSeek Harness desta máquina (sem carregar credenciais pessoais ou tokens privados):

| Plugin | Origem / Versão | O que faz no DSH |
| :--- | :--- | :--- |
| **`dsh-plugin-subscriptions`** | npm (`^0.9.6`) | Roteia suas assinaturas existentes (**ChatGPT**, **Claude**, **Grok**, **Copilot**) para o DSH via OAuth Web Settings. |
| **`dsh-agy`** | npm (`^0.4.0`) | Google Antigravity OAuth, pool multi-contas, rotação automática contra 429 e device fingerprinting. |
| **`dsh-locale-pt-br`** | GitHub (`tonnymoura`) | Tradução completa da interface Web do DeepSeek Harness para Português do Brasil. |
| **`dsh-undo-savepoint`** | npm (`^0.4.9`) | Snapshots automáticos de configuração/plugins, rollback com 1 clique (`undo_restore`) e safe mode. |
| **`dsh-better-sidebar`** | npm (`^0.21.1`) | Barra lateral aprimorada com pinning, organização por projetos e busca rápida. |
| **`dsh-git-graph`** | GitHub (`1841220388zzzcccxxx-star`) | Visualizador gráfico interativo da árvore de branches e commits do Git na GUI. |
| **`@linxin666/dsh-client-ui-skill-explorer`** | npm (`^0.4.2`) | Skill Center visual na barra lateral para navegar, ativar, desativar e criar skills. |
| **`@dawsondx/dsh-web-open`** | npm (`^0.1.2`) | Botão na interface para abrir links web, portas locais e documentações no navegador padrão. |
| **`@khalilhsu/dsh-ui-query-navigator`** | npm (`^0.1.1`) | Navegador de histórico de perguntas, prompts anteriores e sessões de chat. |
| **`dsh-distill-ui`** | Patch Cordis (v1.8.0) | Interface destilada: agrupamento limpo em bloco único, filtro de falhas, atalhos (Alt+Z/X) e painel de tarefas lapidado (/frontend-design). |
| **`dsh-credits-hero`** | Patch Cordis | Indicador visual de cotas/créditos das contas de IA na página inicial. |

### ⚡ Como Provisionar os Plugins do DSH em 1 Clique:
```powershell
# No Windows (PowerShell):
pwsh -File scripts/setup-dsh-plugins.ps1

# No Linux / macOS:
bash scripts/setup-dsh-plugins.sh
```
Veja o guia detalhado em [`references/dsh-plugins.md`](references/dsh-plugins.md).

---

## 🎯 O que a Skill de IA resolve?

1. **Roteamento Inteligente (120+ Skills):** Matriz de decisão rápida que indica exatamente qual skill usar para cada objetivo (frontend com Shadcn, vídeos com HyperFrames, banco de dados Supabase/Postgres, testes com Playwright, SEO/GEO, etc.).
2. **Eficiência Drástica de Tokens:**
   - **Caveman Mode (`full`):** Respostas técnicas ultracompactas no chat, poupando até 60% de tokens sem perder rigor.
   - **Ponytail (`full`):** Filosofia anti-overengineering (recursos nativos e stdlib antes de adicionar pacotes, código mínimo, YAGNI).
   - **Karpathy Guidelines:** Pensar antes de codar, explicitar premissas, mudanças cirúrgicas e validação por testes verificáveis.
3. **Catálogo Exaustivo:** Lista detalhada em [`references/skills-catalog.md`](references/skills-catalog.md) com status de cada ferramenta.
4. **Segurança de Git & Código:** Regras duras de proteção de branch (`main` protegida, proibição de push forçado, commits atômicos).

---

## 🧭 Guia Rápido por Intenção ("Quero fazer X, qual skill usar?")

| Objetivo Imediato | Skill Recomendada | Benefício Prático |
| :--- | :--- | :--- |
| **Criar Reels ou vídeo de lançamento narrado** | `brag-instagram` / `brag` | Gera vídeo 1080x1920 com fala em pt-BR e legendas sincronizadas. |
| **Criar UI moderna com Tailwind & Shadcn** | `shadcn` + `frontend-design` | Componentes acessíveis, tokens coerentes e estética refinada. |
| **Adicionar animações e micro-interações** | `animate` / `apple-design` | Transições físicas com springs, respeitando `reduced-motion`. |
| **Investigar um bug misterioso ou regressão** | `systematic-debugging` | Isola causa raiz e formula hipóteses antes de tocar no código. |
| **Refatorar sem quebrar funcionalidades** | `safe-refactor` + `test-driven-development` | Cobertura com testes de aprovação antes de qualquer reescrita. |
| **Eliminar código inflado e abstrações inúteis** | `ponytail-review` / `ponytail-audit` | Localiza overengineering e simplifica a base de código. |
| **Poupar tokens e ter respostas ágeis no chat** | `caveman` | Estilo telegráfico e econômico na saída do LLM. |
| **Postgres, Migrações e RLS no Supabase** | `supabase-postgres-best-practices` | Schemas declarativos seguros e funções fechadas por padrão. |
| **Testes ponta a ponta (E2E) no navegador** | `playwright-best-practices` / `webapp-testing` | Page Objects resilientes e mocks sem flakiness. |
| **Auditoria completa de SEO e AI Overviews** | `seo` + `seo-geo` | Prontidão técnica para Google, Perplexity e ChatGPT Search. |

---

## 🛠️ Scripts Utilitários Inclusos

- **`scripts/menu.ps1` / `.sh`**: **Menu interativo unificado** no terminal com diagnóstico, busca, setup e sincronização.
- **`scripts/setup-dsh-plugins.ps1` / `.sh`**: Instalação e provisionamento de todos os plugins do DSH.
- **`scripts/test-environment.ps1`**: Diagnóstico de integridade do ambiente (RTK, gh CLI, DSH, junctions e branches).
- **`scripts/sync-junctions.ps1`**: Criação automática de Junctions NTFS para Windows.
- **`scripts/sync-symlinks.sh`**: Sincronização automática de symlinks para Linux, macOS e WSL.
- **`scripts/validate-skill.mjs`**: Linter oficial de conformidade da especificação [Agent Skills](https://agentskills.io).
- **`evals/evals.json`**: Suíte de avaliação e benchmarks de orquestração.

---

## 📂 Estrutura de Arquivos

```
workspace-dsh/
├── SKILL.md                          # Ponto de entrada oficial da skill
├── README.md                         # Documentação completa e instruções de uso
├── install.ps1                       # Instalador One-Liner para Windows
├── install.sh                        # Instalador One-Liner para Linux/macOS                         # Documentação completa e instruções de uso
├── LICENSE                           # Licença permissiva MIT
├── evals/
│   └── evals.json                    # Cenários de teste e avaliação oficial de skills
├── plugins/                          # Plugins locais de UI do DeepSeek Harness
│   ├── dsh-credits-hero/             # Chip indicador de cotas/créditos ChatGPT/Codex na home
│   └── dsh-distill-ui/               # Interface destilada com tool batching em bloco único
├── references/
│   ├── dsh-plugins.md                # Guia de todos os 11 plugins do DSH
│   ├── skills-catalog.md             # Catálogo consolidado das 120+ skills
│   ├── machine-rules.md              # Convenções de sessão (Caveman, Ponytail, Karpathy, RTK)
│   └── project-nallon.md             # Diretrizes de arquitetura para Next.js e Supabase
├── scripts/
│   ├── menu.ps1                      # Menu interativo unificado (Windows)
│   ├── menu.sh                       # Menu interativo unificado (Linux/macOS)
│   ├── setup-dsh-plugins.ps1         # Provisionador de plugins do DSH (Windows)
│   ├── setup-dsh-plugins.sh          # Provisionador de plugins do DSH (Linux/macOS)
│   ├── sync-symlinks.sh              # Sincronização de symlinks para Linux/macOS
│   ├── sync-junctions.ps1            # Sincronização de junctions NTFS para Windows
│   ├── test-environment.ps1          # Diagnóstico de integridade do ambiente
│   └── validate-skill.mjs            # Linter oficial de conformidade de skills
└── .github/workflows/
    └── validate.yml                  # CI automatizado no GitHub Actions
```

---

## 📄 Licença

Distribuído sob a licença [MIT](LICENSE).
