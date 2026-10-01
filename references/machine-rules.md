# Regras Globais e Boas Práticas do Ambiente

Este documento sintetiza os padrões de produtividade, eficiência de tokens e arquitetura de ambiente configurados para agentes autônomos.

---

## 1. Modos Globais de Execução em Sessões

### 1.1 Caveman (`full`)
- **Regra:** Ativar a skill `caveman` no nível `full` desde a primeira resposta (`caveman full`).
- **Objetivo:** Reduzir drástica e deliberadamente o consumo desnecessário de tokens na saída do assistente.
- **Escopo:** O estilo telegráfico/conciso aplica-se exclusivamente ao chat de resposta. Código, commits, PRs e documentações mantêm a prosa e formatação técnicas completas.

### 1.2 Ponytail (`full`)
- **Regra:** Ativar a skill `ponytail` no nível `full` na primeira tarefa de código.
- **Filosofia:** A solução mais simples e direta que resolve o problema com robustez (YAGNI).
  - Priorizar a biblioteca padrão da linguagem antes de pacotes externos.
  - Usar recursos nativos da plataforma antes de abstrações caseiras.
  - Eliminar código especulativo, prematuro ou excessivamente complexo.

### 1.3 Karpathy Guidelines
Princípios cardeais para qualquer modificação ou escrita de código:
1. **Pensar antes de codar:** Enunciar premissas explicitamente. Se houver mais de uma interpretação, apresentá-las ao usuário em vez de escolher em silêncio. Parar e perguntar se houver ambiguidade.
2. **Simplicidade:** Implementar rigorosamente o que foi pedido. Nada de features extras não solicitadas, abstrações de uso único ou tratamento para cenários impossíveis.
3. **Mudança cirúrgica:** Não refatorar código alheio que não quebrou; respeitar o estilo vigente. Limpar apenas resíduos da própria modificação.
4. **Meta verificável:** Definir critério claro de aprovação/falha (teste que reproduz o problema, testes verdes antes e depois) e validar antes de concluir.

---

## 2. Ferramental de Eficiência e Apoio

### 2.1 RTK (Rust Token Killer)
- Proxy de linha de comando (`rtk-ai/rtk`) que intercepta comandos de terminal e filtra saídas ruidosas antes que consumam o contexto da IA.
- Comandos úteis: `rtk gain`, `rtk recall <hash>`, `rtk discover`.

### 2.2 Validação Semântica (Jev)
- Utilização de modelos auxiliares como segunda opinião para decisões de arquitetura ambíguas, severidade de bugs e classificação de risco sem inflar o contexto principal.

---

## 3. Diretrizes de Git e Segurança

1. **Proteção da branch principal (`main`):**
   - Commit direto ou push na branch `main` é proibido.
   - Todo fluxo de trabalho deve utilizar branch temática (`feature/`, `fix/`, etc.), abertura de PR e squash merge.
   - Veto a comandos destrutivos (`git push --force` na `main`).
2. **Segredos e Credenciais:**
   - Arquivos `.env*` nunca devem ser commitados ou expostos.
   - Segredos e chaves de API devem residir em variáveis de ambiente gerenciadas.
