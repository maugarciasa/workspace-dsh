# Workspace DSH (Agent Skill)

[![Validate Agent Skill](https://github.com/maugarciasa/workspace-dsh/actions/workflows/validate.yml/badge.svg)](https://github.com/maugarciasa/workspace-dsh/actions/workflows/validate.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![OS: Linux | macOS | Windows](https://img.shields.io/badge/OS-Linux%20%7C%20macOS%20%7C%20Windows-blue)](https://github.com/maugarciasa/workspace-dsh)
[![Platform: Agent Skills](https://img.shields.io/badge/Standard-Agent%20Skills%20(skills.sh)-success)](https://skills.sh/)

> **Skill mestra de orquestração com mais de 120 skills indexadas, diretrizes comprovadas de economia de tokens (Caveman, Ponytail, Karpathy) e suporte nativo multiplataforma (Linux, macOS e Windows).**

Compatível com **Claude Code**, **DeepSeek Harness (DSH)**, **Cursor**, **Codex**, **Gemini CLI** e qualquer runtime aderente à especificação [Agent Skills](https://agentskills.io).

---

## 🚀 Instalação Rápida (Qualquer SO)

### 1. Via Gerenciador Oficial de Skills (Recomendado)
Funciona de forma idêntica no **Linux**, **macOS** e **Windows**:

```bash
npx skills add maugarciasa/workspace-dsh -g
```

### 2. Via Git Clone Manual
Caso prefira clonar diretamente na pasta de skills do seu usuário:

- **Linux / macOS / WSL:**
  ```bash
  git clone https://github.com/maugarciasa/workspace-dsh.git ~/.agents/skills/workspace-dsh
  ```
- **Windows (PowerShell):**
  ```powershell
  git clone https://github.com/maugarciasa/workspace-dsh.git "$HOME\.agents\skills\workspace-dsh"
  ```

---

## 🎯 O que este Hub resolve?

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

## 🛠️ Suporte Multiplataforma & Scripts Inclusos

### 🐧 Linux e 🍎 macOS
No Linux e Mac, você pode sincronizar as skills entre `~/.agents` e outros runtimes como o Claude Code (`~/.claude`) com o script Shell POSIX:

```bash
chmod +x scripts/sync-symlinks.sh
./scripts/sync-symlinks.sh
```

### 🪟 Windows
No Windows, os links simbólicos utilizam Junctions NTFS para evitar conflitos de caminhos longos:

```powershell
# Sincronizar Junctions NTFS com ~/.claude e ~/.dsh
pwsh -File scripts/sync-junctions.ps1

# Executar diagnóstico de saúde do ambiente (RTK, gh CLI, DSH e junctions)
pwsh -File scripts/test-environment.ps1
```

### ⚙️ Validação de Conformidade (CI)
O repositório inclui um validador de conformidade com a especificação [Agent Skills](https://agentskills.io) que roda nativamente em Node.js (e no GitHub Actions):

```bash
node scripts/validate-skill.mjs
```

---

## 📂 Estrutura de Arquivos

```
workspace-dsh/
├── SKILL.md                          # Ponto de entrada oficial da skill
├── README.md                         # Documentação e instruções de uso
├── LICENSE                           # Licença permissiva MIT
├── references/
│   ├── skills-catalog.md             # Catálogo consolidado das 120+ skills
│   ├── machine-rules.md              # Convenções de sessão (Caveman, Ponytail, Karpathy, RTK)
│   └── project-nallon.md             # Diretrizes de arquitetura para Next.js e Supabase
├── scripts/
│   ├── sync-symlinks.sh              # Sincronização para Linux/macOS (symlinks)
│   ├── sync-junctions.ps1            # Sincronização para Windows (junctions NTFS)
│   ├── test-environment.ps1          # Diagnóstico de integridade do ambiente
│   └── validate-skill.mjs            # Linter oficial de especificação Agent Skills
└── .github/workflows/
    └── validate.yml                  # CI automatizado no GitHub Actions
```

---

## 📄 Licença

Distribuído sob a licença [MIT](LICENSE).
