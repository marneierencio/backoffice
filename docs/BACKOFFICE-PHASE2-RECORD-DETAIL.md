# Erencio.com Backoffice Fase 2 — Detalhe de Registro: Plano de Design e Implementação

Este documento especifica os componentes, comportamentos, tokens e estrutura de página para a Fase 2 da migração Erencio.com Backoffice (Detalhe de Registro). Todos os designs seguem os princípios do [SLDS 2](https://www.lightningdesignsystem.com/) adaptados para React, usando design tokens Erencio.com Backoffice (`--backoffice-g-*`).

---

## Índice

1. [Escopo](#escopo)
2. [Novos Componentes](#novos-componentes)
   - [Avatar](#avatar)
   - [Tabs](#tabs)
   - [Modal](#modal)
   - [Toast (Sistema de Notificações)](#toast-sistema-de-notificações)
   - [InlineEdit](#inlineedit)
   - [RecordHeader](#recordheader)
   - [PropertyBox](#propertybox)
   - [FieldRenderer](#fieldrenderer)
   - [RelationCard](#relationcard)
   - [Timeline](#timeline)
3. [Novos Hooks](#novos-hooks)
   - [useRecordDetail](#userecorddetail)
   - [useRecordUpdate](#userecordupdate)
   - [useToast](#usetoast)
4. [Novos Ícones](#novos-ícones)
5. [Páginas](#páginas)
   - [RecordShowPage (genérico)](#recordshowpage-genérico)
   - [ContactDetailPage](#contactdetailpage)
   - [CompanyDetailPage](#companydetailpage)
   - [DealDetailPage](#dealdetailpage)
6. [Queries e Mutations GraphQL](#queries-e-mutations-graphql)
7. [Alterações de Roteamento](#alterações-de-roteamento)
8. [Adições de Design Tokens](#adições-de-design-tokens)
9. [Checklist de Acessibilidade](#checklist-de-acessibilidade)
10. [Resumo da Estrutura de Arquivos](#resumo-da-estrutura-de-arquivos)
11. [Definição de Pronto](#definição-de-pronto)

---

## Escopo

A Fase 2 entrega a **Página de Detalhe (Show) de Registro** para os objetos principais do CRM. Os usuários podem:

- Visualizar detalhes completos de um único registro (pessoa, empresa, oportunidade)
- Editar campos inline (padrão clique-para-editar)
- Navegar entre abas (Detalhes, Timeline, Notas, Tarefas, Emails)
- Ver registros relacionados (relações) em seções de card colapsáveis
- Ver avatar + nome no cabeçalho do registro com navegação breadcrumb
- Receber feedback via toast após ações de salvar/erro
- Abrir modais (ex: confirmações, uso futuro na Fase 3)

Navegação a partir das páginas de lista: clicar em uma linha no DataTable navega para o detalhe do registro.

---

## Novos Componentes

### Avatar

> Referência SLDS 2: [Avatar](https://www.lightningdesignsystem.com/components/avatar/)

**Arquivo:** `src/components/Avatar/Avatar.tsx`

```tsx
type AvatarType = 'user' | 'entity';

type AvatarSize = 'x-small' | 'small' | 'medium' | 'large';

type AvatarProps = {
  name: string;                      // Usado para iniciais de fallback + texto alt
  src?: string;                      // URL da imagem
  type?: AvatarType;                 // 'user' (círculo) ou 'entity' (quadrado arredondado)
  size?: AvatarSize;                 // padrão 'medium'
  className?: string;
  style?: React.CSSProperties;
};
```

**Especificação visual:**
- **Tamanhos:** x-small=20px, small=24px, medium=32px, large=48px
- **Forma:** `user` → `border-radius: 50%`; `entity` → `border-radius: radiusMedium` (4px)
- **Modo imagem:** `<img>` preenche o contêiner, `object-fit: cover`
- **Fallback iniciais:** Duas letras extraídas do nome — para user: primeiras letras do primeiro+último nome; para entity: duas primeiras letras de palavra única. `backgroundColor: brandPrimary`, `color: textInverse`, `fontWeight: fontWeightBold`, centralizado
- **Fallback ícone:** Quando nenhum nome é fornecido, renderiza ícone SVG padrão de user/entity
- **Anel de foco:** Quando interativo (dentro de button/link), anel de foco padrão

---

### Tabs

> Referência SLDS 2: [Tabs](https://www.lightningdesignsystem.com/components/tabs/)

**Arquivo:** `src/components/Tabs/Tabs.tsx`

```tsx
type TabItem = {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: number;                    // Badge de contagem (ex: "3" para tarefas)
  disabled?: boolean;
};

type TabsProps = {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  size?: 'default' | 'medium' | 'large';  // padrão 'default'
  children?: React.ReactNode;         // Conteúdo do painel da aba
};
```

**Anatomia:**
| # | Elemento | Descrição |
|---|---------|-----------|
| 1 | Barra de Abas | `<div role="tablist">` linha horizontal de abas |
| 2 | Aba | `<button role="tab">` botão individual de aba |
| 3 | Label | Texto da aba |
| 4 | Ícone | Ícone inicial opcional |
| 5 | Badge | Overlay de contagem opcional |
| 6 | Indicador Ativo | Borda inferior na aba ativa |
| 7 | Painel da Aba | `<div role="tabpanel">` área de conteúdo abaixo das abas |

**Especificação visual:**
- **Barra de abas:** `border-bottom: 2px solid neutral2`
- **Aba (estado padrão):** `padding: spacingXSmall spacingMedium`, `color: textPlaceholder`, `fontSizeMedium`, sem borda inferior
- **Aba (hover):** `color: textDefault`, sublinhado sutil `border-bottom: 3px solid neutral3`
- **Aba (ativa):** `color: brandPrimary`, `fontWeight: fontWeightMedium`, `border-bottom: 3px solid brandPrimary`
- **Aba (foco):** anel de foco padrão, aba também mostra estado selecionado
- **Aba (desabilitada):** `color: textDisabled`, `cursor: not-allowed`, sem efeito hover
- **Badge:** Pequena pílula ao lado do label, `backgroundColor: neutral2`, `color: textDefault`, `fontSize: fontSizeXSmall`, `border-radius: radiusPill`, `padding: 0 spacingXXSmall`
- **Tamanhos:** default altura ~40px, medium ~44px, large ~48px (afetado por padding e tamanho de fonte)

**Comportamentos:**
- Clicar em uma aba dispara `onChange` e muda o indicador ativo
- Setas do teclado navegam entre as abas quando focado na tablist
- Teclas `Home`/`End` pulam para a primeira/última aba
- Apenas a aba ativa está na ordem de tabulação (`tabIndex={0}`); as outras têm `tabIndex={-1}`
- O conteúdo da aba carrega apenas quando a aba é ativada (renderização lazy)

---

### Modal

> Referência SLDS 2: [Modals](https://www.lightningdesignsystem.com/components/modals/)

**Arquivo:** `src/components/Modal/Modal.tsx`

```tsx
type ModalSize = 'small' | 'medium' | 'large';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  tagline?: string;
  size?: ModalSize;                   // padrão 'medium'
  children?: React.ReactNode;         // Conteúdo do corpo
  footer?: React.ReactNode;           // Rodapé com botões de ação
  closeOnOverlayClick?: boolean;      // padrão true
  closeOnEscape?: boolean;            // padrão true
  'aria-label'?: string;              // Obrigatório se não houver title
};
```

**Anatomia:**
| # | Elemento | Descrição |
|---|---------|-----------|
| 1 | Backdrop | Overlay semi-transparente cobrindo a página |
| 2 | Container | Diálogo centralizado com fundo branco |
| 3 | Cabeçalho | Título + botão fechar (×) em linha flex |
| 4 | Tagline | Subtítulo opcional abaixo do título |
| 5 | Corpo | Área de conteúdo com scroll |
| 6 | Rodapé | Botões de ação alinhados à direita |

**Especificação visual:**
- **Backdrop:** `backgroundColor: rgba(0,0,0,0.5)`, `position: fixed`, viewport completo, `z-index: zIndexModal`
- **Container:** `backgroundColor: neutral0`, `border-radius: radiusLarge`, `box-shadow: elevationModal`, centralizado vertical + horizontalmente
- **Tamanhos:** small=min(480px, 60vw), medium=min(640px, 70vw), large=min(960px, 90vw)
- **Altura máxima:** `80vh`, corpo rola quando transborda
- **Cabeçalho:** `padding: spacingMedium spacingLarge`, `border-bottom: 1px solid borderDefault`
- **Título:** `fontSize: fontSizeXLarge`, `fontWeight: fontWeightBold`, `color: textDefault`
- **Tagline:** `fontSize: fontSizeSmall`, `color: textPlaceholder`, `marginTop: spacingXXSmall`
- **Botão fechar:** botão ícone ghost, canto superior direito, ícone `×`
- **Corpo:** `padding: spacingLarge`, `overflow-y: auto`, `flex: 1`
- **Rodapé:** `padding: spacingMedium spacingLarge`, `border-top: 1px solid borderDefault`, `text-align: right`, `gap: spacingXSmall`

**Comportamentos:**
- Abre com animação fade-in (`durationPromptly`, 200ms)
- Fecha via: botão fechar, clique no overlay (se habilitado), tecla Escape (se habilitado)
- Foco é preso dentro do modal quando aberto (focus trap)
- Foco move para o primeiro elemento focalizável ou o botão fechar ao abrir
- Ao fechar, foco retorna ao elemento que acionou o modal
- `aria-modal="true"`, `role="dialog"`, `aria-labelledby` apontando para o título

---

### Toast (Sistema de Notificações)

> Referência SLDS 2: [Toast](https://www.lightningdesignsystem.com/components/toast/)

**Arquivos:**
- `src/components/Toast/Toast.tsx` — componente de toast individual
- `src/components/Toast/ToastContainer.tsx` — container posicionado para múltiplos toasts
- `src/components/Toast/ToastProvider.tsx` — provider de contexto React

```tsx
type ToastVariant = 'success' | 'error' | 'warning' | 'info';

type ToastMode = 'dismissible' | 'sticky';

type ToastData = {
  id: string;
  variant: ToastVariant;
  message: string;
  detail?: string;
  link?: { label: string; href: string };
  mode?: ToastMode;                    // padrão: baseado na variante
  durationMs?: number;                 // sobrescreve tempo de auto-dismiss
};

type ToastProps = ToastData & {
  onClose: (id: string) => void;
};

type ToastContainerProps = {
  toasts: ToastData[];
  onClose: (id: string) => void;
};
```

**Especificação visual:**
- **Container:** fixo no topo central da viewport, `top: spacingLarge`, `z-index: zIndexToast`, `max-width: 640px`, empilha verticalmente com `gap: spacingXSmall`
- **Toast:** linha flex, `min-height: 48px`, `border-radius: radiusMedium`, `box-shadow: elevationDropdown`
- **Cores por variante:**
  | Variante | Fundo | Borda esquerda (4px) | Cor do ícone |
  |----------|-------|----------------------|--------------|
  | success | `successLight` | `success` | `success` |
  | error | `errorLight` | `error` | `error` |
  | warning | `warningLight` | `warning` | `warning` |
  | info | `infoLight` | `brandPrimary` | `brandPrimary` |
- **Ícone:** Ícone específico da variante (checkmark, erro, aviso, info), 20px
- **Mensagem:** `fontSizeMedium`, `fontWeightMedium`, `color: textDefault`
- **Detalhe:** `fontSizeSmall`, `color: textLabel`, abaixo da mensagem
- **Botão fechar:** botão ghost `×`, lado direito
- **Tempo de dismiss (spec SLDS 2):**
  | Variante | Tem link? | Modo padrão |
  |----------|-----------|-------------|
  | success | Não | dismissible (4.8s) |
  | success | Sim | sticky |
  | error | — | sticky |
  | warning | — | sticky |
  | info | — | sticky |

**Animações:**
- Entrada: slide para baixo + fade in, `durationPromptly` (200ms)
- Saída: fade out + slide para cima, `durationQuickly` (100ms)

---

### InlineEdit

**Arquivo:** `src/components/InlineEdit/InlineEdit.tsx`

Um componente clique-para-editar que renderiza um valor somente leitura e alterna para um input ao clicar/Enter.

```tsx
type FieldType =
  | 'text'
  | 'email'
  | 'phone'
  | 'number'
  | 'date'
  | 'currency'
  | 'url'
  | 'select'
  | 'boolean';

type InlineEditProps = {
  value: string | number | boolean | null;
  fieldType?: FieldType;               // padrão 'text'
  label: string;                       // Label acessível
  placeholder?: string;
  readOnly?: boolean;
  saving?: boolean;
  error?: string;
  options?: Array<{ value: string; label: string }>;  // Para fieldType='select'
  currencyCode?: string;               // Para fieldType='currency'
  onSave: (newValue: string | number | boolean | null) => void;
  onCancel?: () => void;
};
```

**Especificação visual (modo leitura):**
- Exibe texto de valor formatado, `color: textDefault`, `fontSize: fontSizeMedium`
- Ao hover: ícone de lápis sutil aparece, fundo muda para `neutral1`
- `cursor: pointer` (exceto quando `readOnly`)
- Valores vazios mostram texto placeholder em `color: textPlaceholder`

**Especificação visual (modo edição):**
- Renderiza um `<input>` (ou `<select>`) apropriado de acordo com o `fieldType`
- Input estilizado com os mesmos tokens do componente Input existente
- Mostra botões de ícone checkmark (salvar) e × (cancelar) abaixo/ao lado do input
- Foco automaticamente posicionado no input
- `Escape` cancela edição, `Enter` salva

**Comportamentos:**
- Clique ou Enter → entra no modo edição
- Salvar → chama `onSave`, mostra spinner de salvamento brevemente, sai do modo edição
- Cancelar → reverte para modo leitura sem salvar
- Erro → mostra texto de erro abaixo do input no modo edição
- `readOnly` → sem efeito hover, sem clique-para-editar

---

### RecordHeader

**Arquivo:** `src/components/RecordHeader/RecordHeader.tsx`

A seção de cabeçalho no topo de uma página de detalhe de registro, similar ao Record Home do SLDS.

```tsx
type RecordHeaderProps = {
  objectIcon?: React.ReactNode;        // Ícone ou emoji para o tipo de objeto
  objectLabel: string;                 // ex: "Contato", "Empresa"
  recordName: string;
  avatar?: {
    name: string;
    src?: string;
    type?: 'user' | 'entity';
  };
  breadcrumbs?: Array<{ label: string; href?: string }>;
  actions?: React.ReactNode;           // Botões de ação no lado direito
  children?: React.ReactNode;          // Abaixo do cabeçalho (ex: badge de status)
};
```

**Especificação visual:**
```
┌─────────────────────────────────────────────────────────────────────┐
│  Contatos > João Silva                  [Editar] [Excluir] [⋮ Mais]│
│  ┌────┐                                                             │
│  │ JS │  João Silva                                                 │
│  └────┘  Contato                                                    │
│          [Badge ativo]                                               │
└─────────────────────────────────────────────────────────────────────┘
```

- **Breadcrumbs:** `fontSize: fontSizeSmall`, `color: textLink`, separados por `›`, último item é texto simples
- **Avatar:** `size: large` (48px), à esquerda
- **Nome do Registro:** `fontSize: fontSizeXXLarge` (24px), `fontWeight: fontWeightBold`
- **Label do Objeto:** `fontSize: fontSizeSmall`, `color: textPlaceholder`, abaixo do nome
- **Ações:** linha flex de botões, alinhados à direita
- **Container:** `padding: spacingLarge`, `border-bottom: 1px solid borderDefault`, `backgroundColor: neutral0`

---

### PropertyBox

**Arquivo:** `src/components/PropertyBox/PropertyBox.tsx`

Uma lista vertical de pares label–valor para campos de registro que podem ser editados inline.

```tsx
type PropertyItem = {
  key: string;
  label: string;
  value: string | number | boolean | null;
  fieldType?: FieldType;
  readOnly?: boolean;
  options?: Array<{ value: string; label: string }>;
};

type PropertyBoxProps = {
  fields: PropertyItem[];
  onFieldSave?: (fieldKey: string, newValue: string | number | boolean | null) => void;
  saving?: Record<string, boolean>;    // Estado de salvamento por campo
  errors?: Record<string, string>;     // Mensagens de erro por campo
  compact?: boolean;                   // Reduzir espaçamento vertical
};
```

**Especificação visual:**
- Cada linha de campo: linha flex, `min-height: 36px`, `padding: spacingXSmall 0`
- **Label:** `width: 140px`, `flex-shrink: 0`, `fontSize: fontSizeSmall`, `fontWeight: fontWeightMedium`, `color: textLabel`, `text-align: right`, `padding-right: spacingMedium`
- **Valor:** `flex: 1`, `max-width: 300px`, renderiza componente `InlineEdit`
- **Divisor:** `border-bottom: 1px solid neutral2` entre linhas (exceto compact)
- **Modo compact:** padding vertical mais apertado, sem divisores

---

### FieldRenderer

**Arquivo:** `src/components/FieldRenderer/FieldRenderer.tsx`

Renderiza um valor de campo no modo leitura com formatação adequada baseada no tipo.

```tsx
type FieldRendererProps = {
  value: unknown;
  fieldType: FieldType;
  currencyCode?: string;
  dateFormat?: string;                  // padrão data curta do locale
  emptyText?: string;                  // padrão '—'
};
```

**Regras de formatação:**
| Tipo | Exibição |
|------|----------|
| `text` | Texto simples, truncado com reticências se muito longo |
| `email` | `<a href="mailto:...">` com cor de link |
| `phone` | `<a href="tel:...">` com cor de link |
| `number` | Número formatado pelo locale |
| `date` | `toLocaleDateString()` |
| `currency` | Formatado pelo locale com símbolo de moeda (valor em micros / 1_000_000) |
| `url` | `<a href="..." target="_blank">` com ícone de link externo |
| `select` | Texto ou Badge dependendo do contexto |
| `boolean` | Checkbox (somente leitura) ou texto "Sim"/"Não" |

---

### RelationCard

**Arquivo:** `src/components/RelationCard/RelationCard.tsx`

Um card colapsável mostrando registros relacionados, usado na página de detalhe do registro abaixo dos campos.

```tsx
type RelationRecord = {
  id: string;
  name: string;
  avatar?: { name: string; src?: string };
  subtitle?: string;
};

type RelationCardProps = {
  title: string;                        // ex: "Empresa", "Contatos"
  relation: 'one' | 'many';
  records: RelationRecord[];
  loading?: boolean;
  onRecordClick?: (id: string) => void;
  emptyMessage?: string;
  maxVisible?: number;                  // padrão 5 para 'many'
  showMoreLabel?: string;               // padrão "Mostrar todos"
  defaultExpanded?: boolean;            // padrão true
};
```

**Especificação visual:**
- Usa componente `Card` como container externo
- **Cabeçalho:** título com badge de contagem para relações `many`, chevron colapsável
- **Relação única (one):** avatar + nome + subtítulo, clicável
- **Múltiplas relações (many):** lista vertical, cada item tem avatar + nome + subtítulo
- **Mostrar mais:** botão link no rodapé quando `records.length > maxVisible`
- **Vazio:** mensagem sutil "Nenhum registro relacionado"
- **Carregando:** Spinner centralizado no corpo do card

---

### Timeline

**Arquivo:** `src/components/Timeline/Timeline.tsx`

Uma timeline vertical mostrando atividades recentes de um registro.

```tsx
type TimelineEvent = {
  id: string;
  type: 'created' | 'updated' | 'note' | 'email' | 'task' | 'call' | 'event';
  title: string;
  description?: string;
  timestamp: string;                    // data ISO
  author?: { name: string; avatarUrl?: string };
  icon?: React.ReactNode;
};

type TimelineProps = {
  events: TimelineEvent[];
  loading?: boolean;
  maxVisible?: number;                  // padrão 10
  onShowMore?: () => void;
  emptyMessage?: string;
};
```

**Especificação visual:**
- Linha vertical: `2px solid neutral2`, margem esquerda em 20px
- Cada evento: ponto (círculo 8px, `brandPrimary` ou cor específica do tipo) na linha + card de conteúdo à direita
- **Conteúdo:** `fontSize: fontSizeMedium`, `color: textDefault`
- **Timestamp:** `fontSize: fontSizeXSmall`, `color: textPlaceholder`, formatado como tempo relativo ("2 horas atrás", "Ontem")
- **Autor:** avatar pequeno (x-small) + nome inline com timestamp
- **Carregando:** spinner na parte inferior
- **Vazio:** componente EmptyState com mensagem "Nenhuma atividade ainda"

---

## Novos Hooks

### useRecordDetail

**Arquivo:** `src/hooks/useRecordDetail.ts`

Busca um único registro por ID usando a API GraphQL de workspace do Twenty.

```tsx
type UseRecordDetailOptions = {
  objectNameSingular: string;          // ex: 'person', 'company', 'opportunity'
  objectNamePlural: string;            // ex: 'people', 'companies', 'opportunities'
  recordId: string;
  fields: string;                      // Seleção de campos GraphQL
};

type UseRecordDetailReturn<TRecord> = {
  record: TRecord | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
};
```

**Implementação:**
- Constrói uma query GraphQL dinâmica: `query FindOne<Object>($id: UUID!) { <singular>(filter: { id: { eq: $id } }) { ...fields } }`
- Chama `gqlWorkspace` na montagem e quando `recordId` muda
- Retorna registro tipado ou null
- Expõe função refresh para re-buscar após mutations

---

### useRecordUpdate

**Arquivo:** `src/hooks/useRecordUpdate.ts`

Hook de mutation para atualizar um único campo de um registro.

```tsx
type UseRecordUpdateOptions = {
  objectNameSingular: string;
  objectNamePlural: string;
};

type UseRecordUpdateReturn = {
  updateField: (
    recordId: string,
    fieldName: string,
    value: unknown,
  ) => Promise<{ success: boolean; error?: string }>;
  loading: boolean;
};
```

**Implementação:**
- Constrói uma mutation: `mutation Update<Object>($id: UUID!, $input: <Object>UpdateInput!) { update<Object>(id: $id, data: $input) { id } }`
- O `fieldName` pode ser um caminho aninhado (ex: `name.firstName`) — o hook constrói o objeto de input aninhado adequado
- Retorna resultado sucesso/erro para o componente consumidor mostrar feedback via toast

---

### useToast

**Arquivo:** `src/hooks/useToast.ts`

Hook que fornece acesso ao sistema de notificações toast via contexto React.

```tsx
type UseToastReturn = {
  showToast: (toast: Omit<ToastData, 'id'>) => void;
  showSuccess: (message: string, detail?: string) => void;
  showError: (message: string, detail?: string) => void;
  showWarning: (message: string, detail?: string) => void;
  showInfo: (message: string, detail?: string) => void;
};
```

**Implementação:**
- Consumido do contexto do `ToastProvider`
- `showToast` gera um ID único e adiciona o toast ao estado
- Métodos de conveniência mapeiam para variantes específicas
- Timers de auto-dismiss gerenciados internamente pelo provider

---

## Novos Ícones

Os seguintes ícones precisam ser adicionados ao componente `Icon` existente:

| Nome do Ícone | Uso | Fonte SVG |
|---------------|-----|-----------|
| `edit` | Indicador de lápis para edição inline | Ícone de lápis |
| `save` | Ação salvar na edição inline | Ícone checkmark circular |
| `cancel` | Ação cancelar na edição inline | Ícone X circular |
| `user` | Fallback padrão de avatar de usuário | Silhueta de pessoa |
| `company` | Fallback padrão de avatar de entidade | Ícone de prédio |
| `chevron-up` | Toggle de seção colapsável | Chevron para cima |
| `external-link` | Links de campo URL | Seta saindo de uma caixa |
| `more` | Menu de mais ações | Três pontos horizontais |
| `email` | Evento de email na timeline | Ícone de envelope |
| `phone-icon` | Campo de telefone / evento de chamada | Ícone de telefone |
| `note` | Evento de nota na timeline | Ícone de documento |
| `task` | Evento de tarefa na timeline | Ícone de checkbox/tarefa |
| `calendar` | Evento de calendário | Ícone de calendário |
| `clock` | Exibição de timestamp | Ícone de relógio |
| `info` | Ícone de variante info do toast | Círculo com info |
| `warning` | Ícone de variante warning do toast | Triângulo de aviso |
| `error-icon` | Ícone de variante error do toast | Círculo de erro |
| `success` | Ícone de variante success do toast | Círculo com checkmark |
| `arrow-left` | Navegação para trás | Seta para esquerda |

---

## Páginas

### RecordShowPage (genérico)

**Arquivo:** `src/pages/RecordShowPage.tsx`

Um wrapper genérico que resolve o `objectNameSingular` e `recordId` da URL, e então renderiza o componente de detalhe apropriado.

```tsx
// Rota: /contacts/:recordId, /companies/:recordId, /deals/:recordId
// A página determina qual visualização de detalhe renderizar baseado na rota correspondente.
```

### ContactDetailPage

**Arquivo:** `src/pages/ContactDetailPage.tsx`

**Objeto:** `person` / `people`

**Campos do cabeçalho:**
- Avatar: iniciais de `name.firstName + name.lastName`, tipo `user`
- Nome do Registro: `name.firstName + name.lastName`
- Label do Objeto: "Contato"

**Aba Detalhes — campos:**
| Label | Caminho do Campo | Tipo | Editável |
|-------|-----------------|------|----------|
| Primeiro Nome | `name.firstName` | text | Sim |
| Último Nome | `name.lastName` | text | Sim |
| Email | `emails.primaryEmail` | email | Sim |
| Telefone | `phones.primaryPhoneNumber` | phone | Sim |
| Cidade | `city` | text | Sim |
| Cargo | `jobTitle` | text | Sim |
| Criado em | `createdAt` | date | Não |

**Relações:**
- Empresa (um-para-um via `company`)

**Abas:**
| Aba | Conteúdo |
|-----|----------|
| Detalhes | PropertyBox + RelationCard (Empresa) |
| Timeline | Componente Timeline (futuro: populado com atividades) |
| Notas | Placeholder para Fase 3 |
| Tarefas | Placeholder para Fase 3 |

**Campos GraphQL:**
```graphql
id
name { firstName lastName }
emails { primaryEmail }
phones { primaryPhoneNumber }
company { id name domainName { primaryLinkUrl } }
city
jobTitle
avatarUrl
createdAt
updatedAt
```

---

### CompanyDetailPage

**Arquivo:** `src/pages/CompanyDetailPage.tsx`

**Objeto:** `company` / `companies`

**Campos do cabeçalho:**
- Avatar: `name` da empresa, tipo `entity`
- Nome do Registro: `name`
- Label do Objeto: "Empresa"

**Aba Detalhes — campos:**
| Label | Caminho do Campo | Tipo | Editável |
|-------|-----------------|------|----------|
| Nome | `name` | text | Sim |
| Domínio | `domainName.primaryLinkUrl` | url | Sim |
| Funcionários | `employees` | number | Sim |
| Endereço | `address.addressCity` | text | Sim |
| Criado em | `createdAt` | date | Não |

**Relações:**
- Contatos (um-para-muitos via `people`)

**Abas:**
| Aba | Conteúdo |
|-----|----------|
| Detalhes | PropertyBox + RelationCard (Contatos) |
| Timeline | Componente Timeline |
| Notas | Placeholder |
| Tarefas | Placeholder |

**Campos GraphQL:**
```graphql
id
name
domainName { primaryLinkUrl }
employees
address { addressCity addressState addressCountry }
createdAt
updatedAt
people {
  edges {
    node {
      id
      name { firstName lastName }
      emails { primaryEmail }
      avatarUrl
    }
  }
}
```

---

### DealDetailPage

**Arquivo:** `src/pages/DealDetailPage.tsx`

**Objeto:** `opportunity` / `opportunities`

**Campos do cabeçalho:**
- Avatar: `name` da oportunidade, tipo `entity`
- Nome do Registro: `name`
- Label do Objeto: "Oportunidade"

**Aba Detalhes — campos:**
| Label | Caminho do Campo | Tipo | Editável |
|-------|-----------------|------|----------|
| Nome | `name` | text | Sim |
| Valor | `amount.amountMicros` | currency | Sim |
| Estágio | `stage` | select | Sim |
| Data de Fechamento | `closeDate` | date | Sim |
| Criado em | `createdAt` | date | Não |

**Relações:**
- Empresa (um-para-um via `company`)

**Abas:**
| Aba | Conteúdo |
|-----|----------|
| Detalhes | PropertyBox + RelationCard (Empresa) |
| Timeline | Componente Timeline |
| Notas | Placeholder |
| Tarefas | Placeholder |

**Campos GraphQL:**
```graphql
id
name
amount { amountMicros currency { code symbol } }
stage
closeDate
createdAt
updatedAt
company { id name }
```

---

## Queries e Mutations GraphQL

### Buscar Um Registro

```graphql
query FindOnePerson($filter: PersonFilterInput) {
  person(filter: $filter) {
    ...fields
  }
}
# filter: { id: { eq: $recordId } }
```

### Atualizar Registro

```graphql
mutation UpdatePerson($idToUpdate: ID!, $input: PersonUpdateInput!) {
  updatePerson(id: $idToUpdate, data: $input) {
    id
  }
}
```

O hook de update constrói a mutation dinamicamente por tipo de objeto (ex: `updatePerson`, `updateCompany`, `updateOpportunity`).

---

## Alterações de Roteamento

Atualizar `AppRouter.tsx` para adicionar rotas de detalhe:

```tsx
{ path: '/contacts/:recordId', element: <ProtectedLayout><ContactDetailPage /></ProtectedLayout> },
{ path: '/companies/:recordId', element: <ProtectedLayout><CompanyDetailPage /></ProtectedLayout> },
{ path: '/deals/:recordId',     element: <ProtectedLayout><DealDetailPage /></ProtectedLayout> },
```

Atualizar páginas de lista para navegar ao detalhe no clique da linha:

```tsx
onRowClick={(record) => navigate(`#/contacts/${record.id}`)}
```

---

## Adições de Design Tokens

Nenhuma nova CSS custom property necessária. Todos os componentes usam tokens existentes com estes mapeamentos compostos:

| Uso | Tokens Utilizados |
|-----|-------------------|
| Fundo iniciais do Avatar | `brandPrimary` |
| Texto iniciais do Avatar | `textInverse` |
| Indicador ativo da Aba | `brandPrimary` (borda inferior 3px) |
| Indicador hover da Aba | `neutral3` (borda inferior 3px) |
| Borda da barra de Abas | `neutral2` (borda inferior 2px) |
| Backdrop do Modal | `rgba(0,0,0,0.5)` |
| Sombra do Modal | `elevationModal` |
| Fundo toast success | `successLight` / borda esquerda `success` |
| Fundo toast error | `errorLight` / borda esquerda `error` |
| Fundo toast warning | `warningLight` / borda esquerda `warning` |
| Fundo toast info | `infoLight` / borda esquerda `brandPrimary` |
| Fundo hover do InlineEdit | `neutral1` |
| Cor do label de propriedade | `textLabel` |
| Linha da Timeline | `neutral2` (2px) |
| Ponto da Timeline | `brandPrimary` (círculo 8px) |
| Separador do breadcrumb | `textPlaceholder` |
| Link do breadcrumb | `textLink` |

---

## Checklist de Acessibilidade

Conforme diretrizes SLDS 2 e WCAG 2.1 AA:

### Tabs
- [ ] `role="tablist"` no container, `role="tab"` em cada aba, `role="tabpanel"` no conteúdo
- [ ] `aria-selected="true"` na aba ativa, `"false"` nas demais
- [ ] `aria-controls` na aba apontando para o painel, `aria-labelledby` no painel apontando para a aba
- [ ] Navegação por setas entre as abas
- [ ] Apenas aba ativa na ordem de tabulação (`tabIndex={0}`)
- [ ] `aria-disabled="true"` em abas desabilitadas

### Modal
- [ ] `role="dialog"`, `aria-modal="true"`, `aria-labelledby` apontando para o título
- [ ] Foco preso dentro do modal quando aberto
- [ ] Foco move para o primeiro elemento focalizável ao abrir
- [ ] Foco retorna ao elemento que acionou ao fechar
- [ ] Tecla Escape fecha o modal
- [ ] Backdrop impede interação com o fundo

### Toast
- [ ] `role="status"` e `aria-live="polite"` no container do toast
- [ ] `aria-atomic="true"` para que leitores de tela anunciem o toast completo
- [ ] Botão fechar tem `aria-label="Fechar notificação"`
- [ ] Timers de auto-dismiss pausam ao hover/foco

### Avatar
- [ ] Texto `alt` derivado da prop `name` (ou vazio se decorativo)
- [ ] Quando interativo (button/link), o elemento envolvente tem role/label adequado

### InlineEdit
- [ ] `role="button"` no modo leitura com `aria-label="Editar {label}"`
- [ ] Input tem `aria-label` correspondendo ao label do campo
- [ ] Botões Salvar/Cancelar têm `aria-label` descritivo
- [ ] Mensagens de erro vinculadas via `aria-describedby`

### Página de Registro
- [ ] `<h1>` para o nome do registro
- [ ] Breadcrumbs usam `<nav aria-label="Breadcrumb">` + `<ol>`
- [ ] Todos os elementos interativos acessíveis por teclado
- [ ] Contraste de cor mínimo 4.5:1

---

## Resumo da Estrutura de Arquivos

```
packages/erencio-front/src/
├── components/
│   ├── Avatar/
│   │   ├── Avatar.tsx
│   │   └── index.ts
│   ├── Tabs/
│   │   ├── Tabs.tsx
│   │   └── index.ts
│   ├── Modal/
│   │   ├── Modal.tsx
│   │   └── index.ts
│   ├── Toast/
│   │   ├── Toast.tsx
│   │   ├── ToastContainer.tsx
│   │   ├── ToastProvider.tsx
│   │   └── index.ts
│   ├── InlineEdit/
│   │   ├── InlineEdit.tsx
│   │   └── index.ts
│   ├── RecordHeader/
│   │   ├── RecordHeader.tsx
│   │   └── index.ts
│   ├── PropertyBox/
│   │   ├── PropertyBox.tsx
│   │   └── index.ts
│   ├── FieldRenderer/
│   │   ├── FieldRenderer.tsx
│   │   └── index.ts
│   ├── RelationCard/
│   │   ├── RelationCard.tsx
│   │   └── index.ts
│   ├── Timeline/
│   │   ├── Timeline.tsx
│   │   └── index.ts
│   └── index.ts            ← barrel atualizado
├── hooks/
│   ├── useAuth.tsx
│   ├── useRecordList.ts
│   ├── useRecordDetail.ts  ← novo
│   ├── useRecordUpdate.ts  ← novo
│   └── useToast.ts         ← novo
├── pages/
│   ├── ContactsListPage.tsx
│   ├── CompaniesListPage.tsx
│   ├── DealsListPage.tsx
│   ├── ContactDetailPage.tsx   ← novo
│   ├── CompanyDetailPage.tsx   ← novo
│   ├── DealDetailPage.tsx      ← novo
│   ├── DashboardPage.tsx
│   ├── LoginPage.tsx
│   └── ProfileSettingsPage.tsx
├── utils/
│   └── api.ts
└── AppRouter.tsx            ← atualizado
```

---

## Definição de Pronto (Conforme BACKOFFICE-MIGRATION.md)

1. ✅ Todos os dados carregados via GraphQL (mesma API do Twenty)
2. ✅ Edição de campos via edição inline (salva via mutations GraphQL)
3. ✅ Componentes usam apenas design tokens Erencio.com Backoffice
4. ✅ Acessibilidade: navegável por teclado, atributos ARIA corretos
5. ✅ Responsivo: funciona em tablet (768px) e desktop (1280px+)
6. ✅ Rotas adicionadas ao AppRouter
7. ✅ Documentado no BACKOFFICE-COMPONENTS.md
8. ✅ Feedback via toast em ações de salvar/erro
9. ✅ Navegação das páginas de lista para as páginas de detalhe

---

## Ordem de Implementação

A sequência de implementação recomendada (dependências de componentes):

1. **Ícones** — novos ícones necessários para todos os componentes subsequentes
2. **Avatar** — independente, usado por RecordHeader e RelationCard
3. **Tabs** — independente, usado por todas as páginas de detalhe
4. **Modal** — independente, base para fases futuras
5. **Toast + ToastProvider + useToast** — sistema de notificações
6. **FieldRenderer** — exibição de campo somente leitura
7. **InlineEdit** — edição inline (depende de FieldRenderer)
8. **PropertyBox** — lista de campos (depende de InlineEdit)
9. **RecordHeader** — cabeçalho de página (depende de Avatar)
10. **RelationCard** — exibição de registros relacionados (depende de Avatar, Card)
11. **Timeline** — timeline de atividades (depende de Avatar)
12. **useRecordDetail** — hook de busca de dados
13. **useRecordUpdate** — hook de mutation
14. **ContactDetailPage** — primeira página de detalhe (integra todos)
15. **CompanyDetailPage** — segunda página de detalhe
16. **DealDetailPage** — terceira página de detalhe
17. **AppRouter + atualização das páginas de lista** — roteamento e navegação
18. **Atualização do BACKOFFICE-COMPONENTS.md** — documentação
