# Workspace DSH (Agent Skill & Environment Kit)

[![Release: v1.2.1](https://img.shields.io/badge/Release-v1.2.1-blue.svg)](https://github.com/maugarciasa/workspace-dsh/releases/tag/v1.2.1)
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
| **`dsh-better-sidebar`** | npm (`^0.24.1`) | Barra lateral aprimorada com pinning, organização por projetos e busca rápida. O pino precisa acompanhar o runtime do DSH — ver [nota de compatibilidade](#compatibilidade-do-dsh-better-sidebar). |
| **`dsh-git-graph`** | GitHub (`1841220388zzzcccxxx-star`) | Visualizador gráfico interativo da árvore de branches e commits do Git na GUI. |
| **`@linxin666/dsh-client-ui-skill-explorer`** | npm (`^0.4.2`) | Skill Center visual na barra lateral para navegar, ativar, desativar e criar skills. |
| **`@dawsondx/dsh-web-open`** | npm (`^0.1.2`) | Botão na interface para abrir links web, portas locais e documentações no navegador padrão. |
| **`@khalilhsu/dsh-ui-query-navigator`** | npm (`^0.1.1`) | Navegador de histórico de perguntas, prompts anteriores e sessões de chat. |
| **`dsh-distill-ui`** | Local (`file:plugins/dsh-distill-ui`, v1.9.0) | Interface destilada: agrupamento limpo em bloco único, filtro de falhas, atalhos (Alt+Z/X) e painel de tarefas lapidado (/frontend-design). |
| **`dsh-credits-hero`** | Local (`file:plugins/dsh-credits-hero`) | Indicador visual de cotas/créditos das contas de IA na página inicial. Depende do `dsh-plugin-subscriptions`. |

### 🧷 Compatibilidade do `dsh-better-sidebar`

O plugin consome o módulo `@deepseek-ai/dsh-client-ui-primitives` servido pelo próprio DSH, e a
API de ícones mudou **duas vezes** — por isso o pino é **`^0.24.1`**:

| Versão do plugin | Primitivas exigidas | Nomes dos ícones | DSH compatível |
| :--- | :--- | :--- | :--- |
| `~0.19.1` | `^0.1.5-rc.1` | `IconCodeOutline16`, `IconChevronRightOutline14`, ... | DSH 0.1.5.x |
| `0.21.x` – `0.22.x` | `^0.1.7-rc.1` | `IconCodeOutlineRegular`, `IconChevronRightOutlineRegular`, ... | DSH 0.1.7.x – 0.1.x |
| `^0.24.1` (fixado) | `^0.2.0-rc.1` | `IconCodeOutlineRegular`, `IconChevronRightOutlineRegular`, ... | DSH >= 0.2.0 |

O detalhe que engana: `^0.1.5-rc.1` e `^0.1.7-rc.1` significam `>=0.1.x-rc.1 <0.2.0-0`, e
`0.2.0-rc.2` **não** satisfaz esse intervalo (prerelease compare antes do release). Ou seja,
num DSH 0.2.x os pins antigos falham no gate de peers **e** os ícones `…16`/`…14` chegam como
`undefined`, quebrando o painel direito com `Minified React error #130` ao clicar em
**Open** / **Preview** de um arquivo.

O DSH valida isso sozinho (`evaluatePluginCompatibility`): quando os peers não batem, ele imprime
`dsh: disabling profile plugin <linha>: <motivo>` e **desabilita o plugin no boot**. Sem um
`compatibility.json` no perfil, não há isenção.

Regra prática: alinhe o pino com o runtime. Rode `dsh --version` e use a linha cuja coluna
"DSH compatível" contém a sua versão — para `0.2.x`, é `^0.24.1`.

### ⚡ Como Provisionar os Plugins do DSH em 1 Clique:
```powershell
# No Windows (PowerShell 7 ou Windows PowerShell 5.1):
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/setup-dsh-plugins.ps1

# No Linux / macOS:
bash scripts/setup-dsh-plugins.sh
```
Veja o guia detalhado em [`references/dsh-plugins.md`](references/dsh-plugins.md).

#### Pré-requisitos

| Requisito | Por quê |
| :--- | :--- |
| **DSH instalado** | O script escreve no perfil do DSH. Ele detecta o alvo via `DSH_PROFILE_DIR`. |
| **`git`** | `install.ps1` cria o clone inicial. O instalador procura o Git também fora do PATH. |
| **`node` + (`pnpm` ou `npm`)** | Instala as dependências do perfil. O `pnpm` do runtime do DSH é usado quando disponível. |
| **PowerShell 7 (`pwsh`) *ou* 5.1** | Os scripts resolvem o que existir; `pwsh` não é obrigatório. |

> ⚠️ **Perfil alvo:** os scripts escrevem em `DSH_PROFILE_DIR` quando ela existe (o app Electron
> usa `desktop`; instalações via CLI usam `web`). Se o alvo não for o perfil ativo, o script avisa
> — provisionar no perfil errado não dá erro, apenas nenhum plugin aparece.

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
- **`scripts/test-environment.ps1`**: Diagnóstico de integridade do ambiente — versão e perfil ativo do DSH, pin do `dsh-better-sidebar`, manifesto do perfil (BOM), RTK, gh CLI, git, junctions e branch atual.
- **`scripts/sync-junctions.ps1`**: Criação automática de Junctions NTFS para Windows.
- **`scripts/sync-symlinks.sh`**: Sincronização automática de symlinks para Linux, macOS e WSL.
- **`scripts/validate-skill.mjs`**: Linter oficial de conformidade da especificação [Agent Skills](https://agentskills.io).
- **`scripts/check-dsh-compat.mjs`**: Guard de CI que exige pino de plugin consistente entre plataformas, perfil resolvido por `DSH_PROFILE_DIR` e ausência de dependência de `pwsh`.
- **`evals/evals.json`**: Suíte de avaliação e benchmarks de orquestração.

---

## 📂 Estrutura de Arquivos

```
workspace-dsh/
├── SKILL.md                          # Ponto de entrada oficial da skill
├── README.md                         # Documentação completa e instruções de uso
├── install.ps1                       # Instalador One-Liner para Windows
├── install.sh                        # Instalador One-Liner para Linux/macOS
├── LICENSE                           # Licença permissiva MIT
├── evals/
│   └── evals.json                    # Cenários de teste e avaliação oficial de skills
├── plugins/                          # Plugins locais de UI, instalados como dependência `file:` do perfil
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
│   ├── check-dsh-compat.mjs          # Guard de CI: pinos de plugin e perfil alvo
│   └── validate-skill.mjs            # Linter oficial de conformidade de skills
└── .github/workflows/
    └── validate.yml                  # CI automatizado no GitHub Actions
```

---

## 📄 Licença

Distribuído sob a licença [MIT](LICENSE).
