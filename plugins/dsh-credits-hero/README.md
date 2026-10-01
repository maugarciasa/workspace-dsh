# dsh-credits-hero

Chip de crédito no **cabeçalho da sessão**, ao lado do rótulo do preset ("Modo PTC"):
mostra a cota das contas ChatGPT/Codex do `dsh-plugin-subscriptions` e destaca
**a conta que o pool escolheria agora**.

## O que mostra

- `● conta · 5h 12% · sem 45%` — a conta no topo da fila do pool.
- Cor do ponto: verde (<80% em toda janela), âmbar (>=80%), vermelho (>=95% = no teto).
- Hover: painel com **todas as contas**, ★ na default, 5h/semanal e "(no teto)".
- Atualiza a cada 5 min (mesmo TTL do cache de usage do plugin) e não renderiza
  nada se o RPC falhar — nunca deixa chip quebrado.

## Como funciona

- Slot: `conversation.session.header.actions` (`kind: "list"`, `scope: "session"`),
  declarado por `dsh-client-ui-conversation`. `order: 0` coloca o chip logo depois
  do rótulo do preset (`order: -10`) e antes de undo (`10`) e query-nav (`20`).
- Dados: RPC `subscriptions-auth.status` (lista de contas) e
  `subscriptions-auth.usage` (janelas) — os mesmos do painel Settings → Subscriptions.
- A ordenação replica `pool.js`/`pool-usage.js`: `urgencia = max(sobra / tempo ate o reset)`,
  corte em 100% (`QUOTA_FULL_PERCENT`), contas no teto vão para o fim.

## Dependências

- `dsh-plugin-subscriptions` instalado e com contas Codex logadas.
- Nenhum patch no core: em 30/09/2026 a primeira versão mexia em
  `dsh-client-ui-conversation` (slot novo `conversation.hero.credits`); isso foi
  revertido quando ficou claro que o alvo era o cabeçalho (slot `list` já existente).

## Reinstalar depois de refazer o perfil

```powershell
# 1. junction no node_modules do perfil
New-Item -ItemType Junction -Path "$env:USERPROFILE\.dsh\profiles\web\node_modules\dsh-credits-hero" `
  -Target "$env:USERPROFILE\.dsh\profiles\web\plugins\dsh-credits-hero"
# 2. linha no patch do perfil (~/.dsh/profiles/web/cordis.patch.yml)
#    - insert:
#        - id: credits-hero
#          name: 'dsh-credits-hero'
# 3. reiniciar o DSH (bundles de cliente sao fotografados no boot)
pwsh -File "$env:USERPROFILE\.dsh\bin\start-dsh-web.ps1"
```

## Diagnóstico

No console do navegador (F12):

- `[dsh-credits-hero] v0.1.0 carregado` → o bundle do plugin foi servido.
- `[dsh-credits-hero] registrando o chip em conversation.session.header.actions` → o slot foi encontrado.
- Se só a primeira aparece, o slot não existe naquela composição (perfil/patch diferente).

Sintaxe do bundle pode ser conferida sem subir nada:

```powershell
node -e "const fs=require('fs'),vm=require('vm');new vm.Script(fs.readFileSync(process.argv[1],'utf8'))" lib/client.js
```
