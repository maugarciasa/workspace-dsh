---
name: workspace-dsh
description: Use when needing an overview, routing, or execution guidance across all installed skills (120+), machine conventions (Caveman, Ponytail, Karpathy, RTK, Jev), and local workspace configurations on this machine.
---

# Workspace DSH: Guia Mestre de Skills e Ambiente Local (Mau)

Este skill centraliza a orquestração de **todas as 120 skills instaladas**, as **convenções obrigatórias de sessão** e a **arquitetura do ambiente de desenvolvimento** desta máquina.

---

## 1. Regras de Ouro da Máquina (Execução Obrigatória)

Ao iniciar tarefas nesta máquina, aplique as regras vigentes documentadas em `references/machine-rules.md`:

1. **Caveman (`full`):**
   - Ativar em todas as sessões desde a primeira resposta (`caveman full`).
   - Economiza tokens no diálogo; prosa técnica normal em código, commits e documentação.
2. **Ponytail (`full`):**
   - Ativar na primeira tarefa de código da sessão.
   - Soluções minimalistas, YAGNI, preferir stdlib e recursos nativos a novas dependências.
3. **Karpathy Guidelines:**
   - **Pensar antes de codar:** Enunciar premissas; parar e perguntar antes de assumir ambiguidades.
   - **Simplicidade:** Se 200 linhas cabem em 50, reescrever. Zero complexidade especulativa.
   - **Mudança cirúrgica:** Não tocar no que não quebrou; não apagar código alheio sem ordem direta.
   - **Meta verificável:** Critério de aprovação com testes automatizados antes e depois.
4. **Segurança de Git:**
   - **Nunca commitar ou dar push direto na `main`**.
   - Criar sempre branch temática (`feature/`, `fix/`, etc.) + Pull Request + Squash Merge.
5. **RTK (Rust Token Killer):**
   - CLI proxy configurado via hook global. Comandos de terminal têm saída filtrada para poupar contexto.

---

## 2. Matriz Rápida de Roteamento de Skills

Para consultar o catálogo exaustivo com as 120 skills, veja [`references/skills-catalog.md`](references/skills-catalog.md).

| Tipo de Tarefa | Skills Primárias Recomendadas |
| :--- | :--- |
| **Planejar feature / arquitetura** | `brainstorming` → `writing-plans` → `using-superpowers` |
| **Executar plano passo a passo** | `executing-plans` ou `subagent-driven-development` |
| **Investigar bug ou comportamento anômalo** | `systematic-debugging` ou `investigate-first` |
| **Desenvolver feature com TDD** | `test-driven-development` |
| **Auditar código contra complexidade** | `ponytail-review` e `ponytail-audit` |
| **Frontend, UI, Componentes & Estilo** | `shadcn`, `frontend-design`, `impeccable`, `emil-design-eng` |
| **Animações e Motion na Web** | `animate`, `animation-vocabulary`, `find-animation-opportunities` |
| **Banco de Dados (Postgres / Supabase)** | `supabase`, `supabase-postgres-best-practices`, `migration` |
| **Testes E2E e Navegador** | `playwright-best-practices`, `webapp-testing` |
| **Produção de Vídeo & Launch Video** | `hyperframes`, `brag`, `brag-instagram`, `motion-graphics` |
| **Segurança e Health Check Geral** | `security-audit`, `audit-project` |
| **Classificação de Dados / Decisões Semânticas** | MCP `jev` ou skill local `jev-classificar` |
| **Criar ou Refatorar Skills** | `writing-skills` |

---



---

## 3. Guia Rápido por Intenção ("Quero fazer X, qual skill usar?")

