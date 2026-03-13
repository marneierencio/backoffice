# Arquitetura — Erencio.com Backoffice

## Visão Geral

O Backoffice da Erencio.com é um CRM multi-tenant baseado no [Twenty CRM](https://github.com/twentyhq/twenty), um projeto open-source.

```
┌─────────────────────────────────────────────────────────┐
│         Internet (Cloudflare Tunnel)                    │
│                                                         │
│  backoffice.erencio.com                                 │
│  backoffice--dev.erencio.com                            │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────┴──────────────────────────────┐
│                Proxmox (Self-Hosted)                    │
│                                                         │
│  ┌──────────────────────┐  ┌──────────────────────────┐ │
│  │  backoffice          │  │  backoffice--dev         │ │
│  │  192.168.1.90        │  │  192.168.1.92            │ │
│  │  (Produção)          │  │  (Desenvolvimento)       │ │
│  │  branch: main        │  │  branch: development     │ │
│  │                      │  │                          │ │
│  │  ┌────────────────┐  │  │  ┌────────────────────┐  │ │
│  │  │  twenty-server │  │  │  │  twenty-server     │  │ │
│  │  │  twenty-worker │  │  │  │  twenty-worker     │  │ │
│  │  │  postgres      │  │  │  │  postgres          │  │ │
│  │  │  redis         │  │  │  │  redis             │  │ │
│  │  └────────────────┘  │  │  └────────────────────┘  │ │
│  └──────────────────────┘  └──────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Stack Tecnológico

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 18, TypeScript, Recoil, Emotion, Vite |
| Backend | NestJS, TypeORM, GraphQL (Yoga) |
| Banco de Dados | PostgreSQL 16 |
| Cache / Filas | Redis + BullMQ |
| Containerização | Docker + Docker Compose |
| CI/CD | GitHub Actions |
| Registry de Imagens | GitHub Container Registry (ghcr.io) |
| Monorepo | Nx + Yarn 4 |

## Estrutura de Pacotes

```
packages/
├── twenty-front/     — App Frontend Standard
├── erencio-front/       — App Frontend Erencio.com Backoffice (Erencio.com Backoffice)
├── twenty-server/    — Backend + GraphQL (API NestJS)
├── twenty-ui/        — Componentes UI compartilhados
├── twenty-shared/    — Tipos e utilitários comuns
├── twenty-emails/    — Templates de e-mail (React Email)
├── twenty-docker/    — docker-compose e configurações de infra
└── twenty-e2e-testing/ — Testes Playwright end-to-end
```

## Multi-Tenancy

Utilizamos o suporte nativo do Twenty a múltiplos workspaces:

- `IS_MULTIWORKSPACE_ENABLED=true` no ambiente de produção
- Cada cliente recebe seu próprio **workspace** dentro da mesma instância
- Isolamento de dados garantido pelo design do Twenty (schema por workspace)
- Zero overhead operacional: um único deployment serve todos os clientes

## Fluxo de Dados

```
Cliente (Browser)
   │
   ▼
Frontend (Vite / React)
   │   GraphQL / REST
   ▼
Backend (NestJS / Port 3000)
   │
   ├─── PostgreSQL (dados de workspace)
   ├─── Redis (sessões / cache)
   └─── twenty-worker (jobs em background via BullMQ)
```

## Imagens Docker

As imagens são geradas pelo GitHub Actions e publicadas no GitHub Container Registry:

| Tag | Descrição |
|-----|-----------|
| `ghcr.io/marneierencio/backoffice:latest` | Última versão de produção (main) |
| `ghcr.io/marneierencio/backoffice:main-<sha>` | Versão específica de produção |
| `ghcr.io/marneierencio/backoffice:development` | Última versão de desenvolvimento |
| `ghcr.io/marneierencio/backoffice:dev-<sha>` | Versão específica de dev |

## Upstream (Twenty CRM)

O Twenty lança atualizações periodicamente. Mantemos um processo de sincronização
controlado:

1. GitHub Actions verifica novas releases semanalmente
2. Cria branch `upstream-sync/twenty-vX.Y.Z`
3. Time revisa e resolve conflitos
4. Merges passam por `development` antes de chegar em `main`

Ver [UPSTREAM-SYNC.md](./UPSTREAM-SYNC.md) para detalhes.


## Dual-Frontend Architecture

O Backoffice suporta dois frontends paralelos:

| Frontend | Pacote | URL | Status |
|---------|--------|-----|--------|
| **Twenty** (padrão) | `packages/twenty-front` | `/` | Produção |
| **Erencio.com Backoffice** | `packages/erencio-front` | `/eds` | Beta |

A seleção do frontend é determinada por:
1. Política da workspace (`workspace.frontendPolicy`)
2. Preferência do usuário (`user.frontendPreference`)
3. Default do sistema (Twenty)

**Documentação:**
- [DUAL-FRONTEND.md](./DUAL-FRONTEND.md) — Visão geral da arquitetura dual-frontend
- [BACKOFFICE-COMPONENTS.md](./BACKOFFICE-COMPONENTS.md) — Guia de componentes Erencio.com Backoffice
- [BACKOFFICE-CONTRIBUTING.md](./BACKOFFICE-CONTRIBUTING.md) — Como contribuir para o Erencio.com Backoffice
- [BACKOFFICE-MIGRATION.md](./BACKOFFICE-MIGRATION.md) — Plano de migração incremental

## Erencio Design Framework (EDF)

O EDF é a camada de personalização visual e comportamental do `erencio-front`. Permite que cada cliente (workspace) tenha uma identidade visual, terminologia e comportamento de componentes próprios — sem rebuilds ou deploys separados.

**Conceitos centrais:**

| Conceito | O que é |
|---|---|
| **Perfil** (`EdfProfile`) | Conjunto completo de tokens + nomenclaturas + overrides de componentes |
| **Slot** | Ponto nomeado de substituição de componente (ex: `'shell.layout'`, `'record.list.row'`) |
| **Token** | Valor visual primitivo (cor, espaçamento, tipografia) tipado pelo contrato `EdfTokens` |
| **Nomenclatura** | Mapa de labels por contexto (ex: "Contatos" → "Cuidadores" para a Amei Care) |

**Herança entre perfis:** um perfil cliente pode herdar de `erencio-default` e sobrescrever apenas o que precisa.

**Resolução do perfil ativo:**

```
workspace.edfProfilePolicy === FORCE_WORKSPACE
  → usa workspace.edfProfileId

workspace.edfProfilePolicy === ALLOW_USER_CHOICE
  → usa user.edfProfileId ?? workspace.edfProfileId
```

**Colunas no banco de dados:**
- `core.workspace.edfProfileId` — varchar, default `'eds-v1'`
- `core.workspace.edfProfilePolicy` — enum `ALLOW_USER_CHOICE | FORCE_WORKSPACE`
- `core.user.edfProfileId` — varchar nullable, default `null` (herda do workspace)

Migração: `1772300000000-add-edf-profile-columns.ts`

See [EDF.md](./EDF.md) para documentação completa.

## Pacotes Erencio

Além dos pacotes `twenty-*` (originais ou minimamente alterados), o projeto possui:

```
packages/
├── erencio-front/              — App CRM alternativo (porta 3002, base /eds)
├── erencio-selecao-cuidadores/ — App público de cadastro (porta 3003)
```

**Filosofia:**
- Pacotes `twenty-*` seguem o upstream com mínimas alterações — preservam retrocompatibilidade
- Pacotes `erencio-*` entregam valor adicional sem afetar o upstream
- Atualizações do Twenty upstream podem ser aplicadas com baixo custo de manutenção

## Armadilhas Conhecidas

### twenty-shared requer rebuild após mudanças

O pacote `twenty-shared` é consumido pelo `twenty-server` via arquivos **compilados** em `dist/`, não diretamente do `src/`. O TypeScript e o NestJS leem:
- Tipos: `dist/workspace/index.d.ts`
- Runtime: `dist/workspace.cjs`

Sempre que adicionar ou alterar tipos em `twenty-shared`, executar:

```bash
npx nx build twenty-shared
```

Sem isso, o servidor falha ao carregar entidades que dependem dos novos tipos, enquanto apps Vite (como `erencio-selecao-cuidadores`) continuam funcionando — o que pode parecer um problema parcial de autenticação.

### erencio-selecao-cuidadores com nome incorreto no project.json

O `buildTarget` em `packages/erencio-selecao-cuidadores/project.json` ainda referencia `twenty-selecao-cuidadores:build` — nome desatualizado. Esse bug não impede o build direto mas quebra integrações Nx que dependem do target.
