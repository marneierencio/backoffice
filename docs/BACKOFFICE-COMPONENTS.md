# Biblioteca de Componentes Erencio.com Backoffice

Este documento descreve a biblioteca de componentes implementada em `packages/erencio-front`, o Erencio.com Backoffice. Sua arquitetura é inspirada no [Salesforce Lightning Design System 2 (SLDS 2)](https://www.lightningdesignsystem.com/).

## Princípios de Design

1. **Acessibilidade primeiro**: todos os componentes usam HTML semântico e atributos ARIA
2. **Orientado por tokens**: todos os valores visuais vêm de design tokens — sem cores ou espaçamentos fixos no código
3. **Composável**: componentes aceitam children e slot props para composição flexível
4. **Tipado**: TypeScript estrito com named exports e parâmetros genéricos descritivos

## Design Tokens (`src/tokens/tokens.ts`)

Os design tokens são a fonte única de verdade para todos os valores visuais.

### Tokens de Cor
| Token | Valor | Uso |
|-------|-------|-----|
| `colorTokens.brandPrimary` | `var(--backoffice-g-color-brand-base-50)` | Ações primárias, links, anéis de foco |
| `colorTokens.neutral0` | `var(--backoffice-g-color-neutral-base-1)` | Fundos de cards/superfícies |
| `colorTokens.neutral1` | `var(--backoffice-g-color-neutral-base-5)` | Fundo da página |
| `colorTokens.error` | `var(--backoffice-g-color-error-base-50)` | Estados de erro |
| `colorTokens.success` | `var(--backoffice-g-color-success-base-50)` | Estados de sucesso |
| `colorTokens.warning` | `var(--backoffice-g-color-warning-base-50)` | Estados de alerta |

### Tokens de Espaçamento
Baseados em grid de 4px/8px:
- `spacingXXSmall` = 4px
- `spacingXSmall` = 8px
- `spacingSmall` = 12px
- `spacingMedium` = 16px
- `spacingLarge` = 24px
- `spacingXLarge` = 32px

### Tokens de Tipografia
Fonte base: stack de sistema (`system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif`) — seguindo o padrão SLDS 2 de fontes do sistema.

Escala de fonte de `fontSizeXSmall` (11px / `--backoffice-g-font-scale-2`) até `fontSizeXXXLarge` (32px / `--backoffice-g-font-size-display`).
Pesos: light (300), regular (400), semibold (600), bold (700) — correspondendo à escala de pesos SLDS 2 (3–7).

## Inventário de Componentes

### Button

```tsx
import { Button } from '@eds/components/Button';

<Button
  label="Salvar"
  variant="brand"   // 'brand' | 'neutral' | 'outline' | 'ghost' | 'destructive'
  size="medium"     // 'small' | 'medium' | 'large'
  loading={false}
  disabled={false}
  onClick={() => {}}
/>
```

**Variantes:**
- `brand` — CTA primário, azul sólido
- `neutral` — ação secundária, fundo cinza
- `outline` — com borda, texto azul
- `ghost` — sem borda, texto azul
- `destructive` — vermelho sólido, ações destrutivas

### Input

```tsx
import { Input } from '@eds/components/Input';

<Input
  id="email"
  label="Endereço de e-mail"
  type="email"
  value={email}
  placeholder="usuario@exemplo.com"
  required
  error="Por favor insira um email válido"
  hint="Nunca compartilharemos seu email"
  onChange={(e) => setEmail(e.target.value)}
/>
```

### Card

```tsx
import { Card } from '@eds/components/Card';

<Card
  title="Informações da Conta"
  description="Detalhes atuais da sua conta"
  variant="default"   // 'default' | 'narrow' | 'highlight'
  headerRight={<Button label="Editar" variant="neutral" size="small" />}
  footer={<span>Última atualização hoje</span>}
>
  <p>Conteúdo do corpo do card</p>
</Card>
```

**Variantes:**
- `default` — card padrão com borda e sombra
- `narrow` — igual ao default (para layouts compactos)
- `highlight` — borda azul à esquerda como destaque

### Badge

```tsx
import { Badge } from '@eds/components/Badge';

<Badge
  label="Ativo"
  variant="success"   // 'default' | 'success' | 'warning' | 'error' | 'info' | 'brand'
  size="medium"       // 'small' | 'medium'
/>
```

### Shell (Layout)

```tsx
import { Shell } from '@eds/components/Layout';

<Shell
  appName="Erencio Backoffice"
  sidebarSections={[
    {
      label: 'Principal',
      items: [
        { id: 'dashboard', label: 'Dashboard', href: '#/', icon: '⊞' },
      ],
    },
  ]}
  topBarRight={<UserMenu />}
  activeItemId="dashboard"
>
  <PageContent />
</Shell>
```

O componente Shell renderiza:
- Uma barra de navegação superior fixa (escura, 52px de altura)
- Uma sidebar colapsável à esquerda
- Uma área de conteúdo principal com scroll

## Convenções de Nomenclatura

| Categoria | Convenção | Exemplo |
|-----------|-----------|---------|
| Arquivos de componente | PascalCase | `Button.tsx` |
| Exports de componente | Named, PascalCase | `export const Button = ...` |
| Tipos de props | `<Componente>Props` | `ButtonProps` |
| Tipos de variante | `<Componente>Variant` | `ButtonVariant` |
| Tipos de tamanho | `<Componente>Size` | `ButtonSize` |
| Arquivos de token | exports camelCase | `colorTokens`, `spacingTokens` |
| Index exports | arquivo barrel | `export { Button } from './Button'` |

## Divergências do SLDS 2

Onde a implementação diverge da spec oficial do SLDS 2, a decisão está documentada aqui:

1. **CSS custom properties + estilos inline**: o Erencio.com Backoffice usa CSS custom properties `--backoffice-g-*` (definidas em `global.css`) consumidas via estilos inline React e referências de tokens. Isso fornece suporte completo a temas via CSS mantendo o código de componentes direto.

2. **Classes CSS utilitárias**: o Erencio.com Backoffice inclui classes utilitárias estilo SLDS 2 (`.eds-m_*`, `.eds-p_*`, `.eds-text_*`, `.eds-grid`, etc.) em `utilities.css` para layout e estilização rápidos.

3. **Sem dependência LWC**: o SLDS 2 oficial é projetado para Lightning Web Components. O Erencio.com Backoffice adapta os princípios de design (tokens, API de componentes, acessibilidade) para React.

4. **Fontes do sistema**: seguindo a recomendação do SLDS 2, o Erencio.com Backoffice usa o stack de fontes do sistema ao invés de fontes de marca, para tempos de carregamento mais rápidos e integração nativa com o SO.

5. **Estrutura de tokens simplificada**: a spec completa do SLDS 2 tem 500+ tokens. O Erencio.com Backoffice inclui o conjunto essencial com espaço para expansão.

---

## Componentes da Fase 1 (Listagem de Registros)

Os seguintes componentes foram adicionados na Fase 1 para suportar páginas de listagem.

### Icon

Sistema de ícones SVG inline mínimo sem dependências externas.

```tsx
import { Icon } from '@eds/components/Icon';

<Icon
  name="search"    // 'search' | 'sort-ascending' | 'sort-descending' | 'chevron-left' | 'chevron-right' | etc.
  size={16}        // tamanho em pixels (padrão 16)
  color="currentColor"
/>
```

Ícones disponíveis: `search`, `sort-ascending`, `sort-descending`, `chevron-left`, `chevron-right`, `chevron-down`, `check`, `minus`, `close`, `filter`, `refresh`, `chevron-first`, `chevron-last`.

### Checkbox

> Ref SLDS 2: [Checkbox](https://www.lightningdesignsystem.com/components/checkbox/)

```tsx
import { Checkbox } from '@eds/components/Checkbox';

<Checkbox
  label="Selecionar todos"
  checked={true}
  indeterminate={false}
  disabled={false}
  onChange={(checked) => {}}
/>
```

Checkbox visual customizado com suporte a estado `indeterminate` (usado pelo select-all do DataTable). Usa `<input type="checkbox">` nativo por baixo para acessibilidade.

### Select

> Ref SLDS 2: [Select](https://www.lightningdesignsystem.com/components/select/)

```tsx
import { Select } from '@eds/components/Select';

<Select
  label="Status"
  value={status}
  options={[
    { value: 'active', label: 'Ativo' },
    { value: 'inactive', label: 'Inativo' },
  ]}
  placeholder="Selecione…"
  required
  error="Por favor selecione um status"
  onChange={(value) => setStatus(value)}
/>
```

Usa elemento `<select>` nativo para conformidade total de acessibilidade. Label, dica, erro e indicador de obrigatório seguem o estilo do componente Input.

### Spinner

> Ref SLDS 2: [Spinners](https://www.lightningdesignsystem.com/components/spinners/)

```tsx
import { Spinner } from '@eds/components/Spinner';

// Spinner overlay (padrão)
<Spinner size="medium" label="Carregando" />

// Spinner inline
<Spinner size="small" label="Carregando" inline />
```

**Tamanhos:** `x-small` (16px), `small` (24px), `medium` (32px), `large` (48px).

Animação apenas CSS com arco colorido da marca girando sobre trilha neutra. O modo overlay adiciona fundo semi-transparente.

### SearchBar

> Baseado em SLDS 2 [Input — tipo Search](https://www.lightningdesignsystem.com/components/input/)

```tsx
import { SearchBar } from '@eds/components/SearchBar';

<SearchBar
  value={query}
  placeholder="Buscar contatos…"
  onChange={(value) => setQuery(value)}
  debounceMs={300}
/>
```

Input de busca com ícone de lupa, `onChange` com debounce, botão de limpar e suporte a Escape para limpar.

### EmptyState

> Ref SLDS 2: [Empty State](https://www.lightningdesignsystem.com/components/empty-state/)

```tsx
import { EmptyState } from '@eds/components/EmptyState';

<EmptyState
  title="Nenhum contato encontrado"
  description="Tente ajustar seus critérios de busca"
  icon="👥"
  action={<Button label="Limpar filtros" variant="outline" />}
/>
```

Mensagem centralizada exibida quando uma lista ou tabela não tem dados.

### PageHeader

Cabeçalho consistente para páginas de lista com título, descrição, busca e slots de ação.

```tsx
import { PageHeader } from '@eds/components/PageHeader';

<PageHeader
  title="Contatos"
  description="Gerencie seus contatos"
  icon="👥"
  actions={<Button label="Novo Contato" variant="brand" />}
>
  <SearchBar value={query} onChange={setQuery} />
</PageHeader>
```

### DataTable

> Ref SLDS 2: [Data Table](https://www.lightningdesignsystem.com/components/data-tables/)

O componente principal da Fase 1. Renderiza um `<table>` semântico com colunas ordenáveis, seleção de linhas, hover/listras, overlay de carregamento e estado vazio.

```tsx
import { DataTable } from '@eds/components/DataTable';
import type { ColumnDefinition } from '@eds/components/DataTable';

const columns: ColumnDefinition<Contact>[] = [
  { key: 'name', label: 'Nome', accessor: 'name', sortable: true, width: '30%' },
  { key: 'email', label: 'Email', accessor: 'email', sortable: true, width: '30%',
    renderCell: (val, record) => <a href={`mailto:${val}`}>{val}</a> },
  { key: 'city', label: 'Cidade', accessor: 'city', width: '20%' },
  { key: 'created', label: 'Criado em', accessor: 'createdAt', sortable: true, width: '20%',
    renderCell: (val) => new Date(val).toLocaleDateString() },
];

<DataTable
  columns={columns}
  data={contacts}
  loading={isLoading}
  selectable
  selectedIds={selected}
  onSelectionChange={setSelected}
  sortColumn="name"
  sortDirection="asc"
  onSort={(col, dir) => setSort(col, dir)}
  bordered
  striped
/>
```

**Funcionalidades principais:**
- `<table>` semântico com `<th scope="col">` e `aria-sort`
- Checkbox de selecionar todos com estado indeterminate
- Alternar ordenação: clique no cabeçalho → asc → desc → sem ordenação
- Destaque ao passar o mouse na linha
- Overlay de spinner de carregamento com `aria-busy`
- Estado vazio quando não há dados
- Renderizadores de célula customizados via `renderCell`

### Pagination

Controles de navegação de página seguindo padrões de grupo de botões SLDS 2.

```tsx
import { Pagination } from '@eds/components/Pagination';

<Pagination
  currentPage={1}
  totalCount={1248}
  pageSize={25}
  onPageChange={(page) => setPage(page)}
  onPageSizeChange={(size) => setPageSize(size)}
  pageSizeOptions={[10, 25, 50, 100]}
/>
```

Renderiza: resumo de registros, botões primeiro/anterior/números de página/próximo/último e um seletor de linhas por página. A página ativa é destacada com a cor da marca. Usa `<nav aria-label="Pagination">` para acessibilidade.

---

## Componentes da Fase 2 — Detalhe do Registro

Componentes adicionados na Fase 2 para suportar páginas de detalhe de registro (contato, empresa, negócio).

### Avatar

Avatar circular (usuário) ou quadrado arredondado (entidade) com imagem, fallback de iniciais ou fallback de ícone.

```tsx
import { Avatar } from '@eds/components/Avatar';

<Avatar
  name="João Silva"
  src="https://exemplo.com/avatar.jpg"
  type="user"     // 'user' | 'entity'
  size="medium"   // 'x-small' (20px) | 'small' (24px) | 'medium' (32px) | 'large' (48px)
/>
```

**Comportamento:**
- Tipo `user` renderiza como círculo; `entity` renderiza como quadrado arredondado
- Se `src` falhar ao carregar ou não for fornecido, renderiza iniciais extraídas de `name`
- Iniciais de usuário: primeira letra do primeiro + último nome; iniciais de entidade: duas primeiras letras
- Fallback para ícone de `user` ou `company` se o nome estiver vazio
- Usa `brandPrimary` como fundo e `textInverse` como cor do texto para iniciais

### Tabs

Barra de abas horizontal com roles ARIA tablist/tab/tabpanel seguindo o padrão de Tabs SLDS 2.

```tsx
import { Tabs } from '@eds/components/Tabs';

<Tabs
  items={[
    { id: 'details', label: 'Detalhes' },
    { id: 'timeline', label: 'Linha do Tempo', badge: 3 },
    { id: 'notes', label: 'Notas', disabled: true },
  ]}
  activeId="details"
  onTabChange={(id) => setActiveTab(id)}
  size="medium"   // 'small' | 'medium'
/>
```

**Acessibilidade:**
- `role="tablist"` no container, `role="tab"` em cada aba, `role="tabpanel"` no conteúdo
- Setas navegam entre abas; Home/End vão para primeira/última
- Apenas a aba ativa está na ordem de tab (`tabIndex={0}`)
- `aria-selected`, `aria-controls`, `aria-labelledby` corretamente vinculados

### Modal

Overlay de diálogo com foco preso (focus trap), backdrop e suporte a teclado.

```tsx
import { Modal } from '@eds/components/Modal';

<Modal
  open={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirmar Ação"
  size="medium"   // 'small' (480px) | 'medium' (640px) | 'large' (960px)
  footer={<Button label="OK" variant="brand" onClick={handleOk} />}
>
  <p>Tem certeza?</p>
</Modal>
```

**Comportamento:**
- `role="dialog"`, `aria-modal="true"`, `aria-labelledby` vinculado ao título
- Foco preso dentro do modal quando aberto; tecla Escape fecha
- Foco move para o primeiro elemento focável ao abrir, restaura para o gatilho ao fechar
- Clique no backdrop fecha o modal
- Animações CSS: `eds-fade-in` (backdrop), `eds-slide-up` (painel)

### Toast / ToastProvider

Sistema de notificações com variantes success/error/warning/info seguindo o padrão Toast SLDS 2.

```tsx
// Envolva a app com o provider
import { ToastProvider } from '@eds/components/Toast';

<ToastProvider>
  <App />
</ToastProvider>

// Use em qualquer componente
import { useToast } from '@eds/hooks/useToast';

const { showSuccess, showError, showWarning, showInfo } = useToast();
showSuccess('Registro salvo');
showError('Falha ao atualizar', 'Por favor tente novamente');
```

**Variantes:** `success` (verde), `error` (vermelho), `warning` (âmbar), `info` (azul)
**Auto-dismiss:** Success sem link de detalhe = 4.8s; todos os outros = fixo (usuário deve dispensar)
**Acessibilidade:** `role="status"`, `aria-live="polite"`, `aria-atomic="true"`. Botão fechar com `aria-label="Fechar notificação"`.

### FieldRenderer

Exibição de campo somente leitura que formata valores por tipo.

```tsx
import { FieldRenderer } from '@eds/components/FieldRenderer';

<FieldRenderer
  type="email"    // 'text' | 'email' | 'phone' | 'url' | 'number' | 'date' | 'currency' | 'boolean' | 'select'
  value="joao@exemplo.com"
  emptyPlaceholder="—"
/>
```

**Comportamento por tipo:**
- `email` → renderiza link `mailto:`
- `phone` → renderiza link `tel:`
- `url` → renderiza link externo com ícone
- `number` → formatado com locale via `toLocaleString()`
- `currency` → micros/1M formatado com `Intl.NumberFormat`
- `boolean` → "Sim" / "Não"
- `date` → `toLocaleDateString()`

### InlineEdit

Campo clique-para-editar com alternância entre modo leitura/edição. Usa FieldRenderer no modo leitura.

```tsx
import { InlineEdit } from '@eds/components/InlineEdit';

<InlineEdit
  type="text"
  value="João"
  label="Primeiro Nome"
  onSave={async (value) => { /* salvar na API */ }}
  editable={true}
/>
```

**Comportamento:**
- Modo leitura: exibe valor via FieldRenderer, ícone de lápis ao hover
- Modo edição: mostra `<input>` apropriado (text, email, tel, number, date, url) ou `<select>`
- Salvar: tecla Enter ou botão de check. Cancelar: tecla Escape ou botão ×
- Mostra spinner enquanto salva, mensagem de erro em caso de falha
- `role="button"` + `aria-label="Editar {label}"` no modo leitura

### PropertyBox

Lista vertical de pares campo-valor rotulados, cada um usando InlineEdit.

```tsx
import { PropertyBox } from '@eds/components/PropertyBox';

<PropertyBox
  fields={[
    { label: 'Nome', fieldName: 'name', type: 'text', editable: true },
    { label: 'Email', fieldName: 'email', type: 'email', editable: true },
    { label: 'Criado em', fieldName: 'createdAt', type: 'date', editable: false },
  ]}
  values={{ name: 'João', email: 'joao@exemplo.com', createdAt: '2025-01-15T00:00:00Z' }}
  onSave={async (fieldName, value) => { /* salvar */ }}
  compact={false}
/>
```

**Layout:** Label (140px, alinhado à direita) + valor (flex 1, max-width 300px). Divisores entre linhas (omitidos no modo compacto).

### RecordHeader

Cabeçalho de página para páginas de detalhe de registro com navegação breadcrumb, avatar, nome e rótulo do objeto.

```tsx
import { RecordHeader } from '@eds/components/RecordHeader';

<RecordHeader
  avatar={<Avatar name="João Silva" type="user" size="large" />}
  recordName="João Silva"
  objectLabel="Contato"
  breadcrumbs={[
    { label: 'Contatos', href: '#/contacts' },
    { label: 'João Silva' },
  ]}
  actions={<Button label="Editar" variant="outline" />}
/>
```

**Acessibilidade:** `<nav aria-label="Breadcrumb">` + `<ol>` para breadcrumbs. Nome do registro renderizado como `<h1>`.

### RelationCard

Card colapsável exibindo registros relacionados (um-para-um ou um-para-muitos).

```tsx
import { RelationCard } from '@eds/components/RelationCard';

<RelationCard
  title="Contatos"
  type="many"     // 'one' | 'many'
  records={[
    { id: '1', name: 'João Silva', subtitle: 'joao@exemplo.com', avatarUrl: '...' },
    { id: '2', name: 'Maria Santos', subtitle: 'maria@exemplo.com' },
  ]}
  onRecordClick={(record) => navigate(`/contacts/${record.id}`)}
  initialExpanded={true}
  maxVisible={5}
  avatarType="user"
  emptyMessage="Nenhum contato vinculado"
/>
```

**Comportamento:**
- Mostra badge de contagem no título para tipo `many`
- Colapsável com toggle de chevron
- "Mostrar mais" / "Mostrar menos" quando registros excedem `maxVisible`
- Cada linha de registro: Avatar + nome + subtítulo, clicável com destaque ao hover

### Timeline

Linha do tempo vertical exibindo eventos de atividade com timestamps relativos.

```tsx
import { Timeline } from '@eds/components/Timeline';

<Timeline
  events={[
    { id: '1', type: 'created', title: 'Registro criado', timestamp: '2025-01-15T10:30:00Z' },
    { id: '2', type: 'email', title: 'Email enviado', timestamp: '2025-01-16T14:00:00Z',
      author: { name: 'João Silva', avatarUrl: '...' } },
  ]}
  maxVisible={10}
  onShowMore={() => loadMore()}
/>
```

**Tipos de evento:** `created`, `updated`, `note`, `email`, `task`, `call`, `event` — cada um com ícone e cor distintos no ponto da linha do tempo.
**Timestamps:** Formato relativo ("2h atrás", "Ontem", "15 Mar, 2025").

---

## Hooks

### useRecordDetail

Busca um único registro por ID via API GraphQL da workspace Twenty.

```tsx
import { useRecordDetail } from '@eds/hooks/useRecordDetail';

const { record, loading, error, refresh } = useRecordDetail<PersonRecord>({
  objectNameSingular: 'person',
  objectNamePlural: 'people',
  recordId: 'uuid-aqui',
  fields: 'id name { firstName lastName } emails { primaryEmail }',
});
```

### useRecordUpdate

Hook de mutation para atualizar um único campo em um registro. Suporta campos com caminho aninhado (dot-path).

```tsx
import { useRecordUpdate } from '@eds/hooks/useRecordUpdate';

const { updateField, loading } = useRecordUpdate({
  objectNameSingular: 'person',
  objectNamePlural: 'people',
});

const result = await updateField('record-id', 'name.firstName', 'Maria');
// result: { success: true } ou { success: false, error: 'mensagem' }
```

### useToast

Fornece acesso ao sistema de notificações toast via contexto React.

```tsx
import { useToast } from '@eds/hooks/useToast';

const { showSuccess, showError, showWarning, showInfo } = useToast();
showSuccess('Salvo com sucesso');
showError('Ocorreu um erro', 'Por favor tente novamente mais tarde');
```
