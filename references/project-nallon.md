# Contexto do Projeto Principal: Nallon

- **Repositório local:** `C:\dev\Nallon` (`maugarciasa/Nallon`)
- **Tipo de Produto:** ERP de balcão para comércio (nascido na loja física Connect), operando em produção em `nallon.com.br`.
- **Módulos:** Caixa, Ordens de Serviço (OS), Estoque, Financeiro, Compras, Cadastros e Assinaturas.
- **Stack Tecnológica:** Next.js (App Router) + React + TypeScript strict + Supabase (Postgres, Auth, RLS, Storage) + Tailwind / Shadcn UI.
- **Idioma do Repositório:** pt-BR para código, commits, comentários e documentação técnica.

---

## Limites Duros e Regras de Ouro (Invioláveis)

1. **Sem `service_role` no cliente / browser:**
   - O aplicativo Nallon deliberadamente não possui ou expõe a chave `service_role`.
   - O controle de acesso é estritamente exercido via RLS (*Row Level Security*) no Postgres e isolado por `loja_id`.
2. **Server Action é a única porta de escrita:**
   - Nenhuma mutação de banco de dados acontece diretamente do lado cliente.
   - Toda escrita passa por Server Actions validadas via Zod.
3. **Função SQL nova nasce fechada:**
   - Novas RPCs ou funções no Postgres nascem sem permissão de execução pública (`REVOKE EXECUTE ON FUNCTION FROM PUBLIC`) e são concedidas explicitamente para `authenticated`.
4. **Veto a `npm run db:push` ou `supabase db push` em produção:**
   - Migrations são aplicadas com rigor por controle de versão e CI/CD.
5. **Merge e Deploy Controlados:**
   - Push na branch `main` somente via `scripts/merge-remoto.sh` e deploy exclusivamente por `scripts/deploy.sh`, ambos dependendo de comando expresso do mantenedor; veto irrestrito a `--force`.
5. **Jev como validador:**
   - O projeto possui a skill `jev-classificar` em `.claude/skills/jev-classificar/` para triagem de textos, mensagens e suporte.

---

## Estrutura de Pastas de Nallon

```
src/
├── app/(sistema)/{rota}/   # Páginas e rotas de UI
├── modules/{modulo}/       # Regra de negócio (schema.ts, actions.ts, queries.ts)
├── lib/                    # Supabase clients, helpers de sessão, erros
├── components/, hooks/     # Componentes visuais reutilizáveis
└── proxy.ts                # Middleware de sessão
supabase/
├── migrations/             # Migrações versionadas
└── tests/                  # Testes pgTAP e concorrência
docs/ai/                    # Toda documentação viva para agentes de IA
```
