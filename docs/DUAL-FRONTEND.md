# Arquitetura Dual-Frontend

Este documento descreve a arquitetura de frontend paralelo do Erencio Backoffice, que permite servir duas interfaces (shells) independentes a partir do mesmo backend.

## Visão Geral

O sistema suporta duas experiências de frontend:

| Shell | Pacote | URL | Status |
|-------|--------|-----|--------|
| **Twenty** (Padrão) | `packages/twenty-front` | `/` | Produção |
| **Erencio.com Backoffice** | `packages/erencio-front` | `/eds` | Beta |

Ambos os frontends compartilham:
- API backend NestJS (`/graphql`)
- Fluxo de autenticação (tokens JWT)
- Modelo de dados (PostgreSQL via TypeORM)
- Cache Redis e workers BullMQ

## Decisões de Design

### Por que um pacote separado (e não apenas temas)?
O frontend Erencio.com Backoffice implementa uma arquitetura de componentes fundamentalmente diferente, inspirada no [Salesforce Lightning Design System 2 (SLDS 2)](https://www.lightningdesignsystem.com/). Um tema puro não permitiria diferenças estruturais em layout, padrões de interação e acessibilidade. Um pacote Vite + React separado garante total independência, compartilhando a API.

### Ordem de Resolução do Frontend

Quando a aplicação carrega, o frontend efetivo é determinado nesta ordem:



Esta lógica está implementada em:
- **Hook no frontend**: `packages/twenty-front/src/modules/workspace/hooks/useFrontendShell.ts`
- **Entidade no backend**: `UserEntity.frontendPreference` + `WorkspaceEntity.frontendPolicy`

## Alterações no Modelo de Dados

### UserEntity (`core.user`)

Nova coluna:


Valores possíveis: `TWENTY`, `BACKOFFICE`

### WorkspaceEntity (`core.workspace`)

Nova coluna:


Valores possíveis: `ALLOW_USER_CHOICE`, `FORCE_TWENTY`, `FORCE_BACKOFFICE`

### Migrações

Arquivos:
- `packages/twenty-server/src/database/typeorm/core/migrations/common/1772000000000-add-frontend-preference-and-policy.ts`
- `packages/twenty-server/src/database/typeorm/core/migrations/common/1772100000000-rename-sfds2-to-eds-frontend-enums.ts`

Verificado:
- O arquivo de migração cria as colunas `frontendPreference` e `frontendPolicy`.
- A segunda migração renomeia `SFDS2 → BACKOFFICE` e `FORCE_SFDS2 → FORCE_BACKOFFICE`.
- O hook `useFrontendShell.ts` está implementado e resolve o frontend efetivo com base na política da workspace e preferência do usuário; inclui um helper `redirectToEdsIfNeeded` que faz redirect do cliente para `/eds` quando apropriado.
- A feature flag `IS_BACKOFFICE_ENABLED` está definida em `feature-flag-key.enum.ts` e o serviço/guard de feature flag existem.
- O servidor registra e serve o build do Erencio.com Backoffice quando presente (`app.module.ts` registra `/eds`).

## API

### Atualizar Preferência de Frontend do Usuário



Requer: usuário autenticado + sessão de workspace.

### Atualizar Política de Frontend da Workspace



Onde ` = { frontendPolicy: "FORCE_BACKOFFICE" }`. Requer admin da workspace ou permissão `WORKSPACE`.

## Feature Flag

O shell Erencio.com Backoffice é controlado pela feature flag `IS_BACKOFFICE_ENABLED` da workspace. Mesmo que um usuário tenha preferência pelo Erencio.com Backoffice, o redirecionamento só acontecer quando esta flag estiver habilitada para a workspace.

Para habilitar via painel de administração:
1. Acesse Painel Admin → Workspace → Feature Flags
2. Ative `IS_BACKOFFICE_ENABLED` para `true`

## Arquitetura de Componentes

Veja [BACKOFFICE-COMPONENTS.md](./BACKOFFICE-COMPONENTS.md) para documentação detalhada dos componentes.

## Plano de Migração

Veja [BACKOFFICE-MIGRATION.md](./BACKOFFICE-MIGRATION.md) para o plano de migração incremental.

## EDF — Erencio Design Framework

A camada de personalização visual do `erencio-front` evoluiu para uma arquitetura de **Component Registry com Perfis**. Cada workspace pode usar um perfil EDF diferente, que define tokens visuais, nomenclaturas e substituições de componentes — tudo em runtime, sem rebuild.

Veja [EDF.md](./EDF.md) para documentação completa.

## Contribuindo

Veja [BACKOFFICE-CONTRIBUTING.md](./BACKOFFICE-CONTRIBUTING.md) para guia de contribuição.
