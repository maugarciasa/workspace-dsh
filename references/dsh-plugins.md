# Plugins do DeepSeek Harness (DSH): Roteamento de IA

Este documento descreve a arquitetura, instalação e funcionamento dos dois plugins essenciais utilizados para rotear modelos de IA externos (ChatGPT, Claude, Grok e Antigravity) diretamente para a interface do DeepSeek Harness.

---

## 1. `dsh-plugin-subscriptions`

- **Repositório oficial:** [`V1ki/dsh-plugin-subscriptions`](https://github.com/V1ki/dsh-plugin-subscriptions)
- **Versão recomendada:** `^0.9.6`
- **Objetivo:** Permite utilizar suas assinaturas existentes como provedores de LLM no DeepSeek Harness sem custos adicionais de API avulsa.
- **Modelos e Provedores Suportados:**
  - **ChatGPT / OpenAI:** GPT-4o, OpenAI o1, o3-mini (inclui suporte nativo a geração de imagens `gpt-image-2`).
  - **Claude (Anthropic):** Acesso com suporte a streaming e tool calls.
  - **Grok / xAI:** Modelos Grok 2.0 / Grok Imagine (geração de vídeo e imagens).
  - **GitHub Copilot:** Roteamento via token de autenticação Copilot.
  - **Google Antigravity:** Roteamento integrado.
- **Configuração no DSH:** No menu lateral do DSH Web, acesse **Configurações (Settings)**, vá na aba **Subscriptions** e clique em **OAuth Login** para autenticar sua conta localmente.

---

## 2. `dsh-agy` (Google Antigravity Auth & Multi-Account Pool)

- **Repositório oficial:** [`chaos-03x/dsh-agy`](https://github.com/chaos-03x/dsh-agy)
- **Versão recomendada:** `^0.4.0`
- **Objetivo:** Autenticação OAuth e gerenciamento avançado de pool de contas para modelos Google Antigravity.
- **Recursos Principais:**
  - **Pool Multi-Contas:** Cadastre várias contas Google para balancear uso.
  - **Rotação Automática em Erro 429:** Troca instantaneamente para a próxima conta ativa assim que o limite de cota de uma for atingido.
  - **Device Fingerprinting:** Garante estabilidade contínua sem bloqueios preventivos.
  - **Interface CLI e Web:** Login direto pelo terminal (`dsh-agy`) ou pelo painel do DSH.

---

## 3. Automação de Instalação em Qualquer Máquina

Os scripts inclusos neste repositório cuidam de registrar e instalar ambos os plugins diretamente no perfil web do DSH (`~/.dsh/profiles/web`):

```powershell
# No Windows (PowerShell):
pwsh -File scripts/setup-dsh-plugins.ps1
```

```bash
# No Linux / macOS:
bash scripts/setup-dsh-plugins.sh
```
