# Erencio.com Backoffice Fase 5 — Configurações (Admin): Plano de Design e Implementação

Este documento especifica os componentes, comportamentos, tokens e estrutura de página para a Fase 5 da migração Erencio.com Backoffice (Configurações Admin). Todos os designs seguem os princípios do [SLDS 2](https://www.lightningdesignsystem.com/) adaptados para React, usando design tokens Erencio.com Backoffice (`--backoffice-g-*`).

---

## Índice

1. [Escopo](#escopo)
2. [Novos Componentes](#novos-componentes)
   - [Switch](#switch)
   - [SectionHeader](#sectionheader)
   - [CopyInput](#copyinput)
   - [SettingsLayout](#settingslayout)
3. [Novos Hooks](#novos-hooks)
   - [useWorkspaceSettings](#useworkspacesettings)
   - [useWorkspaceMembers](#useworkspacemembers)
   - [useRoles](#useroles)
   - [useDataModel](#usedatamodel)
   - [useApiKeys](#useapikeys)
4. [Novos Ícones](#novos-ícones)
5. [Páginas](#páginas)
   - [SettingsWorkspacePage](#settingsworkspacepage)
   - [SettingsMembersPage](#settingsmemberspage)
   - [SettingsMemberDetailPage](#settingsmemberdetailpage)
   - [SettingsRolesPage](#settingsrolespage)
   - [SettingsDataModelPage](#settingsdatamodelpage)
   - [SettingsApiKeysPage](#settingsapikeyspage)
   - [SettingsBillingPage](#settingsbillingpage)
6. [Queries e Mutations GraphQL](#queries-e-mutations-graphql)
7. [Alterações de Roteamento](#alterações-de-roteamento)
8. [Adições ao Sidebar](#adições-ao-sidebar)
9. [Adições de Design Tokens](#adições-de-design-tokens)
10. [Checklist de Acessibilidade](#checklist-de-acessibilidade)
11. [Resumo da Estrutura de Arquivos](#resumo-da-estrutura-de-arquivos)
12. [Definição de Pronto](#definição-de-pronto)

---

## Escopo

A Fase 5 entrega as páginas de **Configurações Administrativas** para o shell Erencio.com Backoffice. Os admins da workspace podem:

- Configurar nome, logo e política de frontend da workspace
- Visualizar, convidar e remover membros
- Visualizar e atribuir papéis (roles) a membros
- Ver o modelo de dados (objetos customizados) da workspace
- Criar, visualizar e revogar chaves de API
- Visualizar o plano de faturamento/assinatura da workspace

Navegação: o sidebar principal inclui uma nova entrada "Settings" que direciona para `/settings/workspace`. As sub-páginas de settings têm navegação lateral própria via `SettingsLayout`.

---

## Novos Componentes

### Switch

> Referência SLDS 2: [Checkbox Toggle](https://www.lightningdesignsystem.com/components/checkbox-toggle/)

**Arquivo:** `src/components/Switch/Switch.tsx`

Toggle booleano visual, usado para ativar/desativar opções de configuração.

```tsx
type SwitchProps = {
  id?: string;
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  helpText?: string;
  'aria-label'?: string;
};
```

**Anatomia (SLDS 2):**

| # | Elemento | Descrição |
|---|----------|-----------|
| 1 | Label | Texto descritivo acima ou à esquerda do toggle |
| 2 | Track | Trilha oval que muda de cor (neutro → brand) |
| 3 | Thumb | Círculo branco que desliza da esquerda para a direita |
| 4 | Faux Labels | "Off" / "On" visíveis dentro da trilha (opcional) |

**Especificação visual:**
- **Track desligado:** `background: neutral3` (cinza médio), `border-radius: radiusPill`
- **Track ligado:** `background: brandPrimary` (azul)
- **Thumb:** círculo branco `16×16px`, `box-shadow: elevationRaised`, transição `transform 0.15s ease`
- **Track size:** `40×24px`
- **Foco:** anel de foco no `<input type="checkbox">` oculto (`.sr-only`)
- **Desabilitado:** opacity 50%, `cursor: not-allowed`
- **Label:** `fontSize: fontSizeMedium`, `color: textLabel`, alinhado verticalmente ao centro do track

**Comportamentos:**
- Implementado como `<input type="checkbox">` invisível + track visual via CSS (padrão SLDS 2)
- Click em qualquer parte do componente alterna o estado
- `aria-checked` reflete o estado do input oculto

---

### SectionHeader

> Referência SLDS 2: [H2Title / Section](https://www.lightningdesignsystem.com/design-tokens/) — componente interno utilitário

**Arquivo:** `src/components/SectionHeader/SectionHeader.tsx`

Bloco reutilizável de cabeçalho de seção para páginas de settings. Composto de:
- Título (`<h2>`)
- Descrição opcional
- Ação opcional à direita (ex: botão "Adicionar")

```tsx
type SectionHeaderProps = {
  title: string;
  description?: string;
  rightAction?: React.ReactNode;
  style?: React.CSSProperties;
};
```

**Especificação visual:**
- **Título:** `fontSize: fontSizeLarge`, `fontWeight: fontWeightMedium`, `color: textDefault`
- **Descrição:** `fontSize: fontSizeMedium`, `color: textPlaceholder`, `marginTop: spacingXXSmall`
- **Layout:** flex row com `justify-content: space-between`; rightAction alinhado verticalmente ao centro
- **Border-bottom:** `1px solid borderDefault` abaixo do bloco, `paddingBottom: spacingSmall`
- **Margin-bottom:** `spacingMedium`

---

### CopyInput

> Referência SLDS 2: [Input — With Icon](https://www.lightningdesignsystem.com/components/input/) + clipboard interaction

**Arquivo:** `src/components/CopyInput/CopyInput.tsx`

Input somente leitura com botão de copiar para a área de transferência. Usado para exibir chaves de API e links de convite.

```tsx
type CopyInputProps = {
  value: string;
  label?: string;
  masked?: boolean;         // Exibe '••••••••' com toggle eye
  successMessage?: string;  // Mensagem exibida após cópia bem-sucedida
  style?: React.CSSProperties;
};
```

**Anatomia:**
1. Label (opcional)
2. Input (somente leitura, valor mascarado ou normal)
3. Botão ícone "copy" ou "eye/eye-off" à direita (dentro do input)

**Especificação visual:**
- Segue exatamente o estilo do componente `Input` (mesmos tokens de borda, padding, altura)
- Sufixo de ícone: `Icon name="copy"` (16px, `color: textPlaceholder`, hover `color: textDefault`)
- Se `masked=true`: mostra `•••••••` e exibe `Icon name="eye"` também (toggle para revelar)
- Feedback de cópia: substituição temporária do ícone por `Icon name="success"` em verde por 2s
- `aria-label="Copiar [label]"` no botão de cópia

---

### SettingsLayout

**Arquivo:** `src/components/SettingsLayout/SettingsLayout.tsx`

Layout de 2 colunas para todas as páginas de settings:
- Esquerda: nav list vertical (links para seções de settings)
- Direita: área de conteúdo (children)

```tsx
type SettingsNavItem = {
  id: string;
  label: string;
  href: string;
  icon?: IconName;
};

type SettingsNavGroup = {
  label?: string;
  items: SettingsNavItem[];
};

type SettingsLayoutProps = {
  children: React.ReactNode;
  navGroups?: SettingsNavGroup[];
  title?: string;
};
```

**Especificação visual:**
- **Container:** flex row, `minHeight: 100%`, `gap: spacingXLarge`
- **Nav (esquerda):** `width: 200px`, `flexShrink: 0`, `paddingTop: spacingMedium`
  - **Group label:** `fontSize: fontSizeXSmall`, `fontWeight: fontWeightMedium`, `color: textPlaceholder`, `textTransform: uppercase`, `letterSpacing: 0.08em`, `marginBottom: spacingXXSmall`
  - **Nav item:** `padding: spacingXSmall spacingSmall`, `borderRadius: radiusMedium`, `cursor: pointer`, `fontSize: fontSizeMedium`, `color: textLabel`, transição hover `backgroundColor: neutral1`
  - **Nav item ativo:** `backgroundColor: brandPrimaryLight`, `color: brandPrimary`, `fontWeight: fontWeightMedium`
  - **Ícone:** 14px, alinhado à esquerda do label, `gap: spacingXXSmall`
- **Content (direita):** flex 1, `maxWidth: 720px`, `paddingTop: spacingMedium`
- **Página title:** `fontSize: fontSizeXXLarge`, `fontWeight: fontWeightBold`, `marginBottom: spacingXLarge`

**Comportamentos:**
- Item ativo determinado por `window.location.hash` (roteamento hash)
- Em mobile (`< 768px`): nav colapsa para um `<select>` dropdown de navegação

---

## Novos Hooks

### useWorkspaceSettings

**Arquivo:** `src/hooks/useWorkspaceSettings.ts`

```ts
type WorkspaceSettings = {
  id: string;
  displayName: string;
  logo: string | null;
  frontendPolicy: 'ALLOW_USER_CHOICE' | 'FORCE_TWENTY' | 'FORCE_BACKOFFICE';
  domainName: { primaryLinkUrl: string } | null;
};

type UseWorkspaceSettingsReturn = {
  settings: WorkspaceSettings | null;
  loading: boolean;
  error: string | null;
  updateName: (name: string) => Promise<void>;
  updateFrontendPolicy: (policy: WorkspaceSettings['frontendPolicy']) => Promise<void>;
  deleteWorkspace: () => Promise<void>;
  refresh: () => void;
};
```

Usa a API `/metadata` (endpoint `gql`). Queries: `currentWorkspace`. Mutations: `updateWorkspace`, `deleteCurrentWorkspace`.

---

### useWorkspaceMembers

**Arquivo:** `src/hooks/useWorkspaceMembers.ts`

```ts
type WorkspaceMember = {
  id: string;
  userId: string;
  name: { firstName: string; lastName: string };
  userEmail: string;
  avatarUrl: string | null;
  createdAt: string;
};

type UseWorkspaceMembersReturn = {
  members: WorkspaceMember[];
  loading: boolean;
  error: string | null;
  inviteLink: string | null;
  sendInvitation: (emails: string[]) => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
  generateInviteLink: () => Promise<void>;
  refresh: () => void;
};
```

Combina queries na API de workspace (`gqlWorkspace`) para listar membros e na `/metadata` para convites e link de convite.

---

### useRoles

**Arquivo:** `src/hooks/useRoles.ts`

```ts
type Role = {
  id: string;
  name: string;
  description: string | null;
  isEditable: boolean;
  workspaceMemberIds: string[];
};

type UseRolesReturn = {
  roles: Role[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
};
```

Usa a API `/metadata` para listar papéis disponíveis na workspace.

---

### useDataModel

**Arquivo:** `src/hooks/useDataModel.ts`

```ts
type ObjectMetadata = {
  id: string;
  nameSingular: string;
  namePlural: string;
  labelSingular: string;
  labelPlural: string;
  description: string | null;
  isCustom: boolean;
  isActive: boolean;
  fieldsCount: number;
};

type UseDataModelReturn = {
  objects: ObjectMetadata[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
};
```

Usa a API `/metadata` para listar objetos do workspace (excluindo os de sistema).

---

### useApiKeys

**Arquivo:** `src/hooks/useApiKeys.ts`

```ts
type ApiKey = {
  id: string;
  name: string;
  expiresAt: string | null;
  createdAt: string;
};

type UseApiKeysReturn = {
  apiKeys: ApiKey[];
  loading: boolean;
  error: string | null;
  createApiKey: (name: string, expiresAt?: string) => Promise<{ id: string; token: string }>;
  revokeApiKey: (id: string) => Promise<void>;
  refresh: () => void;
};
```

Usa a API `/metadata` para CRUD de API keys.

---

## Novos Ícones

Adicionados ao `src/components/Icon/Icon.tsx`:

| Nome | Uso |
|------|-----|
| `key` | API keys |
| `copy` | CopyInput, copiar para clipboard |
| `shield` | Roles, permissões |
| `database` | Modelo de dados |
| `credit-card` | Billing |
| `members` | Membros da workspace |
| `invite` | Convite de membros |
| `check-circle` | Confirmação de cópia |
| `workspace` | Configurações gerais da workspace |

---

## Páginas

### SettingsWorkspacePage

**Arquivo:** `src/pages/settings/SettingsWorkspacePage.tsx`

**Rota:** `/settings/workspace`

Permite ao admin configurar:
- **Nome da workspace:** Input com autosave (debounce 500ms) ou botão salvar
- **Política de frontend:** Select com `ALLOW_USER_CHOICE`, `FORCE_TWENTY`, `FORCE_BACKOFFICE`
- **Zona de perigo:** Botão "Excluir workspace" com `ConfirmDialog` destrutivo

**Layout:** `SettingsLayout` > seções com `SectionHeader` + controles

---

### SettingsMembersPage

**Arquivo:** `src/pages/settings/SettingsMembersPage.tsx`

**Rota:** `/settings/members`

- **Secção Membros ativos:** `DataTable` com colunas `Avatar/Nome`, `Email`, `Membro desde`; clique na linha navega para `SettingsMemberDetailPage`
- **Secção Convites pendentes:** lista de convites com email e status
- **Formulário de convite:** campo de email + botão "Enviar convite"
- **Link de convite:** `CopyInput` com o link gerado

---

### SettingsMemberDetailPage

**Arquivo:** `src/pages/settings/SettingsMemberDetailPage.tsx`

**Rota:** `/settings/members/:memberId`

- Cabeçalho com `Avatar`, nome e email do membro
- Seção "Papéis": lista roles atribuídas com possibilidade de remoção (se admin)
- Botão "Remover membro" com `ConfirmDialog` destrutivo

---

### SettingsRolesPage

**Arquivo:** `src/pages/settings/SettingsRolesPage.tsx`

**Rota:** `/settings/roles`

- `DataTable` com colunas `Nome`, `Descrição`, `Membros`
- Badge indicando se o papel é do sistema (não editável) ou customizado
- Emptystate quando sem papéis customizados

---

### SettingsDataModelPage

**Arquivo:** `src/pages/settings/SettingsDataModelPage.tsx`

**Rota:** `/settings/data-model`

- `DataTable` com colunas `Objeto`, `Tipo` (Standard / Custom), `Campos`, `Status` (Active/Inactive)
- Badge colorido: Custom = `brand`, Standard = `neutral`
- Badge status: Active = `success`, Inactive = `warning`
- EmptyState quando sem objetos customizados

---

### SettingsApiKeysPage

**Arquivo:** `src/pages/settings/SettingsApiKeysPage.tsx`

**Rota:** `/settings/api-keys`

- Seção "Criar chave": `Input` + `Select` (expiração) + botão "Gerar"
- Após criação: `Modal` ou seção em destaque com `CopyInput` masked para o token (visível apenas uma vez)
- `DataTable` com chaves existentes: `Nome`, `Criada em`, `Expira em`, botão "Revogar"
- `ConfirmDialog` antes de revogar

---

### SettingsBillingPage

**Arquivo:** `src/pages/settings/SettingsBillingPage.tsx`

**Rota:** `/settings/billing`

- Card com plano atual (nome, status, próxima cobrança)
- Badge de status: `active` → success, `trialing` → info, `past_due` → warning
- Link externo para portal de faturamento (Stripe customer portal)
- EmptyState quando sem assinatura ativa

---

## Queries e Mutations GraphQL

### Endpoint `/metadata`

```graphql
# Workspace settings
query GetCurrentWorkspace {
  currentWorkspace {
    id
    displayName
    logo
    frontendPolicy
    domainName { primaryLinkUrl }
  }
}

mutation UpdateWorkspace($input: UpdateWorkspaceInput!) {
  updateWorkspace(data: $input) {
    id
    displayName
    frontendPolicy
  }
}

mutation DeleteCurrentWorkspace {
  deleteCurrentWorkspace { id }
}

# Roles
query GetRoles {
  roles {
    id
    name
    description
    isEditable
    workspaceMembers { id }
  }
}

# Objects (data model)
query GetObjectMetadata {
  objects(filter: { isSystem: { is: FALSE } }) {
    edges {
      node {
        id
        nameSingular
        namePlural
        labelSingular
        labelPlural
        description
        isCustom
        isActive
        fields { totalCount }
      }
    }
  }
}

# API Keys
query GetApiKeys {
  apiKeys(filter: { revokedAt: { is: NULL } }) {
    edges {
      node {
        id
        name
        expiresAt
        createdAt
      }
    }
  }
}

mutation CreateApiKey($name: String!, $expiresAt: DateTime) {
  createApiKey(data: { name: $name, expiresAt: $expiresAt }) {
    id
    name
    expiresAt
  }
}

mutation GenerateApiKeyToken($apiKeyId: String!, $expiresAt: String!) {
  generateApiKeyToken(apiKeyId: $apiKeyId, expiresAt: $expiresAt) {
    token
  }
}

mutation DeleteOneApiKey($id: String!) {
  deleteOneApiKey(id: $id) { id }
}

# Billing
query GetBillingSubscription {
  currentBillingSubscription {
    id
    status
    interval
    currentPeriodEnd
    trialEnd
  }
}

# Invitations
query GetWorkspaceInvitations {
  workspaceInvitations {
    id
    email
    expiresAt
    status
  }
}

mutation SendInvitations($emails: [String!]!) {
  sendInvitations(emails: $emails)
}

mutation GenerateWorkspaceInviteLink {
  generateWorkspaceInviteLink
}
```

### Endpoint `/graphql` (workspace)

```graphql
# Members
query FindManyWorkspaceMembers($filter: WorkspaceMemberFilterInput, $first: Int) {
  workspaceMembers(filter: $filter, first: $first, orderBy: [{ createdAt: AscNullsLast }]) {
    edges {
      node {
        id
        userId
        name { firstName lastName }
        userEmail
        avatarUrl
        createdAt
      }
    }
    totalCount
  }
}

mutation DeleteUserWorkspace($userId: String!) {
  deleteUserWorkspace(userId: $userId) { success }
}
```

---

## Alterações de Roteamento

Novas rotas adicionadas em `AppRouter.tsx` (prefixo `/settings`):

```
/settings/workspace      → SettingsWorkspacePage
/settings/members        → SettingsMembersPage
/settings/members/:id    → SettingsMemberDetailPage
/settings/roles          → SettingsRolesPage
/settings/data-model     → SettingsDataModelPage
/settings/api-keys       → SettingsApiKeysPage
/settings/billing        → SettingsBillingPage
```

Rota `/settings` faz redirect para `/settings/workspace`.

---

## Adições ao Sidebar

Nova seção "Administration" no sidebarSections em `AppRouter.tsx`:

```tsx
{
  label: 'Administration',
  items: [
    { id: 'settings-workspace', label: 'Workspace', href: '#/settings/workspace', icon: <Icon name="settings" /> },
    { id: 'settings-members', label: 'Members', href: '#/settings/members', icon: <Icon name="members" /> },
    { id: 'settings-roles', label: 'Roles', href: '#/settings/roles', icon: <Icon name="shield" /> },
    { id: 'settings-data-model', label: 'Data Model', href: '#/settings/data-model', icon: <Icon name="database" /> },
    { id: 'settings-api-keys', label: 'API Keys', href: '#/settings/api-keys', icon: <Icon name="key" /> },
    { id: 'settings-billing', label: 'Billing', href: '#/settings/billing', icon: <Icon name="credit-card" /> },
  ],
}
```

---

## Adições de Design Tokens

Nenhum novo token de nível global necessário. Os tokens existentes cobrem todos os estilos:
- `colorTokens.errorLight` + `colorTokens.error` → zona de perigo / badges de erro
- `colorTokens.brandPrimaryLight` → nav item ativo
- `spacingTokens.spacingXXLarge` → padding lateral da content area
- `typographyTokens.fontSizeXSmall` com `textTransform: uppercase` → group labels do nav

---

## Checklist de Acessibilidade

- [ ] SettingsLayout nav: `<nav aria-label="Settings navigation">` com `role="list"` nos itens
- [ ] Switch: input oculto com `role="switch"`, `aria-checked`, `aria-label`
- [ ] CopyInput: botão de cópia com `aria-label="Copy [fieldName]"`, feedback `aria-live="polite"`
- [ ] ConfirmDialog nos destrutivos: `aria-describedby` aponta para o texto de confirmação
- [ ] DataTables nas páginas de settings: caption descritivo (ex: "Workspace members")
- [ ] Todos os formulários: labels associados por `htmlFor/id`, erros via `aria-describedby`
- [ ] Modais de criação de API key: foco inicial no primeiro campo, foco retorna ao trigger ao fechar

---

## Resumo da Estrutura de Arquivos

```
packages/erencio-front/
└── src/
    ├── components/
    │   ├── Switch/
    │   │   ├── Switch.tsx
    │   │   └── index.ts
    │   ├── SectionHeader/
    │   │   ├── SectionHeader.tsx
    │   │   └── index.ts
    │   ├── CopyInput/
    │   │   ├── CopyInput.tsx
    │   │   └── index.ts
    │   ├── SettingsLayout/
    │   │   ├── SettingsLayout.tsx
    │   │   └── index.ts
    │   ├── Icon/
    │   │   └── Icon.tsx       ← novos ícones adicionados
    │   └── index.ts           ← novos exports
    ├── hooks/
    │   ├── useWorkspaceSettings.ts
    │   ├── useWorkspaceMembers.ts
    │   ├── useRoles.ts
    │   ├── useDataModel.ts
    │   └── useApiKeys.ts
    └── pages/
        └── settings/
            ├── SettingsWorkspacePage.tsx
            ├── SettingsMembersPage.tsx
            ├── SettingsMemberDetailPage.tsx
            ├── SettingsRolesPage.tsx
            ├── SettingsDataModelPage.tsx
            ├── SettingsApiKeysPage.tsx
            └── SettingsBillingPage.tsx
```

---

## Definição de Pronto

Uma página de settings é considerada pronta quando:

1. Todos os dados são carregados via queries GraphQL documentadas acima
2. Todas as ações de escrita (update, create, delete) funcionam com feedback visual (toast/spinner)
3. O componente usa apenas design tokens Erencio.com Backoffice
4. Acessibilidade: `SectionHeader`, `Switch`, `CopyInput` — todos com ARIA correto
5. `SettingsLayout` exibe o item ativo correto baseado na rota atual
6. Rotas adicionadas ao `AppRouter.tsx`
7. Sidebar atualizado com nova seção "Administration"
8. Documentado neste arquivo
