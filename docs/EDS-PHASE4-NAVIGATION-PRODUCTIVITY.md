# EDS Fase 4 — Navegação e Produtividade: Plano de Design e Implementação

Este documento especifica os componentes, comportamentos, tokens e estrutura de página para a Fase 4 da migração EDS (Navegação e Produtividade). Todos os designs seguem os princípios do [SLDS 2](https://www.lightningdesignsystem.com/) adaptados para React, usando design tokens EDS (`--eds-g-*`).

---

## Índice

1. [Escopo](#escopo)
2. [Novos Componentes](#novos-componentes)
   - [CommandMenu](#commandmenu)
   - [GlobalSearch](#globalsearch)
   - [NotificationPanel](#notificationpanel)
   - [NotificationItem](#notificationitem)
   - [CalendarGrid](#calendargrid)
   - [CalendarEvent](#calendarevent)
   - [KanbanBoard](#kanbanboard)
   - [KanbanColumn](#kanbancolumn)
   - [KanbanCard](#kanbancard)
   - [Popover](#popover)
   - [DropdownMenu](#dropdownmenu)
   - [Pill](#pill)
3. [Novos Ícones](#novos-ícones)
4. [Novos Hooks](#novos-hooks)
   - [useCommandMenu](#usecommandmenu)
   - [useGlobalSearch](#useglobalsearch)
   - [useNotifications](#usenotifications)
   - [useCalendarEvents](#usecalendarevents)
   - [useKanbanBoard](#usekanbanboard)
   - [useKeyboardShortcut](#usekeyboardshortcut)
5. [Páginas](#páginas)
   - [CalendarPage](#calendarpage)
   - [KanbanDealsPage](#kanbandealspage)
6. [Queries e Mutations GraphQL](#queries-e-mutations-graphql)
7. [Alterações de Roteamento](#alterações-de-roteamento)
8. [Adições de Design Tokens](#adições-de-design-tokens)
9. [Integração com o Shell](#integração-com-o-shell)
10. [Checklist de Acessibilidade](#checklist-de-acessibilidade)
11. [Resumo da Estrutura de Arquivos](#resumo-da-estrutura-de-arquivos)
12. [Definição de Pronto](#definição-de-pronto)

---

## Escopo

A Fase 4 entrega funcionalidades de **Navegação e Produtividade**:

- **Command Menu**: Uma paleta de comandos dirigida por teclado (Ctrl+K / ⌘K) para navegação rápida, busca de registros e execução de ações
- **Busca Global**: Um input de busca persistente na barra de navegação superior que busca em todos os tipos de registro (contatos, empresas, oportunidades)
- **Painel de Notificações**: Um painel popover na barra superior mostrando notificações do sistema (mudanças em registros, menções, lembretes)
- **Visualização de Calendário**: Um grid de calendário mensal exibindo eventos de calendário e datas de fechamento de oportunidades
- **Visualização Kanban**: Um quadro com arrastar-e-soltar para gerenciar oportunidades por estágio do pipeline

Essas funcionalidades melhoram a velocidade de navegação, descoberta e gerenciamento visual do pipeline.

---

## Novos Componentes

### CommandMenu

> Referência SLDS 2: [Combobox](https://www.lightningdesignsystem.com/components/combobox/) (adaptado como overlay de paleta de comandos)

**Arquivo:** `src/components/CommandMenu/CommandMenu.tsx`

Um overlay modal acionado por Ctrl+K / ⌘K que fornece navegação rápida, busca de registros e atalhos de ação.

```tsx
type CommandType = 'navigate' | 'create' | 'action' | 'record';

type CommandItem = {
  id: string;
  label: string;
  description?: string;
  type: CommandType;
  icon?: IconName;
  shortcut?: string[];        // ex: ['⌘', 'N'] para exibição
  href?: string;              // para comandos de navegação
  onClick?: () => void;       // para comandos de ação
  objectType?: string;        // para itens de registro (person, company, opportunity)
  keywords?: string[];        // termos de busca adicionais
};

type CommandGroup = {
  id: string;
  label: string;
  items: CommandItem[];
};

type CommandMenuProps = {
  open: boolean;
  onClose: () => void;
  groups: CommandGroup[];
  onSelect: (item: CommandItem) => void;
  loading?: boolean;
  placeholder?: string;
};
```

**Anatomia:**

| # | Elemento | Descrição |
|---|---------|-----------|
| 1 | Backdrop | Overlay semi-transparente, cobre toda a viewport |
| 2 | Container | Painel modal centralizado, `maxWidth: 640px`, `maxHeight: 480px` |
| 3 | Input de Busca | Input com foco automático e ícone de busca, largura total |
| 4 | Cabeçalhos de Grupo | Labels de categoria (Navegação, Ações, Registros Recentes, Resultados de Busca) |
| 5 | Itens de Comando | Linhas selecionáveis: ícone + label + descrição + badge de atalho |
| 6 | Indicador Ativo | Destaque de fundo no item com foco do teclado |
| 7 | Rodapé | Linha de dica: "↑↓ para navegar · Enter para selecionar · Esc para fechar" |

**Especificação visual:**

- **Backdrop:** `backgroundColor: rgba(0,0,0,0.5)`, `zIndex: zIndexModal`
- **Container:** `backgroundColor: neutral0`, `borderRadius: radiusLarge`, `boxShadow: elevationModal`, `overflow: hidden`, `border: 1px solid neutral2`
- **Input de busca:** `height: 48px`, `padding: 0 spacingMedium`, `fontSize: fontSizeBase`, `border: none`, `borderBottom: 1px solid neutral2`, `backgroundColor: neutral0`, sem outline
- **Ícone de busca:** 16px, `color: textPlaceholder`, à esquerda do input
- **Cabeçalho do grupo:** `padding: spacingXXSmall spacingMedium`, `fontSize: fontSizeSmall`, `fontWeight: fontWeightMedium`, `color: textPlaceholder`, `textTransform: uppercase`, `letterSpacing: 0.05em`, `backgroundColor: neutral1`
- **Item de comando (padrão):** `padding: spacingXSmall spacingMedium`, `display: flex`, `alignItems: center`, `gap: spacingSmall`, `cursor: pointer`
- **Item de comando (ativo/hover):** `backgroundColor: brandPrimaryLight`, `color: textDefault`
- **Ícone do item:** 16px, `color: textPlaceholder`, ativo: `color: brandPrimary`
- **Label do item:** `fontSize: fontSizeMedium`, `fontWeight: fontWeightRegular`, `color: textDefault`
- **Descrição do item:** `fontSize: fontSizeSmall`, `color: textPlaceholder`, `marginLeft: auto`
- **Badge de atalho:** `display: inline-flex`, `gap: 2px`, cada tecla em `padding: 1px 6px`, `backgroundColor: neutral1`, `border: 1px solid neutral2`, `borderRadius: radiusSmall`, `fontSize: fontSizeXSmall`, `fontWeight: fontWeightMedium`, `color: textLabel`
- **Rodapé:** `padding: spacingXXSmall spacingMedium`, `borderTop: 1px solid neutral2`, `fontSize: fontSizeXSmall`, `color: textPlaceholder`, `backgroundColor: neutral1`
- **Estado vazio:** Texto centralizado "Nenhum resultado encontrado", `color: textPlaceholder`, `padding: spacingLarge`
- **Carregando:** Pequeno spinner centralizado abaixo do input de busca

**Comportamentos:**

- Abre com `Ctrl+K` (Windows/Linux) ou `⌘K` (macOS), ou quando o botão trigger na barra superior é clicado
- Input de busca recebe foco automático ao abrir
- Digitar filtra os itens de comando por label, descrição e keywords (insensível a maiúsculas)
- Setas `↑`/`↓` navegam entre os itens; item ativo faz scroll para ficar visível
- `Enter` seleciona o item ativo (aciona navegação ou ação)
- `Escape` fecha o menu; foco retorna ao elemento anterior
- Clicar no backdrop fecha o menu
- Grupos com zero itens correspondentes são ocultados
- Quando a busca não está vazia e nenhum comando estático corresponde, uma busca em tempo real é acionada contra a API GraphQL (debounce 300ms)
- Resultados de registros exibem o ícone do tipo de objeto e o nome do registro
- Máximo 5 itens por grupo nos resultados de busca para evitar sobrecarga
- `aria-role="dialog"`, `aria-modal="true"`, `aria-label="Menu de comandos"`

---

### GlobalSearch

> Referência SLDS 2: [Input — tipo Search](https://www.lightningdesignsystem.com/components/input/)

**Arquivo:** `src/components/GlobalSearch/GlobalSearch.tsx`

Um input de busca persistente embutido na barra superior do Shell que fornece acesso rápido ao CommandMenu completo ou exibe resultados rápidos inline.

```tsx
type SearchResult = {
  id: string;
  label: string;
  objectType: string;         // 'person' | 'company' | 'opportunity'
  icon: IconName;
  href: string;
};

type GlobalSearchProps = {
  onOpenCommandMenu: () => void;    // Abre o menu de comandos completo
  placeholder?: string;
};
```

**Anatomia:**

| # | Elemento | Descrição |
|---|---------|-----------|
| 1 | Container de Busca | Wrapper compacto de input na barra superior |
| 2 | Ícone de Busca | Ícone de busca alinhado à esquerda |
| 3 | Input | Input de texto com placeholder |
| 4 | Dica de Atalho | Badge "⌘K" no lado direito do input |
| 5 | Dropdown de Resultados | Popover de resultados rápidos (máx 8 itens, agrupados por tipo) |

**Especificação visual:**

- **Container:** `width: 280px`, `height: 32px`, `display: flex`, `alignItems: center`, `backgroundColor: rgba(255,255,255,0.1)`, `borderRadius: radiusMedium`, `padding: 0 spacingSmall`, `border: 1px solid transparent`, `transition: all durationPromptly`
- **Container (foco):** `backgroundColor: neutral0`, `border: 1px solid borderFocus`, `width: 360px`
- **Ícone de busca:** 14px, `color: neutral4` (sem foco), `color: textPlaceholder` (com foco)
- **Input:** `background: none`, `border: none`, `outline: none`, `color: textInverse` (sem foco), `color: textDefault` (com foco), `fontSize: fontSizeSmall`, `flex: 1`
- **Dica de atalho:** Usa mesmo estilo do badge de atalho do CommandMenu, visível quando o input está vazio
- **Dropdown de resultados:** Como o container do CommandMenu mas menor, `maxWidth: 400px`, `position: absolute`, `top: calc(100% + 4px)`, `right: 0`, `boxShadow: elevationDropdown`, `zIndex: zIndexDropdown`

**Comportamentos:**

- Clicar na barra de busca ou pressionar o atalho abre o valor no CommandMenu completo
- Ao focar, o input expande de 280px para 360px com transição
- Digitar exibe um dropdown de resultados rápidos (debounce 300ms)
- Cada resultado exibe ícone + label + badge de tipo de objeto
- Clicar em um resultado navega para a página de detalhe do registro
- Pressionar `Enter` com texto abre o CommandMenu com a busca pré-preenchida
- Pressionar `Escape` ou blur fecha o dropdown e reseta a largura
- Em mobile/viewports estreitos, o input de busca colapsa para apenas o ícone, expandindo ao clicar

---

### NotificationPanel

> Referência SLDS 2: adaptado de [Popover](https://v1.lightningdesignsystem.com/components/popovers/) + padrão de lista de notificações

**Arquivo:** `src/components/NotificationPanel/NotificationPanel.tsx`

Um painel popover anexado a um ícone de sino na barra superior que exibe notificações do sistema.

```tsx
type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'mention' | 'reminder';

type NotificationData = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;           // ISO 8601
  read: boolean;
  href?: string;               // link para o registro relacionado
  actor?: {
    name: string;
    avatarUrl?: string;
  };
};

type NotificationPanelProps = {
  open: boolean;
  onClose: () => void;
  notifications: NotificationData[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onNotificationClick: (notification: NotificationData) => void;
  loading?: boolean;
  unreadCount?: number;
};
```

**Anatomia:**

| # | Elemento | Descrição |
|---|---------|-----------|
| 1 | Trigger (ícone de sino) | Na barra superior, exibe badge de não lidas |
| 2 | Container do painel | Popover, ancorado abaixo do ícone de sino |
| 3 | Cabeçalho | Título "Notificações" + link "Marcar todas como lidas" |
| 4 | Lista de notificações | Lista com scroll de NotificationItem |
| 5 | Estado vazio | Mensagem "Sem notificações" quando a lista está vazia |
| 6 | Rodapé | Link opcional "Ver todas" |

**Especificação visual:**

- **Trigger (ícone de sino):** `position: relative`, ícone 20px, `color: neutral3`
- **Badge de não lidas:** `position: absolute`, `top: -4px`, `right: -4px`, `width: 16px`, `height: 16px`, `borderRadius: radiusCircle`, `backgroundColor: error`, `color: textInverse`, `fontSize: fontSizeXSmall`, `fontWeight: fontWeightBold`, `display: flex`, `alignItems: center`, `justifyContent: center`. Se contagem > 9, exibe "9+"
- **Container do painel:** `position: absolute`, `top: calc(100% + 8px)`, `right: 0`, `width: 380px`, `maxHeight: 480px`, `backgroundColor: neutral0`, `borderRadius: radiusMedium`, `boxShadow: elevationDropdown`, `border: 1px solid neutral2`, `overflow: hidden`, `zIndex: zIndexDropdown`
- **Cabeçalho:** `padding: spacingSmall spacingMedium`, `borderBottom: 1px solid neutral2`, `display: flex`, `justifyContent: space-between`, `alignItems: center`. Título: `fontSize: fontSizeMedium`, `fontWeight: fontWeightMedium`. "Marcar todas como lidas": `fontSize: fontSizeSmall`, `color: textLink`, `cursor: pointer`
- **Área da lista:** `maxHeight: 400px`, `overflowY: auto`
- **Estado vazio:** `padding: spacingXLarge`, centralizado, `color: textPlaceholder`, ícone de sino 32px

**Comportamentos:**

- Clicar no ícone de sino alterna o painel aberto/fechado
- Clicar fora do painel fecha-o
- Escape fecha o painel
- Clicar em uma notificação chama `onNotificationClick` e navega para `href`
- "Marcar todas como lidas" chama `onMarkAllAsRead` e visualmente marca todas as notificações
- Novas notificações aparecem no topo da lista
- Notificações não lidas têm uma borda de destaque azul à esquerda
- O painel auto-atualiza a cada 30 segundos (via polling do hook)

---

### NotificationItem

**Arquivo:** `src/components/NotificationPanel/NotificationItem.tsx`

Linha individual de notificação dentro do NotificationPanel.

```tsx
type NotificationItemProps = {
  notification: NotificationData;
  onClick: () => void;
  onMarkAsRead: () => void;
};
```

**Especificação visual:**

- **Container:** `padding: spacingSmall spacingMedium`, `display: flex`, `gap: spacingSmall`, `cursor: pointer`, `borderBottom: 1px solid neutral1`, `transition: background durationQuickly`
- **Container (não lida):** `borderLeft: 3px solid brandPrimary`, `backgroundColor: brandPrimaryLight` (a 30% de opacidade)
- **Container (hover):** `backgroundColor: neutral1`
- **Área de avatar/ícone:** círculo 32px, lado esquerdo. Se ator tem avatar, exibe-o; caso contrário exibe ícone do tipo com fundo colorido
- **Área de conteúdo:** `flex: 1`
- **Título:** `fontSize: fontSizeMedium`, `fontWeight: fontWeightMedium` (não lida) ou `fontWeightRegular` (lida), `color: textDefault`, linha única com overflow de reticências
- **Mensagem:** `fontSize: fontSizeSmall`, `color: textPlaceholder`, máx 2 linhas com reticências
- **Timestamp:** `fontSize: fontSizeXSmall`, `color: textPlaceholder`, tempo relativo (ex: "2min atrás", "1h atrás", "Ontem")
- **Botão marcar como lida:** Pequeno ícone de ponto ou "•", visível ao hover, `color: brandPrimary`

**Cores de ícone por tipo:**

| Tipo | Ícone | Fundo |
|------|-------|-------|
| info | `info` | `infoLight` |
| success | `success` | `successLight` |
| warning | `warning` | `warningLight` |
| error | `error-icon` | `errorLight` |
| mention | `user` | `brandPrimaryLight` |
| reminder | `clock` | `warningLight` |

---

### CalendarGrid

> Referência SLDS 2: [Datepicker](https://www.lightningdesignsystem.com/components/datepicker/) (estendido como calendário de página inteira)

**Arquivo:** `src/components/CalendarGrid/CalendarGrid.tsx`

Um grid de calendário mensal para exibir eventos e registros baseados em data.

```tsx
type CalendarEventData = {
  id: string;
  title: string;
  date: string;                // data/datetime ISO 8601
  endDate?: string;            // para eventos de múltiplos dias
  color?: string;              // sobrescrever cor do ponto/badge
  variant?: 'default' | 'success' | 'warning' | 'error' | 'brand';
  onClick?: () => void;
};

type CalendarGridProps = {
  year: number;
  month: number;               // indexado a partir de 0 (0=Janeiro)
  events: CalendarEventData[];
  onMonthChange: (year: number, month: number) => void;
  onDateClick?: (date: string) => void;
  onEventClick?: (event: CalendarEventData) => void;
  loading?: boolean;
  todayLabel?: string;
  locale?: string;             // padrão 'pt-BR'
};
```

**Anatomia:**

| # | Elemento | Descrição |
|---|---------|-----------|
| 1 | Cabeçalho | Título Mês/Ano, botões Anterior/Próximo/Hoje |
| 2 | Linha dos Dias da Semana | Cabeçalhos de coluna Dom–Sáb |
| 3 | Grid de Dias | Grid 6×7 de células de dias |
| 4 | Célula do Dia | Número da data + pontos/badges de eventos |
| 5 | Ponto de Evento | Pequeno ponto colorido por evento (máx 3 visíveis, overflow "+N mais") |
| 6 | Tooltip do Evento | Ao hover, exibe título e horário do evento |

**Especificação visual:**

- **Cabeçalho:** `display: flex`, `justifyContent: space-between`, `alignItems: center`, `padding: spacingSmall spacingMedium`, `marginBottom: spacingSmall`
- **Título do mês:** `fontSize: fontSizeXLarge`, `fontWeight: fontWeightBold`, `color: textDefault`
- **Botões de navegação:** componente `Button`, variante `ghost`, tamanho `small`, com ícones `chevron-left`/`chevron-right`
- **Botão hoje:** componente `Button`, variante `outline`, tamanho `small`, label "Hoje"
- **Linha dos dias da semana:** `display: grid`, `gridTemplateColumns: repeat(7, 1fr)`, `textAlign: center`, `padding: spacingXXSmall 0`, `fontSize: fontSizeSmall`, `fontWeight: fontWeightMedium`, `color: textPlaceholder`, `borderBottom: 1px solid neutral2`
- **Grid de dias:** `display: grid`, `gridTemplateColumns: repeat(7, 1fr)`, `gap: 0`, cada célula `minHeight: 100px`
- **Célula do dia:** `padding: spacingXXSmall`, `border: 1px solid neutral1`, `cursor: pointer`, `position: relative`
- **Célula do dia (hover):** `backgroundColor: neutral1`
- **Célula do dia (hoje):** Número da data tem `backgroundColor: brandPrimary`, `color: textInverse`, `borderRadius: radiusCircle`, `width: 24px`, `height: 24px`, centralizado
- **Célula do dia (outro mês):** `color: textDisabled`, `backgroundColor: neutral1` a 50% de opacidade
- **Célula do dia (selecionada):** `outline: 2px solid brandPrimary`, `outlineOffset: -2px`
- **Número da data:** `fontSize: fontSizeSmall`, `fontWeight: fontWeightRegular`, `color: textDefault`, `display: flex`, `justifyContent: center`, `width: 24px`, `height: 24px`, `lineHeight: 24px`, `marginBottom: spacingXXXSmall`
- **Ponto de evento:** `width: 6px`, `height: 6px`, `borderRadius: radiusCircle`, inline, `marginRight: 2px`
- **Badge de evento (quando ≤3):** `display: flex`, `alignItems: center`, `gap: 2px`, `fontSize: fontSizeXSmall`, `padding: 1px 4px`, `borderRadius: radiusSmall`, texto truncado
- **"+N mais":** `fontSize: fontSizeXSmall`, `color: textLink`, `cursor: pointer`

**Variantes de ponto de evento:**

| Variante | Cor |
|----------|-----|
| default | `neutral5` |
| brand | `brandPrimary` |
| success | `success` |
| warning | `warning` |
| error | `error` |

**Comportamentos:**

- Botões Anterior/Próximo mudam o mês exibido
- Botão "Hoje" navega para o mês atual e destaca hoje
- Clicar em uma célula de dia aciona `onDateClick` com a string de data ISO
- Clicar em um ponto/badge de evento aciona `onEventClick`
- Hover sobre um evento exibe tooltip com título e horário
- Dias fora do mês atual estão esmaecidos mas ainda clicáveis
- Teclado: `←`/`→` navegam dias, `↑`/`↓` navegam semanas, `Home`/`End` primeiro/último dia da semana, `PageUp`/`PageDown` mudam meses
- O grid é anotado com `role="grid"` com `aria-label="Calendário"`
- Cada célula de dia é `role="gridcell"` com `aria-label="15 de janeiro de 2026"` (data completa)
- A data ativa/focada tem `tabIndex={0}`, todas as outras `tabIndex={-1}`

---

### CalendarEvent

**Arquivo:** `src/components/CalendarGrid/CalendarEvent.tsx`

Pequeno indicador de evento renderizado dentro de uma célula do CalendarGrid.

```tsx
type CalendarEventProps = {
  title: string;
  time?: string;                // ex: "10:00"
  variant?: 'default' | 'success' | 'warning' | 'error' | 'brand';
  onClick?: () => void;
  compact?: boolean;            // apenas ponto (para células pequenas)
};
```

**Especificação visual:**

- **Modo normal (compact=false):** `display: flex`, `alignItems: center`, `gap: 4px`, `padding: 1px 4px`, `borderRadius: radiusSmall`, `fontSize: fontSizeXSmall`, `cursor: pointer`, `whiteSpace: nowrap`, `overflow: hidden`, `textOverflow: ellipsis`
- **Fundo:** Cada variante usa sua cor clara com 20% de opacidade
- **Ponto esquerdo:** círculo `4px` com cor completa da variante
- **Texto:** `color: textDefault`, truncado
- **Modo compact (compact=true):** Apenas o ponto de 6px, sem texto
- **Hover:** `backgroundColor` na variante clara completa, tooltip aparece

---

### KanbanBoard

> Referência SLDS 2: Adaptado de [Cards](https://www.lightningdesignsystem.com/components/cards/) em layout colunar (padrão Kanban/Board), aproveitando a linguagem visual do SLDS 2

**Arquivo:** `src/components/KanbanBoard/KanbanBoard.tsx`

Um quadro horizontal com scroll de colunas, cada uma representando um estágio do pipeline, com cards arrastáveis.

```tsx
type KanbanColumnData<TRecord extends { id: string }> = {
  id: string;
  title: string;
  color?: string;               // cor de destaque para o cabeçalho da coluna
  records: TRecord[];
  aggregateValue?: string;      // ex: "R$ 45.000" soma
  aggregateLabel?: string;      // ex: "Total"
};

type KanbanBoardProps<TRecord extends { id: string }> = {
  columns: KanbanColumnData<TRecord>[];
  onCardMove: (recordId: string, fromColumnId: string, toColumnId: string, position: number) => void;
  onCardClick?: (record: TRecord) => void;
  onAddClick?: (columnId: string) => void;
  renderCard: (record: TRecord) => React.ReactNode;
  loading?: boolean;
  emptyMessage?: string;
};
```

**Anatomia:**

| # | Elemento | Descrição |
|---|---------|-----------|
| 1 | Container do quadro | Container com scroll horizontal |
| 2 | Colunas | Listas verticais, uma por estágio |
| 3 | Cabeçalho da coluna | Nome do estágio + badge de contagem + agregado |
| 4 | Corpo da coluna | Lista com scroll de cards |
| 5 | Cards | Cards individuais de oportunidade/registro |
| 6 | Indicador de soltar | Guia visual mostrando onde um card arrastado será inserido |
| 7 | Botão adicionar | "+" no rodapé de cada coluna |

**Especificação visual:**

- **Container do quadro:** `display: flex`, `gap: spacingSmall`, `overflowX: auto`, `padding: spacingSmall`, `height: 100%`, `alignItems: flex-start`
- **Coluna:** `width: 280px`, `minWidth: 280px`, `flexShrink: 0`, `backgroundColor: neutral1`, `borderRadius: radiusMedium`, `display: flex`, `flexDirection: column`, `maxHeight: 100%`
- **Cabeçalho da coluna:** `padding: spacingSmall spacingMedium`, `display: flex`, `alignItems: center`, `gap: spacingSmall`, `borderBottom: 2px solid` (cor da coluna ou neutral3)
- **Título da coluna:** `fontSize: fontSizeMedium`, `fontWeight: fontWeightMedium`, `color: textDefault`, `flex: 1`
- **Badge de contagem:** componente `Badge`, variante `default`, tamanho `small`, exibindo contagem de registros
- **Linha de agregado:** `fontSize: fontSizeSmall`, `color: textPlaceholder`, abaixo do título (ex: "Total: R$ 45.000")
- **Corpo da coluna:** `padding: spacingXSmall`, `overflowY: auto`, `flex: 1`, `display: flex`, `flexDirection: column`, `gap: spacingXSmall`
- **Botão adicionar:** `width: 100%`, `padding: spacingXSmall`, `border: 1px dashed neutral3`, `borderRadius: radiusMedium`, `color: textPlaceholder`, `cursor: pointer`, `textAlign: center`, `fontSize: fontSizeSmall`
- **Botão adicionar (hover):** `backgroundColor: neutral0`, `borderColor: brandPrimary`, `color: brandPrimary`
- **Indicador de soltar:** `height: 2px`, `backgroundColor: brandPrimary`, `borderRadius: 1px`, `margin: spacingXXXSmall 0`, opacidade animada

**Comportamentos:**

- Arrastar um card segurando-o (cursor muda para `grabbing`)
- Enquanto arrasta, o card arrastado tem opacidade reduzida (0.5), e um indicador azul de soltar de 2px aparece entre os cards
- Soltar um card em uma coluna diferente chama `onCardMove` com o novo columnId e posição
- Cards dentro de uma coluna podem ser reordenados via arraste
- Scroll horizontal via `overflowX: auto` ou shift+scroll
- Cada corpo de coluna faz scroll vertical independentemente
- Clicar no botão "+" no rodapé da coluna chama `onAddClick(columnId)`
- Teclado: Tab para entrar em um card, Espaço/Enter para "pegar", setas para mover, Espaço/Enter para soltar, Escape para cancelar
- Leitor de tela: Cards anunciam sua coluna e posição (ex: "Oportunidade X, coluna Qualificação, posição 2 de 5")
- `role="list"` no corpo da coluna, `role="listitem"` em cada card
- Arraste implementado com API nativa HTML5 Drag and Drop (sem dependência externa)

---

### KanbanCard

**Arquivo:** `src/components/KanbanBoard/KanbanCard.tsx`

Um card renderizado dentro de uma coluna do KanbanBoard. Usado como renderização padrão quando nenhum `renderCard` customizado é fornecido, mas também exportado para uso em renderizadores customizados.

```tsx
type KanbanCardProps = {
  title: string;
  subtitle?: string;
  amount?: string;              // moeda formatada
  date?: string;                // data formatada
  avatarName?: string;
  avatarUrl?: string;
  tags?: { label: string; variant: BadgeVariant }[];
  onClick?: () => void;
  draggable?: boolean;
  style?: React.CSSProperties;
};
```

**Especificação visual:**

- **Container:** `backgroundColor: neutral0`, `borderRadius: radiusMedium`, `border: 1px solid neutral2`, `padding: spacingSmall`, `cursor: pointer`
- **Container (hover):** `boxShadow: elevationRaised`, `borderColor: neutral3`
- **Container (arrastando):** `opacity: 0.5`, `boxShadow: elevationDropdown`
- **Título:** `fontSize: fontSizeMedium`, `fontWeight: fontWeightMedium`, `color: textDefault`, `marginBottom: spacingXXXSmall`, linha única com reticências
- **Subtítulo:** `fontSize: fontSizeSmall`, `color: textPlaceholder`, linha única com reticências
- **Valor:** `fontSize: fontSizeMedium`, `fontWeight: fontWeightBold`, `color: textDefault`, `marginTop: spacingXXSmall`
- **Data:** `fontSize: fontSizeXSmall`, `color: textPlaceholder`
- **Linha de tags:** `display: flex`, `gap: spacingXXXSmall`, `marginTop: spacingXSmall`, `flexWrap: wrap`
- **Avatar:** círculo 20px, posicionado no canto inferior direito do card

---

### Popover

> Referência SLDS 2: [Popover](https://v1.lightningdesignsystem.com/components/popovers/) (usado por GlobalSearch e NotificationPanel)

**Arquivo:** `src/components/Popover/Popover.tsx`

Um container de conteúdo flutuante genérico que ancora a um elemento trigger.

```tsx
type PopoverPlacement = 'bottom-start' | 'bottom-end' | 'bottom-center' | 'top-start' | 'top-end' | 'top-center';

type PopoverProps = {
  open: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement>;
  placement?: PopoverPlacement;
  width?: number | string;
  maxHeight?: number | string;
  children: React.ReactNode;
  closeOnOutsideClick?: boolean;
  closeOnEscape?: boolean;
  'aria-label'?: string;
};
```

**Especificação visual:**

- **Container:** `position: fixed` (calculado a partir da posição do anchor), `backgroundColor: neutral0`, `borderRadius: radiusMedium`, `boxShadow: elevationDropdown`, `border: 1px solid neutral2`, `zIndex: zIndexDropdown`, `overflow: hidden`
- **Animação:** Fade in + slide a partir da direção do anchor, `durationPromptly`
- **Nub/Seta (opcional):** Triângulo CSS de 8px apontando para o anchor

**Comportamentos:**

- Posicionado relativo ao elemento anchor usando `getBoundingClientRect()`
- Recalcula posição ao scroll/resize (via `ResizeObserver` + listener de scroll)
- Clique fora fecha (padrão)
- Escape fecha (padrão)
- Foco é preso dentro do popover quando aberto
- `role="dialog"`, `aria-modal="false"` (popover não-modal)

---

### DropdownMenu

> Referência SLDS 2: [Menu](https://www.lightningdesignsystem.com/components/menu/)

**Arquivo:** `src/components/DropdownMenu/DropdownMenu.tsx`

Um menu de contexto ou dropdown de ações, usado para alternador de visualização, ações de filtro, etc.

```tsx
type MenuItemData = {
  id: string;
  label: string;
  icon?: IconName;
  disabled?: boolean;
  destructive?: boolean;
  divider?: boolean;           // renderizar divisor antes deste item
  onClick?: () => void;
};

type DropdownMenuProps = {
  open: boolean;
  onClose: () => void;
  items: MenuItemData[];
  anchorRef: React.RefObject<HTMLElement>;
  placement?: PopoverPlacement;
  width?: number;
  'aria-label'?: string;
};
```

**Especificação visual:**

- **Container:** Tipo popover, `minWidth: 180px`, `maxWidth: 320px`, `padding: spacingXXXSmall 0`, `backgroundColor: neutral0`, `borderRadius: radiusMedium`, `boxShadow: elevationDropdown`, `border: 1px solid neutral2`
- **Item do menu:** `padding: spacingXSmall spacingMedium`, `display: flex`, `alignItems: center`, `gap: spacingSmall`, `fontSize: fontSizeMedium`, `color: textDefault`, `cursor: pointer`
- **Item do menu (hover/foco):** `backgroundColor: neutral1`
- **Item do menu (destrutivo):** `color: error`
- **Item do menu (desabilitado):** `color: textDisabled`, `cursor: not-allowed`
- **Divisor:** `height: 1px`, `backgroundColor: neutral2`, `margin: spacingXXXSmall 0`
- **Ícone:** 16px, `color: textPlaceholder`

**Comportamentos:**

- Setas `↑`/`↓` navegam os itens, retornando ao início/fim
- `Enter`/`Espaço` seleciona o item focado
- `Escape` fecha o menu
- `role="menu"`, itens têm `role="menuitem"`
- Foco move para dentro do menu ao abrir; restaurado ao trigger ao fechar

---

### Pill

> Referência SLDS 2: [Pills](https://www.lightningdesignsystem.com/components/pills/)

**Arquivo:** `src/components/Pill/Pill.tsx`

Uma tag/label removível usada em filtros de busca, itens selecionados.

```tsx
type PillProps = {
  label: string;
  icon?: IconName;
  avatarName?: string;                // exibir avatar ao invés de ícone
  onRemove?: () => void;
  disabled?: boolean;
  variant?: 'default' | 'brand' | 'error';
};
```

**Especificação visual:**

- **Container:** `display: inline-flex`, `alignItems: center`, `gap: spacingXXXSmall`, `padding: 2px spacingXSmall 2px spacingXXXSmall`, `borderRadius: radiusPill`, `border: 1px solid neutral3`, `backgroundColor: neutral0`, `fontSize: fontSizeSmall`, `lineHeight: '1.5'`
- **Container (brand):** `border: 1px solid brandPrimary`, `backgroundColor: brandPrimaryLight`
- **Ícone/Avatar:** 16px, alinhado à esquerda
- **Label:** `color: textDefault`, `whiteSpace: nowrap`
- **Botão remover:** ícone fechar 16px, `color: textPlaceholder`, `cursor: pointer`, hover: `color: textDefault`
- **Desabilitado:** `opacity: 0.5`, sem botão remover

---

## Novos Ícones

Os seguintes ícones devem ser adicionados a `src/components/Icon/Icon.tsx`:

| Nome do Ícone | Uso | Descrição do Path |
|---------------|-----|-------------------|
| `bell` | Trigger de notificações | Contorno de sino |
| `bell-filled` | Notificações ativas | Sino preenchido |
| `command` | Trigger do menu de comandos | Símbolo ⌘ |
| `keyboard` | Dicas de atalho | Contorno de teclado |
| `kanban` | Alternador de visualização | Colunas verticais |
| `calendar-view` | Alternador de visualização | Grid de calendário |
| `list-view` | Alternador de visualização | Linhas horizontais |
| `grip-vertical` | Handle de arraste para kanban | 6 pontos (grip) |
| `globe` | Busca global | Contorno de globo |
| `notification` | Tipos de notificação | Sino com círculo |
| `arrow-right` | Setas de navegação | Seta para direita |
| `eye` | Marcar como lida | Contorno de olho |
| `eye-off` | Marcar como não lida | Olho com risco |

---

## Novos Hooks

### useCommandMenu

**Arquivo:** `src/hooks/useCommandMenu.ts`

Gerencia o estado do menu de comandos: abrir/fechar, filtragem de busca, navegação de itens e execução de comandos.

```tsx
type UseCommandMenuReturn = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  groups: CommandGroup[];
  activeIndex: number;
  setActiveIndex: (i: number) => void;
  selectActive: () => void;
  loading: boolean;
};
```

**Notas de implementação:**

- Comandos estáticos são definidos no hook: Navegar (Dashboard, Contatos, Empresas, Oportunidades, Configurações), Criar (Novo Contato, Nova Empresa, Nova Oportunidade)
- Quando `searchQuery` não está vazia e excede 2 caracteres, o hook dispara uma busca GraphQL multi-objeto em people, companies e opportunities (debounce 300ms)
- Resultados são agrupados por tipo: "Navegação", "Ações", "Pessoas", "Empresas", "Oportunidades"
- O hook gerencia o índice de navegação por teclado, retornando aos limites da lista
- Usa `useKeyboardShortcut` para registrar Ctrl+K / ⌘K globalmente

### useGlobalSearch

**Arquivo:** `src/hooks/useGlobalSearch.ts`

Fornece resultados rápidos de busca multi-objeto para o componente GlobalSearch da barra superior.

```tsx
type UseGlobalSearchReturn = {
  query: string;
  setQuery: (q: string) => void;
  results: SearchResult[];
  loading: boolean;
  hasResults: boolean;
};
```

**Notas de implementação:**

- Usa `gqlWorkspace` para buscar em `people`, `companies`, `opportunities`
- Filtro de busca: `{ or: [{ name: { like: "%query%" } }, ...] }`
- Limite: 3 resultados por tipo de objeto, máx 9 total
- Debounce em 300ms
- Limpa resultados quando a query está vazia

### useNotifications

**Arquivo:** `src/hooks/useNotifications.ts`

Busca e gerencia notificações do backend via polling.

```tsx
type UseNotificationsReturn = {
  notifications: NotificationData[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  refresh: () => void;
};
```

**Notas de implementação:**

- Faz polling no endpoint `/metadata` a cada 30 segundos com uma query `getNotifications`
- Faz fallback para dados mock locais se o backend ainda não suporta notificações (degradação graciosa)
- `markAsRead` e `markAllAsRead` atualizam o estado otimisticamente e chamam mutation se disponível
- Notificações são ordenadas por timestamp decrescente (mais recentes primeiro)
- Máximo de 50 notificações retidas (cortadas das mais antigas)

### useCalendarEvents

**Arquivo:** `src/hooks/useCalendarEvents.ts`

Busca eventos de calendário para um determinado mês.

```tsx
type UseCalendarEventsReturn = {
  events: CalendarEventData[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
};
```

**Notas de implementação:**

- Consulta `calendarEvents` para o intervalo do mês fornecido usando GraphQL de workspace
- Faz fallback para consultar `opportunities` com `closeDate` no intervalo do mês fornecido (visto que datas de fechamento de oportunidades são o conteúdo principal de calendário para um CRM)
- Mapeia dados de oportunidade para `CalendarEventData`: title = nome da oportunidade, date = closeDate, variant baseado no estágio
- Mescla eventos reais de calendário + datas de fechamento de oportunidades
- Re-busca quando ano/mês muda

### useKanbanBoard

**Arquivo:** `src/hooks/useKanbanBoard.ts`

Busca e gerencia dados do quadro kanban para oportunidades agrupadas por estágio.

```tsx
type UseKanbanBoardReturn = {
  columns: KanbanColumnData<OpportunityRecord>[];
  loading: boolean;
  error: string | null;
  moveCard: (recordId: string, fromColumnId: string, toColumnId: string, position: number) => void;
  refresh: () => void;
};

type OpportunityRecord = {
  id: string;
  name: string;
  amount?: number;
  closeDate?: string;
  stage: string;
  company?: { id: string; name: string };
  contact?: { id: string; name: string };
};
```

**Notas de implementação:**

- Busca todas as oportunidades com `gqlWorkspace` usando paginação relay (busca todas as páginas)
- Agrupa registros pelo valor do campo `stage`
- Ordem predefinida de colunas: `['LEAD', 'QUALIFICATION', 'MEETING', 'PROPOSAL', 'CLOSED_WON', 'CLOSED_LOST']`
- Cada coluna calcula agregado: `SUM(amount)` para estágios ganhos, `COUNT` para os demais
- `moveCard` chama mutation `updateOpportunity` para mudar o campo `stage`
- Atualiza o estado local otimisticamente antes da mutation completar
- Em caso de falha na mutation, reverte para o estado anterior e exibe toast de erro

### useKeyboardShortcut

**Arquivo:** `src/hooks/useKeyboardShortcut.ts`

Um hook utilitário para registrar atalhos de teclado globais.

```tsx
type UseKeyboardShortcutOptions = {
  key: string;                   // ex: 'k'
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  enabled?: boolean;
  preventDefault?: boolean;
};

const useKeyboardShortcut = (
  options: UseKeyboardShortcutOptions,
  callback: () => void,
) => void;
```

**Notas de implementação:**

- Anexa listener `keydown` ao `document`
- Verifica se as teclas modificadoras (Ctrl/Meta, Shift, Alt) correspondem
- Para `ctrlKey`, também faz match com `metaKey` e vice-versa (Ctrl+K / ⌘K cross-platform)
- Chama `preventDefault()` no match para evitar comportamento padrão do navegador
- Limpa listener ao desmontar
- Pode ser desabilitado via flag `enabled`

---

## Páginas

### CalendarPage

**Arquivo:** `src/pages/CalendarPage.tsx`

Exibe uma visualização de calendário mensal com datas de fechamento de oportunidades e eventos de calendário.

**Estrutura:**
```
PageHeader
  title="Calendário"
  actions=[Hoje, Anterior, Próximo]
CalendarGrid
  year={anoAtual}
  month={mesAtual}
  events={eventos do useCalendarEvents}
```

**Funcionalidades:**
- Navegação por mês com botões Anterior/Próximo e botão "Hoje"
- Eventos originados de oportunidades (datas de fechamento) + eventos de calendário
- Clicar em um evento navega para a página de detalhe da oportunidade/evento
- Clicar em um dia sem eventos abre o formulário de criação de oportunidade com aquela data pré-preenchida
- Estado de carregamento exibe overlay com Spinner

---

### KanbanDealsPage

**Arquivo:** `src/pages/KanbanDealsPage.tsx`

Exibe oportunidades em um quadro Kanban agrupadas por estágio do pipeline.

**Estrutura:**
```
PageHeader
  title="Pipeline de Oportunidades"
  actions=[Botão Nova Oportunidade, Alternador de Visualização (Lista | Kanban | Calendário)]
KanbanBoard
  columns={colunas do useKanbanBoard}
  renderCard={KanbanDealCard}
  onCardMove={moveCard}
```

**KanbanDealCard (inline):**
Exibe: nome da oportunidade, nome da empresa (subtítulo), valor formatado, data de fechamento, badge de estágio

**Funcionalidades:**
- Grupo de botões alternador de visualização: Lista (DealsListPage atual), Kanban, Calendário
- Arrastar-e-soltar para mudar estágio da oportunidade
- Clicar no card navega para página de detalhe da oportunidade
- "+" na coluna cria nova oportunidade com aquele estágio pré-selecionado
- Agregado exibe valor total por coluna (formatado como moeda)
- Colunas de `CLOSED_WON` têm destaque verde no cabeçalho; `CLOSED_LOST` têm cinza/vermelho

---

## Queries e Mutations GraphQL

### Busca Multi-Objeto (para CommandMenu e GlobalSearch)

```graphql
# Buscar Pessoas
query SearchPeople($filter: PersonFilterInput, $first: Int) {
  people(filter: $filter, first: $first) {
    edges {
      node {
        id
        name { firstName lastName }
        email
        city
      }
    }
  }
}

# Buscar Empresas
query SearchCompanies($filter: CompanyFilterInput, $first: Int) {
  companies(filter: $filter, first: $first) {
    edges {
      node {
        id
        name
        domainName
      }
    }
  }
}

# Buscar Oportunidades
query SearchOpportunities($filter: OpportunityFilterInput, $first: Int) {
  opportunities(filter: $filter, first: $first) {
    edges {
      node {
        id
        name
        amount
        stage
      }
    }
  }
}
```

### Eventos de Calendário

```graphql
query CalendarEventsForMonth($filter: CalendarEventFilterInput, $first: Int) {
  calendarEvents(filter: $filter, first: $first) {
    edges {
      node {
        id
        title
        startsAt
        endsAt
        isFullDay
        description
      }
    }
  }
}
```

Fallback — Oportunidades por data de fechamento:

```graphql
query OpportunitiesByCloseDate($filter: OpportunityFilterInput) {
  opportunities(filter: $filter, first: 100) {
    edges {
      node {
        id
        name
        amount
        closeDate
        stage
        company { id name }
      }
    }
  }
}
```

### Kanban — Atualizar Estágio

Reutiliza o padrão de mutation do hook `useRecordUpdate` existente:

```graphql
mutation UpdateOpportunityStage($idToUpdate: ID!, $input: OpportunityUpdateInput!) {
  updateOpportunity(id: $idToUpdate, data: $input) {
    id
    stage
  }
}
```

### Notificações

```graphql
# Se o backend suportar notificações:
query GetNotifications($first: Int) {
  notifications(first: $first, orderBy: { createdAt: DESC }) {
    edges {
      node {
        id
        type
        title
        message
        createdAt
        read
        link
        actor {
          name
          avatarUrl
        }
      }
    }
  }
}

mutation MarkNotificationAsRead($id: ID!) {
  markNotificationAsRead(id: $id) {
    id
    read
  }
}

mutation MarkAllNotificationsAsRead {
  markAllNotificationsAsRead
}
```

> **Nota:** Se o backend do Twenty ainda não expor uma API de notificações, o hook `useNotifications` fará fallback para dados mock locais e o componente será renderizado em "modo demo" com notificações de placeholder. Isso permite que a UI seja entregue imediatamente enquanto o suporte do backend é desenvolvido.

---

## Alterações de Roteamento

### Novas Rotas

| Caminho | Página | Descrição |
|---------|--------|-----------|
| `/calendar` | `CalendarPage` | Visualização de calendário mensal |
| `/deals/kanban` | `KanbanDealsPage` | Visualização kanban do pipeline |

### Sidebar do Shell Atualizada

Adicionar novos itens à navegação da sidebar:

```tsx
const sidebarSections = [
  {
    label: 'Principal',
    items: [
      { id: 'dashboard', label: 'Dashboard', href: '#/', icon: '⊞' },
      { id: 'contacts', label: 'Contatos', href: '#/contacts', icon: '👥' },
      { id: 'companies', label: 'Empresas', href: '#/companies', icon: '🏢' },
      { id: 'deals', label: 'Oportunidades', href: '#/deals', icon: '💼' },
      { id: 'calendar', label: 'Calendário', href: '#/calendar', icon: '📅' },
    ],
  },
  // ...
];
```

A visualização Kanban é acessada a partir da página de Oportunidades via um alternador de visualização, não um item separado na sidebar.

---

## Adições de Design Tokens

### Novos Tokens de Cor (em tokens.ts)

```typescript
// Cores de estágio do Kanban
colorTokens.stageLeadBg = 'var(--eds-g-color-neutral-base-10, #e5e5e5)';
colorTokens.stageQualificationBg = 'var(--eds-g-color-info-container, #d8edff)';
colorTokens.stageMeetingBg = 'var(--eds-g-color-warning-container, #fdefc8)';
colorTokens.stageProposalBg = 'var(--eds-g-color-brand-base-10, #e5f2ff)';
colorTokens.stageWonBg = 'var(--eds-g-color-success-container, #cdefc4)';
colorTokens.stageLostBg = 'var(--eds-g-color-error-container, #fddde3)';
```

### Novas CSS Custom Properties (em global.css)

```css
/* Fase 4 — Cores de estágio */
--eds-g-color-stage-lead: #706e6b;
--eds-g-color-stage-qualification: #0176d3;
--eds-g-color-stage-meeting: #dd7a01;
--eds-g-color-stage-proposal: #032d60;
--eds-g-color-stage-won: #2e844a;
--eds-g-color-stage-lost: #ba0517;

/* Backdrop do menu de comandos */
--eds-g-color-backdrop: rgba(0, 0, 0, 0.5);
```

---

## Integração com o Shell

O componente Shell (`src/components/Layout/Shell.tsx`) precisa das seguintes atualizações:

### Adições na Barra Superior

1. **Componente GlobalSearch** — Substitui/complementa a área existente de nome do app com um input de busca
2. **Ícone de sino de notificações** — Adicionado ao lado direito da barra superior, antes do nome do usuário

```
┌─────────────────────────────────────────────────────────┐
│ Logo/NomeApp   [🔍 Buscar... ⌘K]       🔔(3)  Usuário │
└─────────────────────────────────────────────────────────┘
```

### Integração do CommandMenu

O `CommandMenu` é renderizado no nível do App (em `App.tsx`), fora do Shell, para que faça overlay em tudo. O hook `useCommandMenu` gerencia o estado de abrir/fechar globalmente.

---

## Checklist de Acessibilidade

### Command Menu
- [ ] `role="dialog"`, `aria-modal="true"`, `aria-label="Menu de comandos"`
- [ ] Foco automático no input de busca ao abrir
- [ ] `↑`/`↓` navegam itens, `Enter` seleciona, `Escape` fecha
- [ ] Foco retorna ao elemento anterior ao fechar
- [ ] `aria-activedescendant` no input referencia o item focado
- [ ] Cada item tem `role="option"` dentro de `role="listbox"`
- [ ] Estado de carregamento anunciado com `aria-live="polite"`

### Painel de Notificações
- [ ] Botão trigger tem `aria-label="Notificações"` e `aria-expanded`
- [ ] Painel tem `role="dialog"`, `aria-label="Notificações"`
- [ ] Contagem de não lidas anunciada no `aria-label` do trigger
- [ ] Cada notificação é focalizável e tem `role="article"`
- [ ] "Marcar todas como lidas" é acessível por teclado
- [ ] Escape fecha o painel

### Grid de Calendário
- [ ] `role="grid"`, `aria-label="Calendário, {Mês} {Ano}"`
- [ ] Cabeçalhos dos dias da semana têm `role="columnheader"`
- [ ] Células dos dias têm `role="gridcell"`, `aria-label="{Data completa}"`
- [ ] Data ativa tem `tabIndex={0}`, as demais `tabIndex={-1}`
- [ ] Setas navegam dias/semanas, PageUp/PageDown mudam meses
- [ ] Célula de hoje tem `aria-current="date"`
- [ ] Eventos dentro das células são acessíveis via Tab

### Quadro Kanban
- [ ] Quadro tem `role="region"`, `aria-label="Quadro de pipeline"`
- [ ] Cada coluna tem `role="list"`, `aria-label="{Nome do estágio}"`
- [ ] Cards têm `role="listitem"`, `aria-roledescription="arrastável"`
- [ ] Instruções de arraste anunciadas: "Pressione Espaço para pegar, setas para mover"
- [ ] Soltar anunciado: "Movido para {coluna}, posição {n}"
- [ ] Gerenciamento de foco: foco segue o card movido

### Busca Global
- [ ] `role="combobox"`, `aria-expanded`, `aria-controls` a lista de resultados
- [ ] Lista de resultados tem `role="listbox"`, itens têm `role="option"`
- [ ] `aria-activedescendant` rastreia resultado focado
- [ ] Leitor de tela anuncia atualizações na contagem de resultados

---

## Resumo da Estrutura de Arquivos

```
packages/twenty-eds/src/
├── components/
│   ├── CommandMenu/
│   │   ├── CommandMenu.tsx
│   │   └── index.ts
│   ├── GlobalSearch/
│   │   ├── GlobalSearch.tsx
│   │   └── index.ts
│   ├── NotificationPanel/
│   │   ├── NotificationPanel.tsx
│   │   ├── NotificationItem.tsx
│   │   └── index.ts
│   ├── CalendarGrid/
│   │   ├── CalendarGrid.tsx
│   │   ├── CalendarEvent.tsx
│   │   └── index.ts
│   ├── KanbanBoard/
│   │   ├── KanbanBoard.tsx
│   │   ├── KanbanCard.tsx
│   │   └── index.ts
│   ├── Popover/
│   │   ├── Popover.tsx
│   │   └── index.ts
│   ├── DropdownMenu/
│   │   ├── DropdownMenu.tsx
│   │   └── index.ts
│   ├── Pill/
│   │   ├── Pill.tsx
│   │   └── index.ts
│   └── index.ts              (atualizado com exports da Fase 4)
├── hooks/
│   ├── useCommandMenu.ts
│   ├── useGlobalSearch.ts
│   ├── useNotifications.ts
│   ├── useCalendarEvents.ts
│   ├── useKanbanBoard.ts
│   └── useKeyboardShortcut.ts
├── pages/
│   ├── CalendarPage.tsx
│   └── KanbanDealsPage.tsx
└── AppRouter.tsx              (atualizado com novas rotas)
```

---

## Definição de Pronto

Uma funcionalidade é considerada pronta quando:

1. Todos os componentes renderizam corretamente com design tokens EDS (sem valores hardcoded)
2. Navegação por teclado funciona conforme especificado para cada componente
3. Atributos ARIA estão definidos corretamente e leitor de tela anuncia mudanças de estado
4. O CommandMenu abre com Ctrl+K / ⌘K e busca em todos os tipos de registro
5. O NotificationPanel exibe notificações (dados mock se backend não estiver pronto)
6. O CalendarGrid exibe datas de fechamento de oportunidades para o mês atual
7. O KanbanBoard exibe oportunidades agrupadas por estágio com arrastar-e-soltar
8. Novas páginas são acessíveis via roteamento e navegação da sidebar
9. Nenhuma dependência externa de CSS-in-JS adicionada (inline styles + tokens + utility CSS apenas)
10. Responsivo: funciona em tablet (768px+) e desktop (1280px+)
11. Todas as páginas e funcionalidades existentes continuam funcionando (sem regressões)
