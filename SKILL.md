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

## 3. Gestão e Sincronização de Skills na Máquina

As skills reais ficam centralizadas em:
`C:\Users\Mau\.agents\skills` (acessível pelo junction `C:\dev\agents-skills`).

Como o Claude Code só enxerga `~/.claude/skills`, novas skills devem possuir um **Junction NTFS**.

### Sincronizar todas as skills automaticamente:
Execute o script incluído:
```powershell
pwsh -File "C:\Users\Mau\.agents\skills\workspace-dsh\scripts\sync-junctions.ps1"
```

### Criar Junction manual para uma skill:
```powershell
New-Item -ItemType Junction -Path "$HOME\.claude\skills\<nome>" -Target "$HOME\.agents\skills\<nome>"
```

---

## 4. Documentos de Referência Incluídos

- [`references/skills-catalog.md`](references/skills-catalog.md): Catálogo completo das 120 skills, separadas por categoria, com status e trigger description.
- [`references/machine-rules.md`](references/machine-rules.md): Especificação completa do ambiente Windows 11, junctions, RTK, Caveman, Ponytail, Karpathy e Git.
- [`references/project-nallon.md`](references/project-nallon.md): Diretrizes específicas do projeto Nallon (Next.js, Supabase, RLS, limites duros).
- [`scripts/sync-junctions.ps1`](scripts/sync-junctions.ps1): Automação para sincronizar pastas de skills com o Claude Code.