| Sua Intenção Imediata | Chame esta Skill | Como Executar / Dica Prática |
| :--- | :--- | :--- |
| **Criar um Reels ou vídeo de lançamento narrado** | `brag-instagram` ou `brag` | Gera um Reels 1080x1920 com narração pt-BR e legendas automáticas direto do código. |
| **Desenhar UI moderna com Shadcn/Tailwind** | `shadcn` e `frontend-design` | Adiciona componentes acessíveis, presets e tokens de design sem visual genérico. |
| **Adicionar animações ou micro-interações fluidas** | `animate` ou `apple-design` | Constrói animações com físicas reais, springs e respeito a `reduced-motion`. |
| **Investigar um bug misterioso ou falha em teste** | `systematic-debugging` | Estabelece hipóteses, isola a causa raiz antes de propor ou alterar qualquer linha. |
| **Refatorar código existente com garantia total** | `safe-refactor` + `test-driven-development` | Protege o comportamento externo com testes antes de mover ou reescrever funções. |
| **Eliminar código inflado e overengineering** | `ponytail-review` ou `ponytail-audit` | Localiza abstrações inúteis, bibliotecas reinventadas e aplica YAGNI agressivo. |
| **Poupar tokens e ter respostas telegráficas** | `caveman` (modo `full`) | Corte de até 60% de tokens no chat sem perder precisão técnica. |
| **Trabalhar com banco Postgres / Supabase / RLS** | `supabase-postgres-best-practices` | Escreve migrations limpas, RLS rigorosas e RPCs com permissões fechadas por padrão. |
| **Testar a UI e fluxos de ponta a ponta no browser** | `playwright-best-practices` ou `webapp-testing` | Page Object Models resilientes, mocks de APIs e testes E2E sem flakiness. |
| **Classificar leads, mensagens ou e-mails** | `jev-classificar` | Classificação semântica de alta precisão com suporte do classificador Jev. |
| **Otimizar SEO para Google e AI Overviews (GEO)** | `seo` e `seo-geo` | Auditoria técnica de indexabilidade, Core Web Vitals, Schema.org e citabilidade por LLMs. |
| **Criar ou testar uma nova skill para agentes** | `writing-skills` | Aplica o ciclo RED-GREEN-REFACTOR em documentações para agentes autônomos. |

## 4. Gestão e Sincronização de Skills por Sistema Operacional

As skills residem nativamente em `~/.agents/skills` (padrão universal multiplataforma). Como alguns runtimes (ex: Claude Code) leem primariamente de `~/.claude/skills`, mantemos links simbólicos automáticos.

### No Linux e macOS:
Utilize o script Bash incluído para criar os links simbólicos de uma vez:
```bash
chmod +x scripts/sync-symlinks.sh
./scripts/sync-symlinks.sh
```
Ou manualmente para uma skill específica:
```bash
ln -s ~/.agents/skills/<nome> ~/.claude/skills/<nome>
```

### No Windows:
Utilize o script PowerShell incluído para criar Junctions NTFS:
```powershell
pwsh -File scripts/sync-junctions.ps1
```
Ou manualmente para uma skill específica:
```powershell
New-Item -ItemType Junction -Path "$HOME\.claude\skills\<nome>" -Target "$HOME\.agents\skills\<nome>"
```

---

## 5. Documentos de Referência Incluídos

- [`references/skills-catalog.md`](references/skills-catalog.md): Catálogo completo das 120 skills, separadas por categoria, com status e trigger description.
- [`references/machine-rules.md`](references/machine-rules.md): Especificação completa do ambiente Windows 11, junctions, RTK, Caveman, Ponytail, Karpathy e Git.
- [`references/project-nallon.md`](references/project-nallon.md): Diretrizes específicas do projeto Nallon (Next.js, Supabase, RLS, limites duros).
- [`scripts/sync-junctions.ps1`](scripts/sync-junctions.ps1): Automação PowerShell para sincronizar Junctions no Windows.
- [`scripts/test-environment.ps1`](scripts/test-environment.ps1): Diagnóstico automático em 1 clique da saúde de ferramentas (RTK, gh CLI, DSH e Junctions).
- [`scripts/sync-symlinks.sh`](scripts/sync-symlinks.sh): Script Shell POSIX para Linux/macOS/WSL.
