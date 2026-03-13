# EDF — Erencio Design Framework

O EDF é a camada de personalização visual e comportamental do `erencio-front`. Permite que cada workspace tenha identidade visual, terminologia e comportamento de componentes próprios — sem rebuilds ou deploys separados por cliente.

## Visão Geral

```
erencio-edf          ← contratos, tokens, temas, providers, registro de slots
     ↓ consome
erencio-front        ← componentes + pages (usa useComponent, useTheme, useNomenclature)
erencio-selecao-*    ← apps públicas (podem usar tokens EDF diretamente)
erencio-{futuro}     ← qualquer nova app reutiliza o mesmo EDF
```

## Conceitos Centrais

### Perfil (`EdfProfile`)

Um perfil é o objeto que descreve toda a personalização de um cliente. Ele define:
- **Tokens** — valores visuais primitivos (cores, espaçamento, tipografia)
- **Nomenclaturas** — mapa de labels (ex: "Contatos" → "Cuidadores")
- **Overrides de componentes** — implementações alternativas para slots nomeados

Um perfil não precisa implementar tudo — ele herda do perfil base `erencio-default` e sobrescreve apenas o necessário:

```typescript
// profiles/amei-care/index.ts
import { erencioDefaultProfile } from '../erencio-default';
import { tokens } from './tokens';
import { nomenclature } from './nomenclature';

export const ameiCareProfile: EdfProfile = {
  ...erencioDefaultProfile,   // herda tudo
  tokens,                      // sobrescreve cores da marca Amei Care
  nomenclature,                // sobrescreve labels ("Cuidadores", "Contratos", ...)
  // components: não sobrescreve → usa os do erencio-default
};
```

### Tokens (`EdfTokens`)

O contrato `EdfTokens` é uma interface TypeScript que todo perfil deve satisfazer completamente. O `ThemeProvider` converte esse objeto em CSS custom properties `--edf-*` no elemento raiz do DOM. Os componentes usam `var(--edf-*)` e nunca sabem qual perfil está ativo.

Categorias de tokens:
- `color.brand` — cores primária, secundária e sutil da marca
- `color.neutral` — escala neutra 0–10
- `color.feedback` — success, warning, error, info (default + subtle)
- `spacing` — xs, sm, md, lg, xl
- `typography` — fontFamily, fontSize, fontWeight, lineHeight
- `radius` — sm, md, lg, full
- `elevation` — low, mid, high (box-shadow)
- `zIndex` — modal, overlay, toast, tooltip

### Slots e Component Registry

O mecanismo central do EDF. Em vez de instanciar componentes diretamente, o `erencio-front` usa `useComponent('nome.do.slot')`, que resolve qual implementação está registrada no perfil ativo.

```typescript
// erencio-front chama:
const ShellLayout = useComponent('shell.layout');
// → perfil "amei-care" herda erencio-default → retorna DefaultShell
// → perfil "salesforce-lightning" → retorna SalesforceShell
```

#### Mapa de Slots (`EdfSlotMap`)

| Slot | Props | Descrição |
|------|-------|-----------|
| `shell.layout` | `ShellLayoutProps` | Container principal do app (topbar + sidebar + conteúdo) |
| `shell.sidebar` | `SidebarProps` | Painel lateral de navegação |
| `shell.topbar` | `TopbarProps` | Barra superior |
| `shell.sidebar.item` | `SidebarItemProps` | Item individual na sidebar |
| `record.list.container` | `RecordListContainerProps` | Container da listagem de registros |
| `record.list.row` | `RecordListRowProps` | Linha de um registro na lista |
| `record.list.toolbar` | `RecordListToolbarProps` | Barra de ações da listagem |
| `record.list.empty` | `EmptyStateProps` | Estado vazio da listagem |
| `record.detail.panel` | `RecordDetailPanelProps` | Painel de detalhes do registro |
| `record.detail.header` | `RecordHeaderProps` | Cabeçalho (breadcrumb + avatar + nome) |
| `record.detail.field` | `FieldRendererProps` | Renderizador de campo individual |
| `record.detail.timeline` | `TimelineProps` | Timeline de atividades |
| `ui.button` | `ButtonProps` | Botão primitivo |
| `ui.badge` | `BadgeProps` | Badge/pill de status |
| `ui.modal` | `ModalProps` | Modal com focus trap |
| `ui.toast` | `ToastProps` | Notificação temporária |

### Nomenclaturas (`NomenclatureMap`)

Permite traduzir nomes de objetos e ações do CRM para a linguagem do cliente, sem alterar código de componentes:

```typescript
const { t } = useNomenclature();
<PageHeader title={t.objects.contact.plural} />
// "Contatos" no perfil default
// "Cuidadores" no perfil amei-care
```

O mapa cobre:
- `objects` — singular/plural por tipo de objeto (contact, company, opportunity, ...)
- `actions` — criar, editar, excluir, salvar, cancelar
- `ui` — configurações, dashboard, etc.

## Estrutura do Pacote `erencio-edf`

> **Status:** planejado. O pacote ainda não existe. Os tokens vivem em `erencio-front/src/tokens/tokens.ts`.

