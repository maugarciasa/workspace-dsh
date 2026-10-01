# DSH Distill UI v1.2.0

Plugin de interface local para o **DeepSeek Harness (DSH Web UI)** que simplifica a apresentação visual da ferramenta, compactando operações técnicas, agrupando chamadas repetitivas, atenuando blocos secundários (raciocínio/pensamento) e limpando o cabeçalho com menu de overflow (`•••`), sem qualquer perda de dados ou quebra na reconciliação do React.

---

## 1. Objetivo

- **Redução drástica de ruído visual:** transformar chamadas volumosas de ferramentas em linhas/chips de 28px de altura.
- **Agrupamento sequencial (Virtual Batching):** reunir sequências consecutivas de leituras/buscas sob uma barra colapsável (`▶ N operações técnicas`).
- **Hierarquia visual nítida:** Resposta do assistente em destaque absoluto (14.5px, tipografia espaçosa); raciocínio (`▸ Pensamento`) atenuado com 11.5px e borda discreta.
- **Despoluição do cabeçalho:** concentrar ações secundárias em um botão suspenso `•••` (Undo, Redo, Snapshots, Message Undo, status e Query Navigator).
- **Zero impacto no backend/agente:** 100% focado no frontend do navegador, sem alterar comandos, logs ou o projeto em desenvolvimento.

---

## 2. Arquitetura e Arquivos

O plugin reside exclusivamente no perfil do usuário (`~/.dsh/profiles/web`), sem modificar os pacotes globais do DSH em `node_modules/@deepseek-ai/dsh` e sem tocar no projeto de trabalho (`Nallon`).

```
C:\Users\Mau\.dsh\profiles\web\
├── cordis.patch.yml               # Montagem do plugin (id: distill-ui)
├── node_modules\
│   └── dsh-distill-ui             # Junction apontando para plugins/dsh-distill-ui
└── plugins\
    └── dsh-distill-ui\
        ├── package.json           # Manifesto do plugin v1.0.0 (dsh.client)
        ├── cordis.patch.yml       # Camada de patch do pacote
        ├── README.md              # Esta documentação
        └── lib\
            ├── index.js           # Entry point do host (no-op)
            └── client.js          # Bundle cliente (CSS + Virtual Batching + Overflow)
```

---

## 3. Como Funciona o Virtual Batching (Zero-Reparenting)

Diferente de implementações ingênuas que movem nós do DOM (`appendChild`), o **Virtual Batching**:

1. Analisa os filhos diretos do fluxo de conversa em `[data-chat-flow]`.
2. Identifica sequências consecutivas de `[data-chat-flow-kind="tool-call"]`.
3. Insere **apenas o cabeçalho do lote** (`.dsh-distill-batch-header`) imediatamente antes do primeiro item do grupo.
4. **Nenhum elemento React é movido ou retirado de sua posição original.**
5. Marca os itens com atributos de estado:
   ```html
   <div data-chat-flow-kind="tool-call" data-distill-batch-id="distill-batch-1" data-distill-batch-hidden="true">
   ```
6. A visibilidade é controlada puramente via CSS:
   ```css
   [data-chat-flow-kind="tool-call"][data-distill-batch-hidden="true"] {
     display: none !important;
   }
   ```
7. **Regra de Segurança para Erros/Execução:** se qualquer item do grupo contiver `[data-state="running"]` ou `[data-state="error"]`, o lote abre automaticamente (`data-distill-batch-hidden="false"`) e exibe o badge `● executando…` ou `⚠️ falha`.

---

## 4. Como Funciona o Overflow do Cabeçalho (`•••`)

1. Localiza semanticamente o slot de ações: `header [data-slot="conversation.session.header.actions"]`.
2. Injeta um botão discreto de gatilho `•••` (`.dsh-distill-overflow-trigger`).
3. **Não remove nem reparenta os botões existentes.** Os botões mantêm seus event listeners originais do React.
4. Quando o menu está fechado (`data-distill-menu-open="false"`), as ações secundárias (`[data-undo-header="true"]`, `.dsh-query-nav-toggle`) recebem `display: none !important`.
5. Ao clicar no `•••` (ou pressionar Enter/Espaço), o cabeçalho recebe `data-distill-menu-open="true"`. O CSS posiciona as ações como um menu suspenso flutuante (`position: absolute; right: 0; z-index: 99999`).
6. Suporta fechar via clique fora e tecla `Escape`.

---

## 5. MutationObserver e Performance

- **Instância única:** 1 único observer anexado a `document.body`.
- **Trava de reentrância:** Flag atômica `isProcessing` impede execuções concorrentes ou em cascata.
- **Debounce:** Agendado via `requestAnimationFrame` coalescido.
- **Filtro de mutações:** Ignora mutações provocadas por nós do próprio plugin (`.dsh-distill-batch-header`, `.dsh-distill-overflow-trigger`), eliminando loops.

---

## 6. Seletores Semânticos e Resiliência

O plugin prioriza atributos contratuais do DSH sobre classes ofuscadas do compilador Vite:

| Alvo | Seletor Semântico Primário | Fallback de Classe |
| :--- | :--- | :--- |
| **Tool Call Root** | `[data-chat-anchor-key^="call:"] [data-tool]` | `.o3BgMG_root` |
| **Linha de Disclosure** | `[data-chat-anchor-key^="call:"] [data-disclosure-row="true"]` | `.o3BgMG_row` |
| **Fluxo do Chat** | `[data-chat-flow] > [data-chat-flow-kind="tool-call"]` | — |
| **Ações do Cabeçalho** | `header [data-slot="conversation.session.header.actions"]` | `header [class*="headerActions"]` |
| **Raciocínio / Think** | `[data-variant="think"]` | — |
| **Processo do Turno** | `button[data-turn-process]` | — |

*Nota:* Caso o DSH atualize e altere classes CSS Modules internas, os seletores semânticos acima garantem continuidade de funcionamento.

---

## 7. Como Desativar ou Remover

### Para desativar temporariamente:
Edite `C:\Users\Mau\.dsh\profiles\web\cordis.patch.yml` e adicione `disabled: true`:
```yaml
- insert:
    - id: distill-ui
      name: 'dsh-distill-ui'
      disabled: true
```
Recarregue a página no navegador.

### Para restaurar via Snapshot:
Use o snapshot de referência pré-instalação:
```bash
undo_restore mode="id" snapshot_id="20260925-221000-81e9"
```

### Para remoção manual completa:
1. Remova as linhas do `distill-ui` em `cordis.patch.yml`.
2. Exclua a junction `C:\Users\Mau\.dsh\profiles\web\node_modules\dsh-distill-ui`.
3. Exclua a pasta `C:\Users\Mau\.dsh\profiles\web\plugins\dsh-distill-ui`.

---

## 8. Após atualizar o DeepSeek Harness

Ao atualizar a versão do DSH (`npm update -g @deepseek-ai/dsh`):

### Checklist curto de smoke test:
1. Abra `http://127.0.0.1:3080` e confirme que a página carrega sem tela branca.
2. Abra o Console do navegador (`F12`) e confira se há log `[dsh-distill-ui] v1.0.0 initializing...`.
3. Abra uma conversa existente:
   - Verifique se as tool calls aparecem compactas (linha única).
   - Clique em uma tool call e confirme que ela expande exibindo código/diff.
   - Verifique se o botão `•••` aparece no cabeçalho e abre o menu de ações ao clicar.
4. Envie uma mensagem que gere chamadas de ferramentas e confirme que o agrupamento virtual funciona sem erros de `NotFoundError` no console.