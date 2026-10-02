# Plugins do DeepSeek Harness (DSH): Ecossistema Completo

Este documento lista e documenta todos os **11 plugins** que compõem o ambiente customizado do DeepSeek Harness, permitindo reproduzir este mesmo setup em qualquer máquina (Windows, Linux ou macOS).

---

## 📋 Tabela Geral de Plugins do Ambiente

| Plugin | Tipo / Origem | Finalidade / Benefício |
| :--- | :--- | :--- |
| **`dsh-plugin-subscriptions`** | npm (`^0.9.6`) | Roteador de assinaturas (ChatGPT Codex, Claude, Grok, Copilot) via OAuth na Web GUI. |
| **`dsh-agy`** | npm (`^0.4.0`) | Google Antigravity OAuth, pool multi-contas, rotação contra erro 429 e device fingerprinting. |
| **`dsh-locale-pt-br`** | GitHub (`tonnymoura/dsh-locale-pt-br`) | Tradução completa da interface Web do DeepSeek Harness para Português do Brasil. |
| **`dsh-undo-savepoint`** | npm (`^0.4.9`) | Sistema de snapshots automáticos, rollback (`undo_restore`), preflight check e modo seguro. |
| **`dsh-better-sidebar`** | npm (`~0.19.1`) | Barra lateral aprimorada com pinning, busca avançada de sessões e atalhos rápidos. Fixado na linha 0.19.x por compatibilidade com o DSH instalado (ver § Compatibilidade do `dsh-better-sidebar`). |
| **`dsh-git-graph`** | GitHub (`1841220388zzzcccxxx-star/dsh-git-graph`) | Visualizador gráfico interativo da árvore do Git diretamente na interface do DSH. |
| **`@linxin666/dsh-client-ui-skill-explorer`** | npm (`^0.4.2`) | Skill Center visual na Web GUI para navegar, ativar, desativar e criar skills. |
| **`@dawsondx/dsh-web-open`** | npm (`^0.1.2`) | Botão e ferramenta para abrir links externos, portas locais e documentações no navegador. |
| **`@khalilhsu/dsh-ui-query-navigator`** | npm (`^0.1.1`) | Navegador rápido de histórico de perguntas, prompts anteriores e sessões de chat. |
| **`dsh-distill-ui`** | Patch Local (Cordis) | Interface destilada com tool batching em bloco único, mensagens protegidas e pensamento limpo. |
| **`dsh-credits-hero`** | Patch Local (Cordis) | Chip indicador de cota e créditos das contas do pool de ChatGPT/Codex na tela inicial. |

### Compatibilidade do `dsh-better-sidebar`

O plugin consome `@deepseek-ai/dsh-client-ui-primitives` do próprio DSH, e a API de ícones mudou:

| Versão do plugin | Primitivas exigidas | Nomes dos ícones | DSH compatível |
| :--- | :--- | :--- | :--- |
| `~0.19.1` (fixado) | `^0.1.5-rc.1` | `IconCodeOutline16`, `IconChevronRightOutline14` | 0.1.5.x |
| `>= 0.21.0` | `^0.1.7-rc.1` | `IconCodeOutlineRegular`, `IconChevronRightOutlineRegular` | >= 0.1.7 |

No DSH 0.1.5 com o plugin 0.21.x, os ícones vêm `undefined` e o visualizador de arquivos quebra
com `Minified React error #130` (o arquivo não abre). Enquanto `dsh --version` for < 0.1.7,
mantenha a linha `0.19.x`; com DSH >= 0.1.7 o pino pode voltar para `^0.21.1`.

---

## 🔍 Detalhamento por Categoria

### 1. Roteamento de Modelos & Assinaturas
- **`dsh-plugin-subscriptions`**: Conecta suas contas existentes no ChatGPT (GPT-4o, OpenAI o1, o3-mini, geração de imagens via `gpt-image-2`), Claude e Grok sem pagar APIs avulsas.
- **`dsh-agy`**: Fornece acesso aos modelos Google Antigravity com suporte a rotação em caso de limite de cota (429) e gerenciamento de múltiplas contas Google.

### 2. Interface, Produtividade & Idioma
- **`dsh-locale-pt-br`**: Deixa toda a interface do DSH em Português-BR nativo.
- **`dsh-better-sidebar`**: Permite organizar conversas por projetos, fixar chats importantes e navegar com mais agilidade.
- **`@linxin666/dsh-client-ui-skill-explorer`**: Adiciona o painel visual de skills na barra lateral esquerda, facilitando a gestão sem precisar de terminal.
- **`dsh-distill-ui`** & **`dsh-credits-hero`**: Refinam a interface da home e do chat, agrupando ferramentas executadas para não poluir o histórico.

### 3. Segurança & Controle de Versão
- **`dsh-undo-savepoint`**: Salva um snapshot antes de qualquer alteração de configuração ou instalação de plugin. Permite reverter alterações com um clique ou ativar o modo de segurança (`undo_safe_mode`) se algo quebrar.
- **`dsh-git-graph`**: Mostra branches, merges e histórico de commits do repositório em um grafo visual sem precisar sair do DSH.

---

## ⚡ Como Provisionar Todo o Ecossistema em 1 Clique

Os scripts inclusos configuram automaticamente o arquivo `package.json` do perfil web (`~/.dsh/profiles/web`) com todas as dependências e registram os bundles necessários:

```powershell
# No Windows (PowerShell):
pwsh -File scripts/setup-dsh-plugins.ps1
```

```bash
# No Linux / macOS:
bash scripts/setup-dsh-plugins.sh
```

Após a execução, reinicie o DeepSeek Harness para que todos os 11 plugins sejam carregados.
