# EDS Phase 4 — Navigation & Productivity: Design & Implementation Plan

This document specifies the components, behaviors, tokens, and page structure for Phase 4 of the EDS migration (Navigation & Productivity). All designs follow [SLDS 2](https://www.lightningdesignsystem.com/) principles adapted for React, using EDS design tokens (`--eds-g-*`).

---

## Table of Contents

1. [Scope](#scope)
2. [New Components](#new-components)
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
3. [New Icons](#new-icons)
4. [New Hooks](#new-hooks)
   - [useCommandMenu](#usecommandmenu)
   - [useGlobalSearch](#useglobalsearch)
   - [useNotifications](#usenotifications)
   - [useCalendarEvents](#usecalendarevents)
   - [useKanbanBoard](#usekanbanboard)
   - [useKeyboardShortcut](#usekeyboardshortcut)
5. [Pages](#pages)
   - [CalendarPage](#calendarpage)
   - [KanbanDealsPage](#kanbandealspage)
6. [GraphQL Queries & Mutations](#graphql-queries--mutations)
7. [Routing Changes](#routing-changes)
8. [Design Token Additions](#design-token-additions)
9. [Shell Integration](#shell-integration)
10. [Accessibility Checklist](#accessibility-checklist)
11. [File Structure Summary](#file-structure-summary)
12. [Definition of Done](#definition-of-done)

---

## Scope

Phase 4 delivers **Navigation & Productivity** features:

- **Command Menu**: A keyboard-driven command palette (Ctrl+K / ⌘K) for fast navigation, record search, and action execution
- **Global Search**: A persistent search input in the top navigation bar that searches across all record types (contacts, companies, deals)
- **Notifications Panel**: A popover panel in the top bar showing system notifications (record changes, mentions, reminders)
- **Calendar View**: A monthly calendar grid displaying calendar events and deal close dates
- **Kanban View**: A drag-and-drop board for managing deals/opportunities by pipeline stage

These features enhance navigation speed, discoverability, and visual pipeline management.

---

## New Components

### CommandMenu

> SLDS 2 reference: [Combobox](https://www.lightningdesignsystem.com/components/combobox/) (adapted as command palette overlay)

**File:** `src/components/CommandMenu/CommandMenu.tsx`

A modal overlay triggered by Ctrl+K / ⌘K that provides fast navigation, record search, and action shortcuts.

```tsx
type CommandType = 'navigate' | 'create' | 'action' | 'record';

type CommandItem = {
  id: string;
  label: string;
  description?: string;
  type: CommandType;
  icon?: IconName;
  shortcut?: string[];        // e.g. ['⌘', 'N'] for display
  href?: string;              // for navigate commands
  onClick?: () => void;       // for action commands
  objectType?: string;        // for record items (person, company, opportunity)
  keywords?: string[];        // additional search terms
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

**Anatomy:**

| # | Element | Description |
|---|---------|-------------|
| 1 | Backdrop | Semi-transparent overlay, covers entire viewport |
| 2 | Container | Centered modal panel, `maxWidth: 640px`, `maxHeight: 480px` |
| 3 | Search Input | Auto-focused input with search icon, full width |
| 4 | Group Headers | Category labels (Navigation, Actions, Recent Records, Search Results) |
| 5 | Command Items | Selectable rows: icon + label + description + shortcut badge |
| 6 | Active Indicator | Background highlight on keyboard-focused item |
| 7 | Footer | Hint line: "↑↓ to navigate · Enter to select · Esc to close" |

**Visual spec:**

- **Backdrop:** `backgroundColor: rgba(0,0,0,0.5)`, `zIndex: zIndexModal`
- **Container:** `backgroundColor: neutral0`, `borderRadius: radiusLarge`, `boxShadow: elevationModal`, `overflow: hidden`, `border: 1px solid neutral2`
- **Search input:** `height: 48px`, `padding: 0 spacingMedium`, `fontSize: fontSizeBase`, `border: none`, `borderBottom: 1px solid neutral2`, `backgroundColor: neutral0`, no outline
- **Search icon:** 16px, `color: textPlaceholder`, left of input
- **Group header:** `padding: spacingXXSmall spacingMedium`, `fontSize: fontSizeSmall`, `fontWeight: fontWeightMedium`, `color: textPlaceholder`, `textTransform: uppercase`, `letterSpacing: 0.05em`, `backgroundColor: neutral1`
- **Command item (default):** `padding: spacingXSmall spacingMedium`, `display: flex`, `alignItems: center`, `gap: spacingSmall`, `cursor: pointer`
- **Command item (active/hover):** `backgroundColor: brandPrimaryLight`, `color: textDefault`
- **Item icon:** 16px, `color: textPlaceholder`, active: `color: brandPrimary`
- **Item label:** `fontSize: fontSizeMedium`, `fontWeight: fontWeightRegular`, `color: textDefault`
- **Item description:** `fontSize: fontSizeSmall`, `color: textPlaceholder`, `marginLeft: auto`
- **Shortcut badge:** `display: inline-flex`, `gap: 2px`, each key in `padding: 1px 6px`, `backgroundColor: neutral1`, `border: 1px solid neutral2`, `borderRadius: radiusSmall`, `fontSize: fontSizeXSmall`, `fontWeight: fontWeightMedium`, `color: textLabel`
- **Footer:** `padding: spacingXXSmall spacingMedium`, `borderTop: 1px solid neutral2`, `fontSize: fontSizeXSmall`, `color: textPlaceholder`, `backgroundColor: neutral1`
- **Empty state:** Centered text "No results found", `color: textPlaceholder`, `padding: spacingLarge`
- **Loading:** Small spinner centered below search input

**Behaviors:**

- Opens on `Ctrl+K` (Windows/Linux) or `⌘K` (macOS), or when trigger button in top bar is clicked
- Search input is auto-focused on open
- Typing filters command items by label, description, and keywords (case-insensitive)
- `↑`/`↓` arrow keys navigate between items; active item scrolls into view
- `Enter` selects the active item (triggers navigation or action)
- `Escape` closes the menu; focus returns to previous element
- Clicking backdrop closes the menu
- Groups with zero matching items are hidden
- When search is non-empty and no static commands match, a live search is triggered against the GraphQL API (debounced 300ms)
- Record results show the object type icon and record name
- Max 5 items per group in search results to prevent overwhelm
- `aria-role="dialog"`, `aria-modal="true"`, `aria-label="Command menu"`

---

### GlobalSearch

> SLDS 2 reference: [Input — Search type](https://www.lightningdesignsystem.com/components/input/)

**File:** `src/components/GlobalSearch/GlobalSearch.tsx`

A persistent search input embedded in the Shell top bar that provides quick access to the full CommandMenu or shows inline quick results.

```tsx
type SearchResult = {
  id: string;
  label: string;
  objectType: string;         // 'person' | 'company' | 'opportunity'
  icon: IconName;
  href: string;
};

type GlobalSearchProps = {
  onOpenCommandMenu: () => void;    // Opens full command menu
  placeholder?: string;
};
```

**Anatomy:**

| # | Element | Description |
|---|---------|-------------|
| 1 | Search Container | Compact input wrapper in top bar |
| 2 | Search Icon | Left-aligned search icon |
| 3 | Input | Text input with placeholder |
| 4 | Shortcut Hint | "⌘K" hint badge on the right side of input |
| 5 | Results Dropdown | Quick results popover (max 8 items, grouped by type) |

**Visual spec:**

- **Container:** `width: 280px`, `height: 32px`, `display: flex`, `alignItems: center`, `backgroundColor: rgba(255,255,255,0.1)`, `borderRadius: radiusMedium`, `padding: 0 spacingSmall`, `border: 1px solid transparent`, `transition: all durationPromptly`
- **Container (focus):** `backgroundColor: neutral0`, `border: 1px solid borderFocus`, `width: 360px`
- **Search icon:** 14px, `color: neutral4` (unfocused), `color: textPlaceholder` (focused)
- **Input:** `background: none`, `border: none`, `outline: none`, `color: textInverse` (unfocused), `color: textDefault` (focused), `fontSize: fontSizeSmall`, `flex: 1`
- **Shortcut hint:** Uses same style as CommandMenu shortcut badge, visible when input is empty
- **Results dropdown:** Like CommandMenu container but smaller, `maxWidth: 400px`, `position: absolute`, `top: calc(100% + 4px)`, `right: 0`, `boxShadow: elevationDropdown`, `zIndex: zIndexDropdown`

**Behaviors:**

- Clicking the search bar or pressing the shortcut opens the value in the full CommandMenu
- On focus, the input expands from 280px to 360px with transition
- Typing shows a quick results dropdown (debounced 300ms)
- Each result shows icon + label + object type badge
- Clicking a result navigates to the record detail page
- Pressing `Enter` with text opens the CommandMenu with the search pre-filled
- Pressing `Escape` or blur closes the dropdown and resets width
- On mobile/narrow viewports, the search input collapses to just the icon, expanding on click

---

### NotificationPanel

> SLDS 2 reference: adapted from [Popover](https://v1.lightningdesignsystem.com/components/popovers/) + notification list pattern

**File:** `src/components/NotificationPanel/NotificationPanel.tsx`

A popover panel attached to a bell icon in the top bar that shows system notifications.

```tsx
type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'mention' | 'reminder';

type NotificationData = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;           // ISO 8601
  read: boolean;
  href?: string;               // link to related record
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

**Anatomy:**

| # | Element | Description |
|---|---------|-------------|
| 1 | Trigger (Bell icon) | In top bar, shows unread badge |
| 2 | Panel container | Popover, anchored below bell icon |
| 3 | Header | "Notifications" title + "Mark all read" link |
| 4 | Notification list | Scrollable list of NotificationItem |
| 5 | Empty state | "No notifications" message when list is empty |
| 6 | Footer | Optional "View all" link |

**Visual spec:**

- **Trigger (bell icon):** `position: relative`, 20px icon, `color: neutral3`
- **Unread badge:** `position: absolute`, `top: -4px`, `right: -4px`, `width: 16px`, `height: 16px`, `borderRadius: radiusCircle`, `backgroundColor: error`, `color: textInverse`, `fontSize: fontSizeXSmall`, `fontWeight: fontWeightBold`, `display: flex`, `alignItems: center`, `justifyContent: center`. If count > 9, show "9+"
- **Panel container:** `position: absolute`, `top: calc(100% + 8px)`, `right: 0`, `width: 380px`, `maxHeight: 480px`, `backgroundColor: neutral0`, `borderRadius: radiusMedium`, `boxShadow: elevationDropdown`, `border: 1px solid neutral2`, `overflow: hidden`, `zIndex: zIndexDropdown`
- **Header:** `padding: spacingSmall spacingMedium`, `borderBottom: 1px solid neutral2`, `display: flex`, `justifyContent: space-between`, `alignItems: center`. Title: `fontSize: fontSizeMedium`, `fontWeight: fontWeightMedium`. "Mark all read": `fontSize: fontSizeSmall`, `color: textLink`, `cursor: pointer`
- **List area:** `maxHeight: 400px`, `overflowY: auto`
- **Empty state:** `padding: spacingXLarge`, centered, `color: textPlaceholder`, bell icon 32px

**Behaviors:**

- Clicking bell icon toggles panel open/closed
- Clicking outside the panel closes it
- Escape closes the panel
- Clicking a notification calls `onNotificationClick` and navigates to `href`
- "Mark all as read" calls `onMarkAllAsRead` and visually marks all notifications
- New notifications appear at the top of the list
- Unread notifications have a left blue accent border
- The panel auto-refreshes every 30 seconds (via hook polling)

---

### NotificationItem

**File:** `src/components/NotificationPanel/NotificationItem.tsx`

Individual notification row within the NotificationPanel.

```tsx
type NotificationItemProps = {
  notification: NotificationData;
  onClick: () => void;
  onMarkAsRead: () => void;
};
```

**Visual spec:**

- **Container:** `padding: spacingSmall spacingMedium`, `display: flex`, `gap: spacingSmall`, `cursor: pointer`, `borderBottom: 1px solid neutral1`, `transition: background durationQuickly`
- **Container (unread):** `borderLeft: 3px solid brandPrimary`, `backgroundColor: brandPrimaryLight` (at 30% opacity)
- **Container (hover):** `backgroundColor: neutral1`
- **Avatar/icon area:** 32px circle, left side. If actor has avatar, show it; otherwise show type icon with colored background
- **Content area:** `flex: 1`
- **Title:** `fontSize: fontSizeMedium`, `fontWeight: fontWeightMedium` (unread) or `fontWeightRegular` (read), `color: textDefault`, single line with ellipsis overflow
- **Message:** `fontSize: fontSizeSmall`, `color: textPlaceholder`, max 2 lines with ellipsis
- **Timestamp:** `fontSize: fontSizeXSmall`, `color: textPlaceholder`, relative time (e.g., "2m ago", "1h ago", "Yesterday")
- **Mark as read button:** Small dot icon or "•", visible on hover, `color: brandPrimary`

**Type-specific icon colors:**

| Type | Icon | Background |
|------|------|------------|
| info | `info` | `infoLight` |
| success | `success` | `successLight` |
| warning | `warning` | `warningLight` |
| error | `error-icon` | `errorLight` |
| mention | `user` | `brandPrimaryLight` |
| reminder | `clock` | `warningLight` |

---

### CalendarGrid

> SLDS 2 reference: [Datepicker](https://www.lightningdesignsystem.com/components/datepicker/) (extended as full-page calendar)

**File:** `src/components/CalendarGrid/CalendarGrid.tsx`

A monthly calendar grid for displaying events and date-based records.

```tsx
type CalendarEventData = {
  id: string;
  title: string;
  date: string;                // ISO 8601 date/datetime
  endDate?: string;            // for multi-day events
  color?: string;              // override dot/badge color
  variant?: 'default' | 'success' | 'warning' | 'error' | 'brand';
  onClick?: () => void;
};

type CalendarGridProps = {
  year: number;
  month: number;               // 0-indexed (0=January)
  events: CalendarEventData[];
  onMonthChange: (year: number, month: number) => void;
  onDateClick?: (date: string) => void;
  onEventClick?: (event: CalendarEventData) => void;
  loading?: boolean;
  todayLabel?: string;
  locale?: string;             // default 'en-US'
};
```

**Anatomy:**

| # | Element | Description |
|---|---------|-------------|
| 1 | Header | Month/Year title, Prev/Next/Today buttons |
| 2 | Weekday Row | Sun–Sat column headers |
| 3 | Day Grid | 6×7 grid of day cells |
| 4 | Day Cell | Date number + event dots/badges |
| 5 | Event Dot | Small colored dot per event (max 3 visible, "+N more" overflow) |
| 6 | Event Tooltip | On hover, shows event title and time |

**Visual spec:**

- **Header:** `display: flex`, `justifyContent: space-between`, `alignItems: center`, `padding: spacingSmall spacingMedium`, `marginBottom: spacingSmall`
- **Month title:** `fontSize: fontSizeXLarge`, `fontWeight: fontWeightBold`, `color: textDefault`
- **Nav buttons:** `Button` component, variant `ghost`, size `small`, with `chevron-left`/`chevron-right` icons
- **Today button:** `Button` component, variant `outline`, size `small`, label "Today"
- **Weekday row:** `display: grid`, `gridTemplateColumns: repeat(7, 1fr)`, `textAlign: center`, `padding: spacingXXSmall 0`, `fontSize: fontSizeSmall`, `fontWeight: fontWeightMedium`, `color: textPlaceholder`, `borderBottom: 1px solid neutral2`
- **Day grid:** `display: grid`, `gridTemplateColumns: repeat(7, 1fr)`, `gap: 0`, each cell `minHeight: 100px`
- **Day cell:** `padding: spacingXXSmall`, `border: 1px solid neutral1`, `cursor: pointer`, `position: relative`
- **Day cell (hover):** `backgroundColor: neutral1`
- **Day cell (today):** Date number has `backgroundColor: brandPrimary`, `color: textInverse`, `borderRadius: radiusCircle`, `width: 24px`, `height: 24px`, centered
- **Day cell (other month):** `color: textDisabled`, `backgroundColor: neutral1` at 50% opacity
- **Day cell (selected):** `outline: 2px solid brandPrimary`, `outlineOffset: -2px`
- **Date number:** `fontSize: fontSizeSmall`, `fontWeight: fontWeightRegular`, `color: textDefault`, `display: flex`, `justifyContent: center`, `width: 24px`, `height: 24px`, `lineHeight: 24px`, `marginBottom: spacingXXXSmall`
- **Event dot:** `width: 6px`, `height: 6px`, `borderRadius: radiusCircle`, inline, `marginRight: 2px`
- **Event badge (when ≤3):** `display: flex`, `alignItems: center`, `gap: 2px`, `fontSize: fontSizeXSmall`, `padding: 1px 4px`, `borderRadius: radiusSmall`, truncated text
- **"+N more":** `fontSize: fontSizeXSmall`, `color: textLink`, `cursor: pointer`

**Event dot variants:**

| Variant | Color |
|---------|-------|
| default | `neutral5` |
| brand | `brandPrimary` |
| success | `success` |
| warning | `warning` |
| error | `error` |

**Behaviors:**

- Prev/Next buttons change the displayed month
- "Today" button navigates to the current month and highlights today
- Clicking a day cell triggers `onDateClick` with the ISO date string
- Clicking an event dot/badge triggers `onEventClick`
- Hovering over an event shows a tooltip with title and time
- Days outside the current month are dimmed but still clickable
- Keyboard: `←`/`→` navigate days, `↑`/`↓` navigate weeks, `Home`/`End` first/last day of week, `PageUp`/`PageDown` change months
- The grid is aria-labeled as `role="grid"` with `aria-label="Calendar"`
- Each day cell is `role="gridcell"` with `aria-label="January 15, 2026"` (full date)
- The active/focused date has `tabIndex={0}`, all others `tabIndex={-1}`

---

### CalendarEvent

**File:** `src/components/CalendarGrid/CalendarEvent.tsx`

Small event indicator rendered inside a CalendarGrid day cell.

```tsx
type CalendarEventProps = {
  title: string;
  time?: string;                // e.g., "10:00 AM"
  variant?: 'default' | 'success' | 'warning' | 'error' | 'brand';
  onClick?: () => void;
  compact?: boolean;            // dot only (for small cells)
};
```

**Visual spec:**

- **Normal mode (compact=false):** `display: flex`, `alignItems: center`, `gap: 4px`, `padding: 1px 4px`, `borderRadius: radiusSmall`, `fontSize: fontSizeXSmall`, `cursor: pointer`, `whiteSpace: nowrap`, `overflow: hidden`, `textOverflow: ellipsis`
- **Background:** Each variant uses its light color with 20% opacity
- **Left dot:** `4px` circle with variant full color
- **Text:** `color: textDefault`, truncated
- **Compact mode (compact=true):** Just the 6px dot, no text
- **Hover:** `backgroundColor` at full light variant, tooltip appears

---

### KanbanBoard

> SLDS 2 reference: Adapted from [Cards](https://www.lightningdesignsystem.com/components/cards/) in a columnar layout (Kanban/Board pattern), leveraging SLDS 2 visual language

**File:** `src/components/KanbanBoard/KanbanBoard.tsx`

A horizontal scrollable board of columns, each representing a pipeline stage, with draggable cards.

```tsx
type KanbanColumnData<TRecord extends { id: string }> = {
  id: string;
  title: string;
  color?: string;               // accent color for column header
  records: TRecord[];
  aggregateValue?: string;      // e.g., "$45,000" sum
  aggregateLabel?: string;      // e.g., "Total"
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

**Anatomy:**

| # | Element | Description |
|---|---------|-------------|
| 1 | Board container | Horizontal scroll container |
| 2 | Columns | Vertical lists, one per stage |
| 3 | Column header | Stage name + count badge + aggregate |
| 4 | Column body | Scrollable list of cards |
| 5 | Cards | Individual deal/record cards |
| 6 | Drop indicator | Visual guide showing where a dragged card will land |
| 7 | Add button | "+" at bottom of each column |

**Visual spec:**

- **Board container:** `display: flex`, `gap: spacingSmall`, `overflowX: auto`, `padding: spacingSmall`, `height: 100%`, `alignItems: flex-start`
- **Column:** `width: 280px`, `minWidth: 280px`, `flexShrink: 0`, `backgroundColor: neutral1`, `borderRadius: radiusMedium`, `display: flex`, `flexDirection: column`, `maxHeight: 100%`
- **Column header:** `padding: spacingSmall spacingMedium`, `display: flex`, `alignItems: center`, `gap: spacingSmall`, `borderBottom: 2px solid` (column color or neutral3)
- **Column title:** `fontSize: fontSizeMedium`, `fontWeight: fontWeightMedium`, `color: textDefault`, `flex: 1`
- **Count badge:** `Badge` component, variant `default`, size `small`, showing record count
- **Aggregate line:** `fontSize: fontSizeSmall`, `color: textPlaceholder`, below title (e.g., "Total: $45,000")
- **Column body:** `padding: spacingXSmall`, `overflowY: auto`, `flex: 1`, `display: flex`, `flexDirection: column`, `gap: spacingXSmall`
- **Add button:** `width: 100%`, `padding: spacingXSmall`, `border: 1px dashed neutral3`, `borderRadius: radiusMedium`, `color: textPlaceholder`, `cursor: pointer`, `textAlign: center`, `fontSize: fontSizeSmall`
- **Add button (hover):** `backgroundColor: neutral0`, `borderColor: brandPrimary`, `color: brandPrimary`
- **Drop indicator:** `height: 2px`, `backgroundColor: brandPrimary`, `borderRadius: 1px`, `margin: spacingXXXSmall 0`, animated opacity

**Behaviors:**

- Drag a card by grabbing it (cursor changes to `grabbing`)
- While dragging, the dragged card has reduced opacity (0.5), and a 2px blue drop indicator appears between cards
- Dropping a card in a different column calls `onCardMove` with the new columnId and position
- Cards within a column can be reordered via drag
- Horizontal scroll via `overflowX: auto` or shift+scroll
- Each column body independently scrolls vertically
- Clicking the "+" button at column bottom calls `onAddClick(columnId)`
- Keyboard: Tab into a card, Space/Enter to "pick up", Arrow keys to move, Space/Enter to drop, Escape to cancel
- Screen reader: Cards announce their column and position (e.g., "Deal X, column Qualification, position 2 of 5")
- `role="list"` on column body, `role="listitem"` on each card
- Dragging implemented with native HTML5 Drag and Drop API (no external dependency)

---

### KanbanCard

**File:** `src/components/KanbanBoard/KanbanCard.tsx`

A card rendered within a KanbanBoard column. Used as the default render when no custom `renderCard` is provided, but also exported for use in custom renderers.

```tsx
type KanbanCardProps = {
  title: string;
  subtitle?: string;
  amount?: string;              // formatted currency
  date?: string;                // formatted date
  avatarName?: string;
  avatarUrl?: string;
  tags?: { label: string; variant: BadgeVariant }[];
  onClick?: () => void;
  draggable?: boolean;
  style?: React.CSSProperties;
};
```

**Visual spec:**

- **Container:** `backgroundColor: neutral0`, `borderRadius: radiusMedium`, `border: 1px solid neutral2`, `padding: spacingSmall`, `cursor: pointer`
- **Container (hover):** `boxShadow: elevationRaised`, `borderColor: neutral3`
- **Container (dragging):** `opacity: 0.5`, `boxShadow: elevationDropdown`
- **Title:** `fontSize: fontSizeMedium`, `fontWeight: fontWeightMedium`, `color: textDefault`, `marginBottom: spacingXXXSmall`, single line ellipsis
- **Subtitle:** `fontSize: fontSizeSmall`, `color: textPlaceholder`, single line ellipsis
- **Amount:** `fontSize: fontSizeMedium`, `fontWeight: fontWeightBold`, `color: textDefault`, `marginTop: spacingXXSmall`
- **Date:** `fontSize: fontSizeXSmall`, `color: textPlaceholder`
- **Tags row:** `display: flex`, `gap: spacingXXXSmall`, `marginTop: spacingXSmall`, `flexWrap: wrap`
- **Avatar:** 20px circle, positioned bottom-right of card

---

### Popover

> SLDS 2 reference: [Popover](https://v1.lightningdesignsystem.com/components/popovers/) (used by GlobalSearch and NotificationPanel)

**File:** `src/components/Popover/Popover.tsx`

A generic floating content container that anchors to a trigger element.

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

**Visual spec:**

- **Container:** `position: fixed` (calculated from anchor position), `backgroundColor: neutral0`, `borderRadius: radiusMedium`, `boxShadow: elevationDropdown`, `border: 1px solid neutral2`, `zIndex: zIndexDropdown`, `overflow: hidden`
- **Animation:** Fade in + slide from anchor direction, `durationPromptly`
- **Nub/Arrow (optional):** 8px CSS triangle pointing toward anchor

**Behaviors:**

- Positioned relative to the anchor element using `getBoundingClientRect()`
- Recalculates position on scroll/resize (via `ResizeObserver` + scroll listener)
- Click outside closes (default)
- Escape closes (default)
- Focus is trapped inside the popover when open
- `role="dialog"`, `aria-modal="false"` (non-modal popover)

---

### DropdownMenu

> SLDS 2 reference: [Menu](https://www.lightningdesignsystem.com/components/menu/)

**File:** `src/components/DropdownMenu/DropdownMenu.tsx`

A context menu or action dropdown, used for view switcher, filter actions, etc.

```tsx
type MenuItemData = {
  id: string;
  label: string;
  icon?: IconName;
  disabled?: boolean;
  destructive?: boolean;
  divider?: boolean;           // render divider before this item
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

**Visual spec:**

- **Container:** Popover-like, `minWidth: 180px`, `maxWidth: 320px`, `padding: spacingXXXSmall 0`, `backgroundColor: neutral0`, `borderRadius: radiusMedium`, `boxShadow: elevationDropdown`, `border: 1px solid neutral2`
- **Menu item:** `padding: spacingXSmall spacingMedium`, `display: flex`, `alignItems: center`, `gap: spacingSmall`, `fontSize: fontSizeMedium`, `color: textDefault`, `cursor: pointer`
- **Menu item (hover/focus):** `backgroundColor: neutral1`
- **Menu item (destructive):** `color: error`
- **Menu item (disabled):** `color: textDisabled`, `cursor: not-allowed`
- **Divider:** `height: 1px`, `backgroundColor: neutral2`, `margin: spacingXXXSmall 0`
- **Icon:** 16px, `color: textPlaceholder`

**Behaviors:**

- `↑`/`↓` arrow keys navigate items, wrapping at ends
- `Enter`/`Space` selects the focused item
- `Escape` closes the menu
- `role="menu"`, items have `role="menuitem"`
- Focus moves into menu on open; restored to trigger on close

---

### Pill

> SLDS 2 reference: [Pills](https://www.lightningdesignsystem.com/components/pills/)

**File:** `src/components/Pill/Pill.tsx`

A removable tag/label used in search filters, selected items.

```tsx
type PillProps = {
  label: string;
  icon?: IconName;
  avatarName?: string;                // show avatar instead of icon
  onRemove?: () => void;
  disabled?: boolean;
  variant?: 'default' | 'brand' | 'error';
};
```

**Visual spec:**

- **Container:** `display: inline-flex`, `alignItems: center`, `gap: spacingXXXSmall`, `padding: 2px spacingXSmall 2px spacingXXXSmall`, `borderRadius: radiusPill`, `border: 1px solid neutral3`, `backgroundColor: neutral0`, `fontSize: fontSizeSmall`, `lineHeight: '1.5'`
- **Container (brand):** `border: 1px solid brandPrimary`, `backgroundColor: brandPrimaryLight`
- **Icon/Avatar:** 16px, left aligned
- **Label:** `color: textDefault`, `whiteSpace: nowrap`
- **Remove button:** 16px close icon, `color: textPlaceholder`, `cursor: pointer`, hover: `color: textDefault`
- **Disabled:** `opacity: 0.5`, no remove button

---

## New Icons

The following icons must be added to `src/components/Icon/Icon.tsx`:

| Icon Name | Usage | Path Description |
|-----------|-------|-----------------|
| `bell` | Notification trigger | Bell outline |
| `bell-filled` | Active notifications | Filled bell |
| `command` | Command menu trigger | ⌘ symbol |
| `keyboard` | Shortcut hints | Keyboard outline |
| `kanban` | View switcher | Vertical columns |
| `calendar-view` | View switcher | Calendar grid |
| `list-view` | View switcher | Horizontal lines |
| `grip-vertical` | Drag handle for kanban | 6 dots (grip) |
| `globe` | Global search | Globe outline |
| `notification` | Notification types | Bell with circle |
| `arrow-right` | Navigation arrows | Right arrow |
| `eye` | Mark as read | Eye outline |
| `eye-off` | Mark as unread | Eye with strike |

---

## New Hooks

### useCommandMenu

**File:** `src/hooks/useCommandMenu.ts`

Manages command menu state: open/close, search filtering, item navigation, and command execution.

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

**Implementation notes:**

- Static commands are defined in the hook: Navigate (Dashboard, Contacts, Companies, Deals, Settings), Create (New Contact, New Company, New Deal)
- When `searchQuery` is non-empty and exceeds 2 characters, the hook fires a multi-object GraphQL search across people, companies, and opportunities (debounced 300ms)
- Results are grouped by type: "Navigation", "Actions", "People", "Companies", "Deals"
- The hook manages keyboard navigation index, wrapping at list boundaries
- Uses `useKeyboardShortcut` to register Ctrl+K / ⌘K globally

### useGlobalSearch

**File:** `src/hooks/useGlobalSearch.ts`

Provides quick multi-object search results for the top bar GlobalSearch component.

```tsx
type UseGlobalSearchReturn = {
  query: string;
  setQuery: (q: string) => void;
  results: SearchResult[];
  loading: boolean;
  hasResults: boolean;
};
```

**Implementation notes:**

- Uses `gqlWorkspace` to search across `people`, `companies`, `opportunities`
- Search filter: `{ or: [{ name: { like: "%query%" } }, ...] }`
- Limit: 3 results per object type, max 9 total
- Debounced at 300ms
- Clears results when query is empty

### useNotifications

**File:** `src/hooks/useNotifications.ts`

Fetches and manages notifications from the backend via polling.

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

**Implementation notes:**

- Polls `/metadata` endpoint every 30 seconds with a `getNotifications` query
- Falls back to local mock data if the backend doesn't support notifications yet (graceful degradation)
- `markAsRead` and `markAllAsRead` optimistically update state and call mutation if available
- Notifications are sorted by timestamp descending (newest first)
- Max 50 notifications retained (trimmed from oldest)

### useCalendarEvents

**File:** `src/hooks/useCalendarEvents.ts`

Fetches calendar events for a given month.

```tsx
type UseCalendarEventsReturn = {
  events: CalendarEventData[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
};
```

**Implementation notes:**

- Queries `calendarEvents` for the given month range using workspace GraphQL
- Falls back to querying `opportunities` with `closeDate` in the given month range (as deal close dates are the primary calendar content for a CRM)
- Maps opportunity data to `CalendarEventData`: title = deal name, date = closeDate, variant based on stage
- Merges actual calendar events + opportunity close dates
- Re-fetches when year/month changes

### useKanbanBoard

**File:** `src/hooks/useKanbanBoard.ts`

Fetches and manages kanban board data for opportunities grouped by stage.

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

**Implementation notes:**

- Fetches all opportunities with `gqlWorkspace` using relay pagination (fetches all pages)
- Groups records by `stage` field value
- Predefined column order: `['LEAD', 'QUALIFICATION', 'MEETING', 'PROPOSAL', 'CLOSED_WON', 'CLOSED_LOST']`
- Each column calculates aggregate: `SUM(amount)` for won stages, `COUNT` for others
- `moveCard` calls `updateOpportunity` mutation to change the `stage` field
- Optimistically updates local state before mutation completes
- On mutation failure, reverts to previous state and shows error toast

### useKeyboardShortcut

**File:** `src/hooks/useKeyboardShortcut.ts`

A utility hook for registering global keyboard shortcuts.

```tsx
type UseKeyboardShortcutOptions = {
  key: string;                   // e.g., 'k'
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

**Implementation notes:**

- Attaches `keydown` listener to `document`
- Checks modifier keys (Ctrl/Meta, Shift, Alt) match
- For `ctrlKey`, also matches `metaKey` and vice versa (cross-platform Ctrl+K / ⌘K)
- Calls `preventDefault()` on match to avoid browser default behavior
- Cleans up listener on unmount
- Can be disabled via `enabled` flag

---

## Pages

### CalendarPage

**File:** `src/pages/CalendarPage.tsx`

Displays a monthly calendar view with deal close dates and calendar events.

**Structure:**
```
PageHeader
  title="Calendar"
  actions=[Today, Prev, Next]
CalendarGrid
  year={currentYear}
  month={currentMonth}
  events={events from useCalendarEvents}
```

**Features:**
- Month navigation with Prev/Next buttons and "Today" button
- Events sourced from opportunities (close dates) + calendar events
- Clicking an event navigates to the deal/event detail page
- Clicking a day with no events opens the create deal form with that date pre-filled
- Loading state shows Spinner overlay

---

### KanbanDealsPage

**File:** `src/pages/KanbanDealsPage.tsx`

Displays opportunities in a Kanban board grouped by pipeline stage.

**Structure:**
```
PageHeader
  title="Deals Pipeline"
  actions=[New Deal button, View Switcher (List | Kanban | Calendar)]
KanbanBoard
  columns={columns from useKanbanBoard}
  renderCard={KanbanDealCard}
  onCardMove={moveCard}
```

**KanbanDealCard (inline):**
Shows: deal name, company name (subtitle), formatted amount, close date, stage badge

**Features:**
- View switcher button group: List (current DealsListPage), Kanban, Calendar
- Drag-and-drop to change deal stage
- Click card to navigate to deal detail page
- "+" in column creates a new deal with that stage pre-selected
- Aggregate shows total amount per column (formatted as currency)
- Columns for `CLOSED_WON` have green header accent; `CLOSED_LOST` have gray/red

---

## GraphQL Queries & Mutations

### Multi-Object Search (for CommandMenu and GlobalSearch)

```graphql
# Search People
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

# Search Companies
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

# Search Opportunities
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

### Calendar Events

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

Fallback — Opportunities by close date:

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

### Kanban — Update Stage

Reuses the existing `useRecordUpdate` hook mutation pattern:

```graphql
mutation UpdateOpportunityStage($idToUpdate: ID!, $input: OpportunityUpdateInput!) {
  updateOpportunity(id: $idToUpdate, data: $input) {
    id
    stage
  }
}
```

### Notifications

```graphql
# If backend supports notifications:
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

> **Note:** If the Twenty backend does not yet expose a notifications API, the `useNotifications` hook will fall back to local mock data and the component will be rendered in "demo mode" with placeholder notifications. This allows the UI to be shipped immediately while backend support is developed.

---

## Routing Changes

### New Routes

| Path | Page | Description |
|------|------|-------------|
| `/calendar` | `CalendarPage` | Monthly calendar view |
| `/deals/kanban` | `KanbanDealsPage` | Kanban pipeline view |

### Updated Shell Sidebar

Add new items to the sidebar navigation:

```tsx
const sidebarSections = [
  {
    label: 'Main',
    items: [
      { id: 'dashboard', label: 'Dashboard', href: '#/', icon: '⊞' },
      { id: 'contacts', label: 'Contacts', href: '#/contacts', icon: '👥' },
      { id: 'companies', label: 'Companies', href: '#/companies', icon: '🏢' },
      { id: 'deals', label: 'Deals', href: '#/deals', icon: '💼' },
      { id: 'calendar', label: 'Calendar', href: '#/calendar', icon: '📅' },
    ],
  },
  // ...
];
```

The Kanban view is accessed from the Deals page via a view switcher, not a separate sidebar item.

---

## Design Token Additions

### New Color Tokens (in tokens.ts)

```typescript
// Kanban stage colors
colorTokens.stageLeadBg = 'var(--eds-g-color-neutral-base-10, #e5e5e5)';
colorTokens.stageQualificationBg = 'var(--eds-g-color-info-container, #d8edff)';
colorTokens.stageMeetingBg = 'var(--eds-g-color-warning-container, #fdefc8)';
colorTokens.stageProposalBg = 'var(--eds-g-color-brand-base-10, #e5f2ff)';
colorTokens.stageWonBg = 'var(--eds-g-color-success-container, #cdefc4)';
colorTokens.stageLostBg = 'var(--eds-g-color-error-container, #fddde3)';
```

### New CSS Custom Properties (in global.css)

```css
/* Phase 4 — Stage colors */
--eds-g-color-stage-lead: #706e6b;
--eds-g-color-stage-qualification: #0176d3;
--eds-g-color-stage-meeting: #dd7a01;
--eds-g-color-stage-proposal: #032d60;
--eds-g-color-stage-won: #2e844a;
--eds-g-color-stage-lost: #ba0517;

/* Command menu backdrop */
--eds-g-color-backdrop: rgba(0, 0, 0, 0.5);
```

---

## Shell Integration

The Shell component (`src/components/Layout/Shell.tsx`) needs the following updates:

### Top Bar Additions

1. **GlobalSearch component** — Replaces/augments the existing simple app name area with a search input
2. **Notification bell icon** — Added to the right side of top bar, before the user name

```
┌─────────────────────────────────────────────────────────┐
│ Logo/AppName   [🔍 Search... ⌘K]       🔔(3)  User  │
└─────────────────────────────────────────────────────────┘
```

### CommandMenu Integration

The `CommandMenu` is rendered at the App level (in `App.tsx`), outside the Shell, so it overlays everything. The `useCommandMenu` hook manages the open/close state globally.

---

## Accessibility Checklist

### Command Menu
- [ ] `role="dialog"`, `aria-modal="true"`, `aria-label="Command menu"`
- [ ] Auto-focus on search input when opened
- [ ] `↑`/`↓` navigate items, `Enter` selects, `Escape` closes
- [ ] Focus returns to previous element on close
- [ ] `aria-activedescendant` on input references the focused item
- [ ] Each item has `role="option"` within `role="listbox"`
- [ ] Loading state announced with `aria-live="polite"`

### Notification Panel
- [ ] Trigger button has `aria-label="Notifications"` and `aria-expanded`
- [ ] Panel has `role="dialog"`, `aria-label="Notifications"`
- [ ] Unread count announced in trigger's `aria-label`
- [ ] Each notification is focusable and has `role="article"`
- [ ] "Mark all as read" is keyboard accessible
- [ ] Escape closes the panel

### Calendar Grid
- [ ] `role="grid"`, `aria-label="Calendar, {Month} {Year}"`
- [ ] Weekday headers have `role="columnheader"`
- [ ] Day cells have `role="gridcell"`, `aria-label="{Full date}"`
- [ ] Active date has `tabIndex={0}`, others `tabIndex={-1}`
- [ ] Arrow keys navigate days/weeks, PageUp/PageDown change months
- [ ] Today cell has `aria-current="date"`
- [ ] Events within cells are accessible via Tab

### Kanban Board
- [ ] Board has `role="region"`, `aria-label="Pipeline board"`
- [ ] Each column has `role="list"`, `aria-label="{Stage name}"`
- [ ] Cards have `role="listitem"`, `aria-roledescription="draggable"`
- [ ] Drag instructions announced: "Press Space to grab, arrows to move"
- [ ] Drop announced: "Moved to {column}, position {n}"
- [ ] Focus management: focus follows the moved card

### Global Search
- [ ] `role="combobox"`, `aria-expanded`, `aria-controls` the results list
- [ ] Results list has `role="listbox"`, items have `role="option"`
- [ ] `aria-activedescendant` tracks focused result
- [ ] Screen reader announces result count updates

---

## File Structure Summary

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
│   └── index.ts              (updated with Phase 4 exports)
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
└── AppRouter.tsx              (updated with new routes)
```

---

## Definition of Done

A feature is considered complete when:

1. All components render correctly with EDS design tokens (no hard-coded values)
2. Keyboard navigation works as specified for each component
3. ARIA attributes are correctly set and screen reader announces state changes
4. The CommandMenu opens with Ctrl+K / ⌘K and searches across all record types
5. The NotificationPanel shows notifications (mock data if backend not ready)
6. The CalendarGrid displays opportunity close dates for the current month
7. The KanbanBoard displays opportunities grouped by stage with drag-and-drop
8. New pages are accessible via routing and sidebar navigation
9. No external CSS-in-JS dependencies added (inline styles + tokens + utility CSS only)
10. Responsive: works on tablet (768px+) and desktop (1280px+)
11. All existing pages and features continue to work (no regressions)
