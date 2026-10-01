# Workspace DSH (Agent Skill)

> **Catálogo de orquestração com mais de 120 skills, boas práticas de economia de tokens (Caveman, Ponytail, Karpathy) e automação de ambiente para agentes de IA.**

Compatível com **Claude Code**, **DeepSeek Harness (DSH)**, **Cursor**, **Codex**, **OpenAI Swarm** e qualquer runtime compatível com o padrão [Agent Skills](https://skills.sh/).

---
### 🛠️ Scripts Utilitários Inclusos

- **`scripts/test-environment.ps1`**: Diagnóstico de integridade do ambiente (RTK, gh CLI, DSH, junctions e branches).
- **`scripts/sync-junctions.ps1`**: Criação automática de Junctions NTFS para Windows.
- **`scripts/sync-symlinks.sh`**: Sincronização automática de symlinks para Linux, macOS e WSL.

---

## 🚀 Instalação Rápida

Instale globalmente com o gerenciador oficial de skills:

```bash
npx skills add maugarciasa/workspace-dsh -g
```

Ou clone manualmente na sua pasta de skills:

```bash
git clone https://github.com/maugarciasa/workspace-dsh.git ~/.agents/skills/workspace-dsh
```

---

## 🎯 O que este Hub oferece?

1. **Roteamento Inteligente:** Matriz de decisão rápida para mais de 120 skills populares (Superpowers, HyperFrames, SEO, Shadcn, Supabase, Playwright, Maestri, Caveman, Ponytail).
2. **Regras de Eficiência de Tokens:** Diretrizes testadas para manter agentes focados, concisos e sem desperdício de contexto:
   - **Caveman Mode:** Respostas técnicas compactas e econômicas no chat.
   - **Ponytail:** Filosofia anti-overengineering (código simples, stdlib antes de dependências, YAGNI).
   - **Karpathy Guidelines:** Pensar antes de codar, mudanças cirúrgicas e validação verificável por testes.
3. **Catálogo Integrado:** Índice completo em [`references/skills-catalog.md`](references/skills-catalog.md).
4. **Sincronização para Windows/Claude Code:** Script em [`scripts/sync-junctions.ps1`](scripts/sync-junctions.ps1) para criar junctions automáticas entre `~/.agents/skills` e `~/.claude/skills`.

---

## 📚 Como o Agente Utiliza

Uma vez instalado, o agente pode carregar este hub automaticamente quando precisar se situar sobre quais ferramentas e convenções adotar:

```markdown
skill: workspace-dsh
```

---

## 📄 Licença

Distribuído sob a licença [MIT](LICENSE).
