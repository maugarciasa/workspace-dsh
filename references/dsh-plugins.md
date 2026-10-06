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
| **`dsh-better-sidebar`** | npm (`^0.24.1`) | Barra lateral aprimorada com pinning, busca avançada de sessões e atalhos rápidos. Fixado na linha 0.24.x por compatibilidade com o DSH 0.2.x (ver § Compatibilidade do `dsh-better-sidebar`). |
| **`dsh-git-graph`** | GitHub (`1841220388zzzcccxxx-star/dsh-git-graph`) | Visualizador gráfico interativo da árvore do Git diretamente na interface do DSH. |
| **`@linxin666/dsh-client-ui-skill-explorer`** | npm (`^0.4.2`) | Skill Center visual na Web GUI para navegar, ativar, desativar e criar skills. |
| **`@dawsondx/dsh-web-open`** | npm (`^0.1.2`) | Botão e ferramenta para abrir links externos, portas locais e documentações no navegador. |
| **`@khalilhsu/dsh-ui-query-navigator`** | npm (`^0.1.1`) | Navegador rápido de histórico de perguntas, prompts anteriores e sessões de chat. |
| **`dsh-distill-ui`** | Local (`file:plugins/dsh-distill-ui`) | Interface destilada com tool batching em bloco único, mensagens protegidas e pensamento limpo. |
| **`dsh-credits-hero`** | Local (`file:plugins/dsh-credits-hero`) | Chip indicador de cota e créditos das contas do pool de ChatGPT/Codex na tela inicial. Depende do `dsh-plugin-subscriptions`. |

### Compatibilidade do `dsh-better-sidebar`

O plugin consome `@deepseek-ai/dsh-client-ui-primitives` do próprio DSH, e a API de ícones mudou:

| Versão do plugin | Primitivas exigidas | Nomes dos ícones | DSH compatível |
| :--- | :--- | :--- | :--- |
| `~0.19.1` | `^0.1.5-rc.1` | `IconCodeOutline16`, `IconChevronRightOutline14` | 0.1.5.x |
| `0.21.x` – `0.22.x` | `^0.1.7-rc.1` | `IconCodeOutlineRegular`, `IconChevronRightOutlineRegular` | 0.1.7.x – 0.1.x |
| `^0.24.1` (fixado) | `^0.2.0-rc.1` | `IconCodeOutlineRegular`, `IconChevronRightOutlineRegular` | >= 0.2.0 |

O detalhe que engana: `^0.1.5-rc.1` e `^0.1.7-rc.1` significam `>=0.1.x-rc.1 <0.2.0-0`, e
`0.2.0-rc.2` **não** satisfaz esse intervalo. Num DSH 0.2.x os pins antigos falham no gate de peers
(`evaluatePluginCompatibility` desabilita a linha no boot) **e** os ícones `…16`/`…14` vêm
`undefined`, quebrando o visualizador de arquivos com `Minified React error #130` (o arquivo não
abre). Sempre alinhe o pino com a saída de `dsh --version`.

---

## 🔍 Detalhamento por Categoria

### 1. Roteamento de Modelos & Assinaturas
- **`dsh-plugin-subscriptions`**: Conecta suas contas existentes no ChatGPT (GPT-4o, OpenAI o1, o3-mini, geração de imagens via `gpt-image-2`), Claude e Grok sem pagar APIs avulsas. Inclui failover transparente entre contas do ChatGPT (remoção de sticky em 429/usage limit, buffer de `block-start` e reavaliação imediata de janelas expiradas).
- **`dsh-agy`**: Fornece acesso aos modelos Google Antigravity com suporte a rotação em caso de limite de cota (429) e gerenciamento de múltiplas contas Google.

### 2. Interface, Produtividade & Idioma
- **`dsh-locale-pt-br`**: Deixa toda a interface do DSH em Português-BR nativo.
- **`dsh-better-sidebar`**: Permite organizar conversas por projetos, fixar chats importantes e navegar com mais agilidade. Configurado sem abertura forçada de Tasks (`autoOpenSubagent: false`, `autoOpenJobs: false`), sem interceptar links de preview e com loopback liberado (`localhost,127.0.0.1`).
- **`@linxin666/dsh-client-ui-skill-explorer`**: Adiciona o painel visual de skills na barra lateral esquerda, facilitando a gestão sem precisar de terminal.
- **`dsh-distill-ui`** & **`dsh-credits-hero`**: Refinam a interface da home e do chat. O `dsh-credits-hero` (v0.2.1) traz modal fixo (não fecha ao arrastar o mouse para atualizar ou selecionar), cálculo de resets e troca de conta ativa em 1 clique diretamente na lista.

### 3. Segurança & Controle de Versão
- **`dsh-undo-savepoint`**: Salva um snapshot antes de qualquer alteração de configuração ou instalação de plugin. Permite reverter alterações com um clique ou ativar o modo de segurança (`undo_safe_mode`) se algo quebrar.
- **`dsh-git-graph`**: Mostra branches, merges e histórico de commits do repositório em um grafo visual sem precisar sair do DSH.

---

## ⚡ Como Provisionar Todo o Ecossistema em 1 Clique

Os scripts inclusos configuram automaticamente o `package.json` do **perfil ativo** (lido de `DSH_PROFILE_DIR`; sem essa variável, `~/.dsh/profiles/web`) com todas as dependências, os plugins locais como `file:` e a lista `dsh.profile.bundles`:

```powershell
# No Windows (PowerShell 7 ou Windows PowerShell 5.1):
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/setup-dsh-plugins.ps1
```

```bash
# No Linux / macOS:
bash scripts/setup-dsh-plugins.sh
```

Após a execução, reinicie o DeepSeek Harness para que todos os 11 plugins sejam carregados.
