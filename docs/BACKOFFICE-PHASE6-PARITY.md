# Erencio.com Backoffice Fase 6 — Paridade Funcional: Plano de Design e Implementação

Este documento especifica os componentes, comportamentos, tokens e estrutura de página para a Fase 6 da migração Erencio.com Backoffice (Paridade Funcional). Todos os designs seguem os princípios do [SLDS 2](https://www.lightningdesignsystem.com/) adaptados para React, usando design tokens Erencio.com Backoffice (`--backoffice-g-*`).

---

## Índice

1. [Escopo](#escopo)
2. [Novos Hooks](#novos-hooks)
   - [useActivities](#useactivities)
   - [useWebhooks](#usewebhooks)
3. [Páginas](#páginas)
   - [NotFoundPage](#notfoundpage)
   - [ActivitiesPage](#activitiespage)
   - [SettingsAccountsPage](#settingsaccountspage)
   - [SettingsDevelopersPage](#settingsdeveloperspage)
   - [SettingsSecurityPage](#settingssecuritypage)
4. [Queries e Mutations GraphQL](#queries-e-mutations-graphql)
5. [Alterações de Roteamento](#alterações-de-roteamento)
6. [Adições ao Sidebar](#adições-ao-sidebar)
7. [Feature Flag](#feature-flag)
8. [Checklist de Acessibilidade](#checklist-de-acessibilidade)
9. [Resumo da Estrutura de Arquivos](#resumo-da-estrutura-de-arquivos)
10. [Definição de Pronto](#definição-de-pronto)

---

## Escopo

A Fase 6 alcança **paridade funcional completa** entre o frontend Erencio.com Backoffice e o frontend Twenty padrão. Ao final desta fase:

- Todas as páginas existentes no Twenty padrão estão disponíveis no Erencio.com Backoffice
- A page 404 (`NotFoundPage`) é exibida para rotas desconhecidas, em vez de redirecionar para o Dashboard
- A aba **Atividades** (Tasks/Tarefas) está disponível no sidebar principal
- As configurações de **Contas**, **Desenvolvedores** e **Segurança** estão disponíveis no painel de administração
- O feature flag `IS_BACKOFFICE_ENABLED` é habilitado por padrão para novas workspaces

---

## Novos Hooks

### useActivities

**Arquivo:** `src/hooks/useActivities.ts`

Hook para CRUD de tarefas/atividades CRM. Normaliza o campo `bodyV2.markdown` retornado pela API para a string `body` usada pelo componente.

```ts
type ActivityStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

type Activity = {
  id: string;
  title: string;
  body: string;
  status: ActivityStatus;
  dueAt: string | null;
  assignee: { id: string; name: { firstName: string; lastName: string } } | null;
  createdAt: string;
  updatedAt: string;
};

type CreateActivityInput = {
  title: string;
  body?: string;
  status?: ActivityStatus;
  dueAt?: string | null;
  assigneeId?: string | null;
};

type UpdateActivityInput = Partial<CreateActivityInput>;

type UseActivitiesReturn = {
  activities: Activity[];
  loading: boolean;
  error: string | null;
  createActivity: (input: CreateActivityInput) => Promise<void>;
  updateActivity: (id: string, input: UpdateActivityInput) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;
  refresh: () => void;
};
```

Usa `gqlWorkspace()` (endpoint `/graphql`). Tipo do objeto no Twenty: `tasks`.

---

### useWebhooks

**Arquivo:** `src/hooks/useWebhooks.ts`

Hook para CRUD de webhooks. Expõe operações de criação e exclusão (webhooks não são editáveis diretamente no Twenty).

```ts
type WebhookOperation = 'create' | 'update' | 'delete' | '*';

type Webhook = {
  id: string;
  targetUrl: string;
  description: string | null;
  operations: WebhookOperation[];
  secret: string | null;
  createdAt: string;
};

type CreateWebhookInput = {
  targetUrl: string;
  description?: string;
  operations: WebhookOperation[];
};

type UseWebhooksReturn = {
  webhooks: Webhook[];
  loading: boolean;
  error: string | null;
  createWebhook: (input: CreateWebhookInput) => Promise<void>;
  deleteWebhook: (id: string) => Promise<void>;
  refresh: () => void;
};
```

Usa `gqlWorkspace()` (endpoint `/graphql`). Tipo do objeto no Twenty: `webhooks`.

---

## Páginas

### NotFoundPage

**Arquivo:** `src/pages/NotFoundPage.tsx`

Página de erro 404 exibida para qualquer rota não reconhecida pelo `AppRouter`.

**Referência SLDS 2:** [Illustration — No Access / Desert](https://www.lightningdesignsystem.com/components/illustration/)

**Anatomia:**

| # | Elemento | Descrição |
|---|----------|-----------|
| 1 | Ilustração SVG | Cena de deserto com cacto (padrão SLDS 2 "No Access") |
| 2 | Título | "Página não encontrada" em destaque |
| 3 | Subtítulo (404) | Código de erro em fonte grande, cor `textPlaceholder` |
| 4 | Mensagem | Explicação amigável do que aconteceu |
| 5 | Botões | "Ir para o Dashboard" (primary) + "Voltar" (neutral) |

**Especificação visual:**
- Container centralizado: `display: flex`, `flexDirection: column`, `alignItems: center`, `justifyContent: center`, `minHeight: 100%`, `padding: spacingXXLarge`
- Ilustração SVG: `width: 320px`, `maxWidth: 100%`
- Título: `fontSize: fontSizeXXLarge`, `fontWeight: fontWeightBold`, `color: textDefault`, `marginTop: spacingLarge`
- Código 404: `fontSize: 72px`, `fontWeight: fontWeightBold`, `color: textPlaceholder`, `lineHeight: 1`
- Mensagem: `fontSize: fontSizeMedium`, `color: textPlaceholder`, `marginTop: spacingSmall`, `textAlign: center`, `maxWidth: 400px`
- Botões: `gap: spacingSmall`, `marginTop: spacingLarge`, alinhados horizontalmente

**Comportamentos:**
- Botão "Voltar": chama `window.history.back()`
- Botão "Ir para o Dashboard": navega para `#/`
- Substituiu `DashboardPage` na rota `*` (wildcard) do AppRouter

---

### ActivitiesPage

**Arquivo:** `src/pages/ActivitiesPage.tsx`

Página principal de gestão de tarefas/atividades CRM. Espelha a experiência da seção "Activities" (Tasks) do Twenty.

**Referência SLDS 2:** [Data Table](https://www.lightningdesignsystem.com/components/data-tables/), [Path](https://www.lightningdesignsystem.com/components/path/)

**Anatomia:**

| # | Elemento | Descrição |
|---|----------|-----------|
| 1 | `PageHeader` | Título "Atividades" + botão "Nova Atividade" |
| 2 | `Tabs` | Abas: Todas / A fazer / Em andamento / Concluídas (com contadores) |
| 3 | Lista de tarefas | Cards por atividade com checkbox circular de conclusão |
| 4 | `EmptyState` | Exibido quando não há atividades no filtro ativo |
| 5 | Modal de criação/edição | Formulário com Título, Descrição, Status, Data de Vencimento |
| 6 | `ConfirmDialog` | Confirmação de exclusão de atividade |

**Anatomia do card de atividade:**

| Campo | Exibição |
|-------|----------|
| Checkbox circular | Clicar marca como `DONE` rapidamente |
| Título | `fontWeightMedium`, riscado se `status === 'DONE'` |
| Corpo/Descrição | Máximo 2 linhas, `color: textPlaceholder` |
| Data de vencimento | Ícone `calendar`, formata para PT-BR; vermelho + "Vencida" se `dueAt < now` |
| Status badge | `Badge` com variante: `neutral` (TODO), `warning` (IN_PROGRESS), `success` (DONE) |
| Ações | Botão `edit` (lança modal) + botão `trash` (abre `ConfirmDialog`) |

**Especificação visual:**
- Lista: `display: flex`, `flexDirection: column`, `gap: spacingSmall`
- Card: `padding: spacingMedium spacingLarge`, `borderRadius: radiusMedium`, `border: 1px solid borderDefault`, `backgroundColor: backgroundSurface`
- Card hover: `backgroundColor: neutral1`
- Checkbox circular: `width: 20px`, `height: 20px`, `borderRadius: radiusCircle`, `border: 2px solid brandPrimary`; quando `DONE`: `backgroundColor: brandPrimary` com ícone check branco
- Título riscado: `textDecoration: line-through`, `color: textPlaceholder`

---

### SettingsAccountsPage

**Arquivo:** `src/pages/settings/SettingsAccountsPage.tsx`

Página de contas conectadas (Google/Microsoft OAuth). Permite gerenciar sincronização de e-mail e calendário.

**Referência SLDS 2:** [Card](https://www.lightningdesignsystem.com/components/cards/), [Connected App](https://www.lightningdesignsystem.com/components/connected-app/)

**Anatomia:**

| # | Elemento | Descrição |
|---|----------|-----------|
| 1 | `PageHeader` | Título "Contas Conectadas" + botão "Conectar Conta" (dropdown Google/Microsoft) |
| 2 | `Tabs` | Todas / E-mail / Calendário |
| 3 | Cards de conta | Um card por conta conectada, com e-mail, status e canais |
| 4 | Botões de conexão | Ações rápidas para conectar nova conta (OAuth) |
| 5 | Aviso de privacidade | Informação sobre autorização OAuth e permissões |

**Anatomia do card de conta:**

| Campo | Exibição |
|-------|----------|
| Avatar do provedor | ícone Google/Microsoft + e-mail do usuário |
| Status da conexão | `Badge`: `success` (ativo), `error` (erro), `neutral` (pendente) |
| Canal de e-mail | Linha com ícone `mail` + status de sincronização |
| Canal de calendário | Linha com ícone `calendar` + status de sincronização |
| Botão desconectar | `Button` variante `"danger"` / `"ghost"` |

**Comportamentos:**
- Botão "Conectar com Google": redireciona para URL OAuth do servidor (via `/metadata` API)
- Botão "Conectar com Microsoft": idem para Microsoft
- Ao clicar "Desconectar": abre `ConfirmDialog` perguntando confirmação
- Status reflete `connectionStatus` do objeto `connectedAccount` no Twenty

---

### SettingsDevelopersPage

**Arquivo:** `src/pages/settings/SettingsDevelopersPage.tsx`

Gerenciamento de webhooks da workspace. Permite criar webhooks para eventos de criação, atualização e exclusão de registros.

**Referência SLDS 2:** [Data Table](https://www.lightningdesignsystem.com/components/data-tables/), [Form Element](https://www.lightningdesignsystem.com/components/form-element/)

**Anatomia:**

| # | Elemento | Descrição |
|---|----------|-----------|
| 1 | `PageHeader` | Título "Desenvolvedores" + botão "Adicionar Webhook" |
| 2 | Tabela de webhooks | Colunas: URL, Eventos, Data de criação, Excluir |
| 3 | `EmptyState` | Exibido quando não há webhooks |
| 4 | Modal de criação | Formulário: URL de destino, Descrição, Checkboxes de operações |
| 5 | Aviso de segurança | Instruções sobre assinatura HMAC do webhook |

**Anatomia do modal de criação:**

| Campo | Tipo |
|-------|------|
| URL de Destino | `Input` obrigatório, `placeholder: "https://..."` |
| Descrição | `Input` opcional |
| Operações | `Checkbox` para cada: `*` (Todos), `create`, `update`, `delete` |

**Especificação visual dos checkboxes de operação:**
- Agrupados horizontalmente: `display: flex`, `gap: spacingSmall`, `flexWrap: wrap`
- Chips seleccionáveis: `padding: spacingXXSmall spacingSmall`, `borderRadius: radiusMedium`, `border: 1px solid borderDefault`
- Selecionado: `backgroundColor: brandPrimaryLight`, `borderColor: brandPrimary`, `color: brandPrimary`

---

### SettingsSecurityPage

**Arquivo:** `src/pages/settings/SettingsSecurityPage.tsx`

Gerenciamento de provedores SSO (SAML/OIDC) e políticas de senha/autenticação.

**Referência SLDS 2:** [Card](https://www.lightningdesignsystem.com/components/cards/), [Form Element](https://www.lightningdesignsystem.com/components/form-element/)

**Anatomia:**

| # | Elemento | Descrição |
|---|----------|-----------|
| 1 | `PageHeader` | Título "Segurança" |
| 2 | Seção SSO | Lista de provedores de identidade + botão "Adicionar Provedor" |
| 3 | Cards de provedor | Um card por provedor com nome, tipo (SAML/OIDC), status e ações |
| 4 | Modal de criação | Formulário de adicionar provedor (tipo + campos específicos) |
| 5 | Seção Política de Senha | Switch para 2FA obrigatório + campo de tamanho mínimo de senha |
| 6 | Seção SP Metadata | Dados SAML SP para configuração do Identity Provider |

**Anatomia do modal de provedor SSO:**

| Campo SAML | Campo OIDC |
|------------|------------|
| Nome do Provedor | Nome do Provedor |
| XML de Metadados | Client ID |
| — | Client Secret |
| — | Issuer URL |

**Especificação visual:**
- Cards de provedor: `border: 1px solid borderDefault`, `borderRadius: radiusMedium`, `padding: spacingMedium spacingLarge`
- Badge de status: `success` (Ativo), `neutral` (Inativo/Pendente)
- `Switch` para 2FA: label "Exigir autenticação de dois fatores", helpText explicativo
- Campo senha mínima: `Input type="number"` com `min=8`, `max=128`, `defaultValue=8`
- SP Metadata: `CopyInput` com URL do SP e Entity ID em linhas separadas

---

## Queries e Mutations GraphQL

### useActivities — Queries

```graphql
# listActivities (gqlWorkspace)
query {
  tasks(
    orderBy: { createdAt: DescNullsLast }
    filter: { deletedAt: { is: NULL } }
  ) {
    edges {
      node {
        id
        title
        status
        dueAt
        bodyV2 { markdown }
        assignee {
          id
          name { firstName lastName }
        }
        createdAt
        updatedAt
      }
    }
  }
}
```

### useActivities — Mutations

```graphql
# createActivity (gqlWorkspace)
mutation CreateTask($input: TaskCreateInput!) {
  createTask(data: $input) {
    id title status dueAt createdAt
  }
}

# updateActivity (gqlWorkspace)
mutation UpdateTask($id: ID!, $input: TaskUpdateInput!) {
  updateTask(id: $id, data: $input) {
    id title status dueAt updatedAt
  }
}

# deleteActivity (gqlWorkspace)
mutation DeleteTask($id: ID!) {
  deleteTask(id: $id) { id }
}
```

### useWebhooks — Queries

```graphql
# listWebhooks (gqlWorkspace)
query {
  webhooks(orderBy: { createdAt: DescNullsLast }) {
    edges {
      node {
        id
        targetUrl
        description
        operations
        secret
        createdAt
      }
    }
  }
}
```

### useWebhooks — Mutations

```graphql
# createWebhook (gqlWorkspace)
mutation CreateWebhook($input: WebhookCreateInput!) {
  createWebhook(data: $input) {
    id targetUrl description operations createdAt
  }
}

# deleteWebhook (gqlWorkspace)
mutation DeleteWebhook($id: ID!) {
  deleteWebhook(id: $id) { id }
}
```

### SettingsAccountsPage — Queries

```graphql
# connectedAccounts (gql — metadata endpoint)
query {
  connectedAccounts {
    edges {
      node {
        id
        accountOwnerId
        provider
        handle
        connectionStatus
        messageChannels {
          edges {
            node { id syncStatus }
          }
        }
        calendarChannels {
          edges {
            node { id syncStatus }
          }
        }
      }
    }
  }
}
```

### SettingsSecurityPage — Mutations

```graphql
# createSSOIdentityProvider (gql — metadata endpoint)
mutation CreateSSOIdentityProvider($input: SetupSsoInput!) {
  createSSOIdentityProvider(input: $input) {
    id
    type
    name
    status
    issuer
  }
}

# deleteSSOIdentityProvider (gql — metadata endpoint)
mutation DeleteSSOIdentityProvider($id: String!) {
  deleteSSOIdentityProvider(input: { id: $id }) { id }
}
```

---

## Alterações de Roteamento

Alterações realizadas em `src/AppRouter.tsx`:

| Rota | Componente | Novidade |
|------|------------|---------|
| `/activities` | `ActivitiesPage` | Nova |
| `/settings/accounts` | `SettingsAccountsPage` | Nova |
| `/settings/developers` | `SettingsDevelopersPage` | Nova |
| `/settings/security` | `SettingsSecurityPage` | Nova |
| `*` (wildcard) | `NotFoundPage` | Alterada (antes: `DashboardPage`) |

---

## Adições ao Sidebar

Alterações realizadas na configuração `sidebarItems` do `AppRouter.tsx`:

### Seção Principal (Main)

```tsx
{
  id: 'activities',
  label: 'Atividades',
  icon: 'check-square',
  href: '#/activities',
  section: 'main',
}
```

### Seção Administração

```tsx
{
  id: 'settings-accounts',
  label: 'Contas',
  icon: 'mail',
  href: '#/settings/accounts',
  section: 'admin',
},
{
  id: 'settings-developers',
  label: 'Desenvolvedores',
  icon: 'code',
  href: '#/settings/developers',
  section: 'admin',
},
{
  id: 'settings-security',
  label: 'Segurança',
  icon: 'lock',
  href: '#/settings/security',
  section: 'admin',
},
```

---

## Feature Flag

### IS_BACKOFFICE_ENABLED — Habilitado por Padrão

A partir da Fase 6, o feature flag `IS_BACKOFFICE_ENABLED` é habilitado automaticamente para **novas workspaces** e **seeds de desenvolvimento**.

**Arquivos alterados:**

1. `packages/twenty-server/src/engine/workspace-manager/workspace-migration/constant/default-feature-flags.ts`
   - Adicionado `FeatureFlagKey.IS_BACKOFFICE_ENABLED` ao array `DEFAULT_FEATURE_FLAGS`

2. `packages/twenty-server/src/engine/workspace-manager/dev-seeder/core/utils/seed-feature-flags.util.ts`
   - Adicionada entrada `IS_BACKOFFICE_ENABLED: true` no seed de feature flags

> **Nota:** Para workspaces existentes, o flag deve ser habilitado manualmente via painel de administração ou diretamente no banco de dados (`UPDATE "featureFlag" SET value = true WHERE key = 'IS_BACKOFFICE_ENABLED'`).

---

## Checklist de Acessibilidade

| Item | Componente |
|------|------------|
| `aria-label` em botões de ação | ActivitiesPage, SettingsDevelopersPage |
| `role="status"` em `Spinner` / estados de loading | Todas as páginas |
| Navegação por teclado no modal | ActivitiesPage, SettingsDevelopersPage, SettingsSecurityPage |
| Foco retornado ao trigger após fechar modal | Todos os modais |
| `aria-invalid` em campos obrigatórios sem preenchimento | Todos os formulários |
| `alt` em SVG da NotFoundPage | NotFoundPage |
| Contraste mínimo 4.5:1 em todos os textos | Todas as páginas (tokens Erencio.com Backoffice garantem isso) |
| `aria-describedby` em campos com helpText | SettingsSecurityPage (2FA switch) |

---

## Resumo da Estrutura de Arquivos

```
packages/erencio-front/src/
├── hooks/
│   ├── useActivities.ts          ✅ Novo — Fase 6
│   └── useWebhooks.ts            ✅ Novo — Fase 6
├── pages/
│   ├── NotFoundPage.tsx          ✅ Novo — Fase 6
│   ├── ActivitiesPage.tsx        ✅ Novo — Fase 6
│   └── settings/
│       ├── SettingsAccountsPage.tsx    ✅ Novo — Fase 6
│       ├── SettingsDevelopersPage.tsx  ✅ Novo — Fase 6
│       └── SettingsSecurityPage.tsx    ✅ Novo — Fase 6
└── AppRouter.tsx                 ✅ Atualizado — Fase 6

packages/twenty-server/src/
└── engine/workspace-manager/
    ├── workspace-migration/constant/default-feature-flags.ts   ✅ Atualizado — Fase 6
    └── dev-seeder/core/utils/seed-feature-flags.util.ts        ✅ Atualizado — Fase 6
```

---

## Definição de Pronto

A Fase 6 é considerada concluída quando:

- [x] Todas as 5 novas páginas estão implementadas e acessíveis via AppRouter
- [x] Os 2 novos hooks (`useActivities`, `useWebhooks`) são funcionais e tipados
- [x] `NotFoundPage` é exibida corretamente para rotas não reconhecidas
- [x] `ActivitiesPage` permite CRUD completo de tarefas com filtragem por status
- [x] `SettingsAccountsPage` lista e gerencia contas OAuth conectadas
- [x] `SettingsDevelopersPage` permite criar e excluir webhooks
- [x] `SettingsSecurityPage` gerencia provedores SSO e política de senha
- [x] Sidebar atualizado com novos itens de navegação
- [x] `IS_BACKOFFICE_ENABLED` habilitado por padrão para novas workspaces
- [x] Documentação desta fase criada em `docs/BACKOFFICE-PHASE6-PARITY.md`
- [x] `docs/BACKOFFICE-MIGRATION.md` atualizado para marcar Fase 6 como concluída
