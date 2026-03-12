# Erencio.com Backoffice Fase 1 — Listagem de Registros: Plano de Design e Implementação

Este documento especifica os componentes, comportamentos, tokens e estrutura de página para a Fase 1 da migração Erencio.com Backoffice (Listagem de Registros). Todos os designs seguem os princípios do [SLDS 2](https://www.lightningdesignsystem.com/) adaptados para React, usando design tokens Erencio.com Backoffice (`--backoffice-g-*`).

---

## Índice

1. [Escopo](#escopo)
2. [Novos Componentes](#novos-componentes)
   - [Checkbox](#checkbox)
   - [Select](#select)
   - [Spinner](#spinner)
   - [Icon (utilitário)](#icon-utilitário)
   - [SearchBar](#searchbar)
   - [DataTable](#datatable)
   - [Pagination](#pagination)
   - [EmptyState](#emptystate)
   - [PageHeader](#pageheader)
3. [Novos Hooks](#novos-hooks)
   - [useRecordList](#userecordlist)
4. [Páginas](#páginas)
   - [ContactsListPage](#contactslistpage)
   - [CompaniesListPage](#companieslistpage)
   - [DealsListPage (Oportunidades)](#dealslistpage-oportunidades)
5. [Queries GraphQL](#queries-graphql)
6. [Alterações de Roteamento](#alterações-de-roteamento)
7. [Adições de Design Tokens](#adições-de-design-tokens)
8. [Checklist de Acessibilidade](#checklist-de-acessibilidade)

---

## Escopo

A Fase 1 entrega **listagem somente leitura de registros** para os três objetos CRM principais. Os usuários podem:

- Visualizar uma tabela paginada de registros
- Ordenar por coluna (ascendente/descendente em coluna única)
- Buscar com texto
- Selecionar linhas (checkbox) — sem ações em lote ainda, mas a base está preparada
- Navegar páginas via controles de paginação

Sem edição inline, sem criação de registros, sem exclusão de registros nesta fase.

---

## Novos Componentes

### Checkbox

> Ref SLDS 2: [Checkbox](https://www.lightningdesignsystem.com/components/checkbox/)

**Arquivo:** `src/components/Checkbox/Checkbox.tsx`

```tsx
type CheckboxProps = {
  id?: string;
  label?: string;
  checked?: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  'aria-label'?: string;
};
```

**Especificação visual:**
- Caixa 16×16px, `border: 1px solid borderInput`, `border-radius: radiusSmall` (2px)
- Marcado: `backgroundColor: brandPrimary`, checkmark SVG branco
- Indeterminado: `backgroundColor: brandPrimary`, traço horizontal branco
- Anel de foco: `0 0 0 2px brandPrimaryLight, 0 0 0 4px brandPrimary`
- Label (se fornecido) aparece à direita, `fontSizeMedium`, `fontWeightRegular`
- Hover: borda escurece para `neutral6`

---

### Select

> Ref SLDS 2: [Select](https://www.lightningdesignsystem.com/components/select/)

**Arquivo:** `src/components/Select/Select.tsx`

```tsx
type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type SelectProps = {
  id?: string;
  label?: string;
  value?: string;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  hint?: string;
  onChange?: (value: string) => void;
};
```

**Especificação visual:**
- Usa elemento `<select>` nativo estilizado com tokens Erencio.com Backoffice
- Altura: 36px, `padding: 0 spacingSmall`, borda corresponde ao componente Input
- Indicador de seta via chrome nativo do navegador (não sobrescrevemos)
- Label acima do select, correspondendo ao estilo do label do Input
- Estados: padrão, foco (borda azul), desabilitado (fundo cinza), erro (borda vermelha + mensagem)

---

### Spinner

> Ref SLDS 2: [Spinners](https://www.lightningdesignsystem.com/components/spinners/)

**Arquivo:** `src/components/Spinner/Spinner.tsx`

```tsx
type SpinnerSize = 'x-small' | 'small' | 'medium' | 'large';

type SpinnerProps = {
  size?: SpinnerSize;
  label?: string;         // label para leitor de tela, padrão "Loading"
  inline?: boolean;       // inline-block vs overlay centralizado
};
```

**Especificação visual:**
- Animação apenas CSS: borda circular com um arco colorido girando (`animation: spin 0.8s linear infinite`)
- Tamanhos: x-small=16px, small=24px, medium=32px, large=48px
- Cor: arco `brandPrimary`, trilha `neutral2`
- Quando `inline=false` (padrão), centralizado com backdrop semi-transparente

---

### Icon (utilitário)

**Arquivo:** `src/components/Icon/Icon.tsx`

Sistema mínimo de ícones SVG inline usando paths SVG. Sem dependência de biblioteca de ícones.

```tsx
type IconName =
  | 'search'
  | 'sort-ascending'
  | 'sort-descending'
  | 'chevron-left'
  | 'chevron-right'
  | 'chevron-down'
  | 'check'
  | 'minus'
  | 'close'
  | 'filter'
  | 'refresh';

type IconProps = {
  name: IconName;
  size?: number;           // padrão 16
  color?: string;          // padrão currentColor
  'aria-hidden'?: boolean; // padrão true
  className?: string;
};
```

**Especificação visual:**
- Renderizado como `<svg>` com `width`/`height` da prop `size` e `fill` de `color`
- `aria-hidden="true"` por padrão (decorativo)
- Cada ícone é um `<path d="...">` dentro de viewBox 16×16

---

### SearchBar

> Baseado em SLDS 2 [Input — tipo Search](https://www.lightningdesignsystem.com/components/input/)

**Arquivo:** `src/components/SearchBar/SearchBar.tsx`

```tsx
type SearchBarProps = {
  value: string;
  placeholder?: string;  // padrão "Buscar…"
  onChange: (value: string) => void;
  onClear?: () => void;
  debounceMs?: number;    // padrão 300
  disabled?: boolean;
  'aria-label'?: string;
};
```

**Especificação visual:**
- Input com ícone de busca (`Icon name="search"`) à esquerda
- Botão limpar (×) aparece quando o valor não está vazio
- Borda: `1px solid borderInput`, foco: `borderFocus`
- Altura: 36px, border-radius: `radiusMedium`
- Estado interno faz debounce do callback onChange

---

### DataTable

> Ref SLDS 2: [Data Table](https://www.lightningdesignsystem.com/components/data-tables/)

**Arquivo:** `src/components/DataTable/DataTable.tsx`

Este é o componente principal da Fase 1.

```tsx
type SortDirection = 'asc' | 'desc' | null;

type ColumnDefinition<TRecord> = {
  key: string;
  label: string;
  accessor: keyof TRecord | ((record: TRecord) => React.ReactNode);
  sortable?: boolean;
  width?: string;             // largura CSS, ex: "200px" ou "25%"
  align?: 'left' | 'center' | 'right';
  renderCell?: (value: unknown, record: TRecord) => React.ReactNode;
};

type DataTableProps<TRecord extends { id: string }> = {
  columns: ColumnDefinition<TRecord>[];
  data: TRecord[];
  loading?: boolean;
  emptyMessage?: string;

  // Seleção
  selectable?: boolean;
  selectedIds?: Set<string>;
  onSelectionChange?: (selected: Set<string>) => void;

  // Ordenação
  sortColumn?: string;
  sortDirection?: SortDirection;
  onSort?: (column: string, direction: SortDirection) => void;

  // Clique na linha
  onRowClick?: (record: TRecord) => void;

  // Linhas listradas
  striped?: boolean;

  // Com bordas
  bordered?: boolean;
};
```

**Anatomia (SLDS 2):**

| # | Elemento | Descrição |
|---|---------|-----------|
| 1 | Linha de cabeçalho | Linha superior com títulos de coluna, controles de ordenação |
| 2 | Célula de cabeçalho | `<th>` com label + botão de ícone de ordenação |
| 3 | Checkbox selecionar todos | Na primeira célula do cabeçalho quando `selectable` |
| 4 | Linha do corpo | `<tr>` com dados do registro |
| 5 | Checkbox da linha | Na primeira célula do corpo quando `selectable` |
| 6 | Célula | `<td>` com conteúdo |
| 7 | Ícone de ordenação | Indicador ascendente/descendente no cabeçalho da coluna ordenada |
| 8 | Linha hover | Destaque de fundo ao passar o mouse |
| 9 | Linha selecionada | Fundo azul claro quando a linha está selecionada |
| 10 | Overlay de carregamento | Overlay com spinner quando `loading=true` |
| 11 | Estado vazio | Mensagem quando `data.length === 0` e não está carregando |

**Comportamentos:**
- Clique no cabeçalho ordenável → alterna direção: null → asc → desc → null
- Clique no checkbox → seleciona/deseleciona linha individual
- Clique no selecionar todos → seleciona/deseleciona todos (indeterminado quando parcial)
- Indicadores de ordenação seguem SLDS 2: seta para cima para ascendente, seta para baixo para descendente

---

### Pagination

> Segue o padrão de [Button Group](https://www.lightningdesignsystem.com/components/button-groups/) + texto de informação de página.

**Arquivo:** `src/components/Pagination/Pagination.tsx`

```tsx
type PaginationProps = {
  currentPage: number;         // baseado em 1
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];  // padrão [10, 25, 50, 100]
};
```

**Especificação visual:**

```
┌─────────────────────────────────────────────────────────────────┐
│  Mostrando 1–25 de 1.248    │  « ‹ 1 2 3 ... 50 › »   │  25 ▾ │
└─────────────────────────────────────────────────────────────────┘
```

- Esquerda: texto resumo "Mostrando {início}–{fim} de {total}"
- Centro: botões de página — primeiro, anterior, números (máx 5 visíveis + reticências), próximo, último
- Direita: dropdown de seleção de linhas por página
- Todos os botões usam `Button` variante `ghost` ou `outline`, `size: small`
- Página ativa: `Button` variante `brand`
- Anterior/próximo desabilitados nos limites

---

### EmptyState

> Ref SLDS 2: [Empty State](https://www.lightningdesignsystem.com/components/empty-state/)

**Arquivo:** `src/components/EmptyState/EmptyState.tsx`

```tsx
type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;  // ex: um Button
};
```

---

### PageHeader

> Cabeçalho consistente para páginas de lista com título, descrição, busca e ações.

**Arquivo:** `src/components/PageHeader/PageHeader.tsx`

```tsx
type PageHeaderProps = {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;   // botões de ação alinhados à direita
  children?: React.ReactNode;  // abaixo do cabeçalho (barra de busca, filtros)
};
```

---

## Novos Hooks

### useRecordList

**Arquivo:** `src/hooks/useRecordList.ts`

Hook genérico para buscar listas paginadas, ordenáveis e pesquisáveis de registros da API GraphQL do Twenty.

```tsx
type UseRecordListOptions = {
  objectNamePlural: string;   // ex: "people", "companies", "opportunities"
  fields: string;             // string de seleção de campos GraphQL
  pageSize?: number;          // padrão 25
};

type UseRecordListReturn<TRecord> = {
  data: TRecord[];
  totalCount: number;
  loading: boolean;
  error: string | null;

  // Paginação
  currentPage: number;
  pageSize: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;

  // Ordenação
  sortColumn: string | null;
  sortDirection: 'asc' | 'desc' | null;
  setSort: (column: string | null, direction: 'asc' | 'desc' | null) => void;

  // Busca
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Atualizar
  refresh: () => void;
};
```

O hook constrói uma query GraphQL dinâmica usando o padrão da API de objetos do Twenty:

```graphql
query FindManyPeople($filter: PersonFilterInput, $orderBy: [PersonOrderByInput!], $first: Int, $after: String) {
  people(filter: $filter, orderBy: $orderBy, first: $first, after: $after) {
    edges {
      node {
        id
        name { firstName lastName }
        email
        phone
        company { name }
        city
        createdAt
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
    totalCount
  }
}
```

**Notas de implementação:**
- Usa paginação baseada em cursor internamente, mas expõe API baseada em página para os consumidores
- Mantém mapa de cursores: `{ [numeroPagina]: cursor }` para navegação reversa
- Query de busca mapeia para `filter: { or: [{ name: { firstName: { like: "%query%" } } }, ...] }`
- Ordenação mapeia para `orderBy: [{ fieldName: direction }]`

---

## Páginas

### ContactsListPage

**Arquivo:** `src/pages/ContactsListPage.tsx`

**Objeto:** `people` (objeto Person do Twenty)

**Colunas:**
| Coluna | Campo | Ordenável | Largura |
|--------|-------|-----------|---------|
| Nome | `name.firstName + name.lastName` | Sim | 25% |
| Email | `emails.primaryEmail` | Sim | 20% |
| Telefone | `phones.primaryPhoneNumber` | Não | 15% |
| Empresa | `company.name` | Sim | 20% |
| Cidade | `city` | Sim | 10% |
| Criado em | `createdAt` | Sim | 10% |

### CompaniesListPage

**Arquivo:** `src/pages/CompaniesListPage.tsx`

**Objeto:** `companies` (objeto Company do Twenty)

**Colunas:**
| Coluna | Campo | Ordenável | Largura |
|--------|-------|-----------|---------|
| Nome | `name` | Sim | 25% |
| Domínio | `domainName.primaryLinkUrl` | Não | 20% |
| Funcionários | `employees` | Sim | 10% |
| Endereço | `address.addressCity` | Sim | 15% |
| Criado em | `createdAt` | Sim | 15% |

### DealsListPage (Oportunidades)

**Arquivo:** `src/pages/DealsListPage.tsx`

**Objeto:** `opportunities` (objeto Opportunity do Twenty)

**Colunas:**
| Coluna | Campo | Ordenável | Largura |
|--------|-------|-----------|---------|
| Nome | `name` | Sim | 25% |
| Valor | `amount.amountMicros` | Sim | 15% |
| Estágio | `stage` | Sim | 15% |
| Data de Fechamento | `closeDate` | Sim | 15% |
| Empresa | `company.name` | Sim | 20% |
| Criado em | `createdAt` | Sim | 10% |

---

## Queries GraphQL

O frontend Erencio.com Backoffice usa o endpoint `/api` (GraphQL com escopo de workspace) ao invés de `/metadata`. O utilitário `api.ts` deve ser estendido para suportar ambos os endpoints.

---

## Alterações de Roteamento

Novas rotas adicionadas ao `AppRouter.tsx`:

```tsx
{ path: '/contacts',  element: <ProtectedLayout><ContactsListPage /></ProtectedLayout> },
{ path: '/companies', element: <ProtectedLayout><CompaniesListPage /></ProtectedLayout> },
{ path: '/deals',     element: <ProtectedLayout><DealsListPage /></ProtectedLayout> },
```

A sidebar já possui estas entradas (adicionadas na Fase 0). As rotas as ativam.

---

## Adições de Design Tokens

Nenhuma nova CSS custom property necessária. Todos os componentes usam tokens existentes.

| Uso | Tokens Utilizados |
|-----|-------------------|
| Fundo do cabeçalho da tabela | `neutral1` |
| Borda do cabeçalho da tabela | `neutral3` (2px inferior) |
| Divisor de linha | `neutral2` (1px inferior) |
| Hover da linha | `brandPrimaryLight` |
| Linha selecionada | `brandPrimaryLight` |
| Ícone de ordenação ativo | `brandPrimary` |
| Ícone de ordenação inativo | `neutral4` |
| Ícone de busca | `textPlaceholder` |
| Página ativa na paginação | fundo `brandPrimary`, texto `textInverse` |
| Ícone do estado vazio | `textPlaceholder` |

---

## Checklist de Acessibilidade

Conforme [SLDS 2 Data Table Accessibility](https://www.lightningdesignsystem.com/components/data-tables/) e WCAG 2.1 AA:

- [ ] DataTable usa `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>` (HTML semântico)
- [ ] `<th scope="col">` para cabeçalhos de coluna
- [ ] Controles de ordenação são elementos `<button>` (acessíveis por teclado)
- [ ] Estado de ordenação comunicado via `aria-sort="ascending"` / `"descending"` / `"none"` no `<th>`
- [ ] Checkbox selecionar todos tem `aria-label="Selecionar todas as linhas"`
- [ ] Checkboxes individuais de linha têm `aria-label="Selecionar {nome do registro}"`
- [ ] Estado de carregamento: `aria-busy="true"` no `<table>`, Spinner com `role="status"` e `aria-label="Carregando"`
- [ ] Estado vazio usa `role="status"` para anúncio ao leitor de tela
- [ ] Paginação: `<nav aria-label="Paginação">`, botões com `aria-label` para anterior/próximo/página
- [ ] Botão da página atual tem `aria-current="page"`
- [ ] Input de busca tem `role="searchbox"` e `aria-label`
- [ ] Todos os elementos interativos alcançáveis via tecla Tab
- [ ] Foco visível em todos os elementos interativos
- [ ] Componente Select usa `<select>` nativo (totalmente acessível por padrão)

---

## Resumo da Estrutura de Arquivos

```
packages/erencio-front/src/
├── components/
│   ├── Checkbox/
│   │   ├── Checkbox.tsx
│   │   └── index.ts
│   ├── DataTable/
│   │   ├── DataTable.tsx
│   │   └── index.ts
│   ├── EmptyState/
│   │   ├── EmptyState.tsx
│   │   └── index.ts
│   ├── Icon/
│   │   ├── Icon.tsx
│   │   └── index.ts
│   ├── PageHeader/
│   │   ├── PageHeader.tsx
│   │   └── index.ts
│   ├── Pagination/
│   │   ├── Pagination.tsx
│   │   └── index.ts
│   ├── SearchBar/
│   │   ├── SearchBar.tsx
│   │   └── index.ts
│   ├── Select/
│   │   ├── Select.tsx
│   │   └── index.ts
│   ├── Spinner/
│   │   ├── Spinner.tsx
│   │   └── index.ts
│   └── index.ts
├── hooks/
│   └── useRecordList.ts
├── pages/
│   ├── ContactsListPage.tsx
│   ├── CompaniesListPage.tsx
│   └── DealsListPage.tsx
└── AppRouter.tsx
```