```
packages/erencio-edf/
└── src/
    ├── core/
    │   ├── registry/        ← EdfSlotMap, ComponentRegistry, useComponent
    │   ├── tokens/          ← EdfTokens (interface), css-vars.ts (tokens → CSS vars)
    │   ├── theme/           ← ThemeProvider, useTheme
    │   ├── nomenclature/    ← NomenclatureProvider, useNomenclature, NomenclatureMap
    │   └── layout/          ← EdfLayoutConfig (posições, breakpoints)
    └── profiles/
        ├── erencio-default/ ← Perfil base (eds-v1). Todos os slots implementados.
        ├── amei-care/       ← Herda erencio-default. Tokens Amei Care + nomenclaturas.
        ├── salesforce-lightning/  ← Reimplementa slots visuais no estilo SLDS 2.
        └── notion-inspired/ ← Próximo ao visual original do Twenty.
```

## Persistência por Workspace

Os perfis EDF são configurados nas tabelas `core.workspace` e `core.user`:

### `core.workspace`

| Coluna | Tipo | Default | Descrição |
|--------|------|---------|-----------|
| `edfProfileId` | `varchar` | `'eds-v1'` | Perfil EDF do workspace |
| `edfProfilePolicy` | `enum` | `ALLOW_USER_CHOICE` | Se usuários podem sobrescrever o perfil |

### `core.user`

| Coluna | Tipo | Default | Descrição |
|--------|------|---------|-----------|
| `edfProfileId` | `varchar nullable` | `null` | Override pessoal do usuário (`null` = herda do workspace) |

**Migration:** `1772300000000-add-edf-profile-columns.ts`

**Enum `EdfProfilePolicy`** (em `twenty-shared/src/workspace/types/EdfProfilePolicy.ts`):
- `ALLOW_USER_CHOICE` — usuário pode usar seu próprio perfil
- `FORCE_WORKSPACE` — todos os usuários usam o perfil do workspace

### Resolução do Perfil Ativo

```typescript
// Bootstrap do erencio-front
const activeProfileId =
  workspace.edfProfilePolicy === EdfProfilePolicy.FORCE_WORKSPACE
    ? workspace.edfProfileId
    : (user.edfProfileId ?? workspace.edfProfileId);
```

### Exemplos

| Workspace | `edfProfileId` | `edfProfilePolicy` | `user.edfProfileId` | Perfil ativo |
|-----------|---------------|-------------------|---------------------|-------------|
| Todos (default) | `eds-v1` | `ALLOW_USER_CHOICE` | `null` | `eds-v1` |
| Amei Care | `amei-care` | `FORCE_WORKSPACE` | qualquer | `amei-care` |
| Cliente Premium | `salesforce-lightning` | `ALLOW_USER_CHOICE` | `null` | `salesforce-lightning` |
| Cliente Premium | `salesforce-lightning` | `ALLOW_USER_CHOICE` | `notion-inspired` | `notion-inspired` |

## Fluxo em Runtime

```
1. Usuário abre erencio-front
2. Bootstrap: GraphQL → workspace.edfProfileId + edfProfilePolicy + user.edfProfileId
3. Resolução: activeProfileId = "amei-care"
4. EdfProvider carrega ameiCareProfile
5. ThemeProvider aplica --edf-color-brand-primary = #[cor amei care] no DOM
6. NomenclatureProvider: t.objects.contact.plural = "Cuidadores"
7. Usuário navega para lista de Pessoas
8. erencio-front: const List = useComponent('record.list.container')
9. ameiCareProfile herda erencio-default → usa RecordList padrão
10. CSS vars aplicam identidade visual da Amei Care automaticamente
11. PageHeader exibe "Cuidadores" (não "Pessoas" / "Contatos")
```

## Plano de Implementação

| Fase | O que fazer | Status |
|------|------------|--------|
| **1** | Criar `erencio-edf` com `core/registry`, `core/tokens`, `core/nomenclature` e perfil `erencio-default` (migrando tokens de `erencio-front/src/tokens/`) | Planejado |
| **2** | Migrar componentes de `erencio-front` para usar `useComponent()` nos slots substituíveis | Planejado |
| **3** | Criar perfil `amei-care` (tokens + nomenclaturas) | Planejado |
| **4** | Criar perfil `notion-inspired` | Planejado |
| **5** | Criar perfil `salesforce-lightning` (reimplementa slots visuais no estilo SLDS 2) | Planejado |
| **6** | Bootstrap no `erencio-front`: carregar `activeProfileId` do GraphQL | Planejado |

## Adicionando um Novo Perfil

1. Crie `packages/erencio-edf/src/profiles/<nome>/`
2. Implemente `tokens.ts` satisfazendo o contrato `EdfTokens` (TypeScript valida em build)
3. Implemente `nomenclature.ts` sobrescrevendo os labels necessários
4. Opcionalmente implemente componentes em `components/` para os slots que devem ser substituídos
5. Exporte o perfil em `index.ts` como `EdfProfile`
6. Registre o id do perfil no workspace via admin panel ou migration de seed

Nenhuma migration de banco é necessária — o `edfProfileId` é `varchar` livre.
