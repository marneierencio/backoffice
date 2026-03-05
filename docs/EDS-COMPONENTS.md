# EDS 1.0 Component Library

This document describes the component library implemented in `packages/twenty-eds`, the Erencio Design System (EDS). Its architecture is inspired by [Salesforce Lightning Design System 2 (SLDS 2)](https://www.lightningdesignsystem.com/).

## Design Principles

1. **Accessibility-first**: All components use semantic HTML and ARIA attributes
2. **Token-driven**: All visual values come from design tokens — no hard-coded colors or spacings
3. **Composable**: Components accept children and slot props for flexible composition
4. **Typed**: Strict TypeScript with named exports and descriptive generic parameters

## Design Tokens (`src/tokens/tokens.ts`)

Design tokens are the single source of truth for all visual values.

### Color Tokens
| Token | Value | Usage |
|-------|-------|-------|
| `colorTokens.brandPrimary` | `var(--eds-g-color-brand-base-50)` | Primary actions, links, focus rings |
| `colorTokens.neutral0` | `var(--eds-g-color-neutral-base-1)` | Card/surface backgrounds |
| `colorTokens.neutral1` | `var(--eds-g-color-neutral-base-5)` | Page background |
| `colorTokens.error` | `var(--eds-g-color-error-base-50)` | Error states |
| `colorTokens.success` | `var(--eds-g-color-success-base-50)` | Success states |
| `colorTokens.warning` | `var(--eds-g-color-warning-base-50)` | Warning states |

### Spacing Tokens
Based on a 4px/8px grid:
- `spacingXXSmall` = 4px
- `spacingXSmall` = 8px
- `spacingSmall` = 12px
- `spacingMedium` = 16px
- `spacingLarge` = 24px
- `spacingXLarge` = 32px

### Typography Tokens
Base font: system-ui stack (`system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif`) — following SLDS 2 pattern of using system fonts.

Font scale from `fontSizeXSmall` (11px / `--eds-g-font-scale-2`) to `fontSizeXXXLarge` (32px / `--eds-g-font-size-display`).
Font weights: light (300), regular (400), semibold (600), bold (700) — matching SLDS 2 weight scale 3–7.

## Component Inventory

### Button

```tsx
import { Button } from '@eds/components/Button';

<Button
  label="Save"
  variant="brand"   // 'brand' | 'neutral' | 'outline' | 'ghost' | 'destructive'
  size="medium"     // 'small' | 'medium' | 'large'
  loading={false}
  disabled={false}
  onClick={() => {}}
/>
```

**Variants:**
- `brand` — primary CTA, solid blue
- `neutral` — secondary action, gray background
- `outline` — bordered, blue text
- `ghost` — no border, blue text
- `destructive` — solid red, destructive actions

### Input

```tsx
import { Input } from '@eds/components/Input';

<Input
  id="email"
  label="Email address"
  type="email"
  value={email}
  placeholder="user@example.com"
  required
  error="Please enter a valid email"
  hint="We'll never share your email"
  onChange={(e) => setEmail(e.target.value)}
/>
```

### Card

```tsx
import { Card } from '@eds/components/Card';

<Card
  title="Account Info"
  description="Your current account details"
  variant="default"   // 'default' | 'narrow' | 'highlight'
  headerRight={<Button label="Edit" variant="neutral" size="small" />}
  footer={<span>Last updated today</span>}
>
  <p>Card body content</p>
</Card>
```

**Variants:**
- `default` — standard card with border and shadow
- `narrow` — same as default (for compact layouts)
- `highlight` — blue left border accent

### Badge

```tsx
import { Badge } from '@eds/components/Badge';

<Badge
  label="Active"
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
      label: 'Main',
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

The Shell component renders:
- A fixed top navigation bar (dark, 52px height)
- A collapsible left sidebar
- A scrollable main content area

## Naming Conventions

| Category | Convention | Example |
|----------|-----------|---------|
| Component files | PascalCase | `Button.tsx` |
| Component exports | Named, PascalCase | `export const Button = ...` |
| Props types | `<Component>Props` | `ButtonProps` |
| Variant types | `<Component>Variant` | `ButtonVariant` |
| Size types | `<Component>Size` | `ButtonSize` |
| Token files | camelCase exports | `colorTokens`, `spacingTokens` |
| Index exports | barrel file | `export { Button } from './Button'` |

## Divergence from SLDS 2

Where the implementation diverges from the official SLDS 2 spec, the decision is documented here:

1. **CSS custom properties + inline styles**: EDS uses `--eds-g-*` CSS custom properties (defined in `global.css`) consumed via React inline styles and token references. This provides full theming support via CSS while keeping component code straightforward.

2. **Utility CSS classes**: EDS includes SLDS 2-style utility classes (`.eds-m_*`, `.eds-p_*`, `.eds-text_*`, `.eds-grid`, etc.) in `utilities.css` for rapid layout and styling.

3. **No LWC dependency**: Official SLDS 2 is designed for Lightning Web Components. EDS adapts the design principles (tokens, component API, accessibility) to React.

4. **System fonts**: Following SLDS 2's recommendation, EDS uses the system font stack instead of branded fonts, for faster load times and native OS integration.

5. **Simplified token structure**: The full SLDS 2 spec has 500+ tokens. EDS includes the essential set with room to expand.

---

## Phase 1 Components (Record Listing)

The following components were added in Phase 1 to support record listing pages.

### Icon

A minimal inline SVG icon system with no external dependencies.

```tsx
import { Icon } from '@eds/components/Icon';

<Icon
  name="search"    // 'search' | 'sort-ascending' | 'sort-descending' | 'chevron-left' | 'chevron-right' | etc.
  size={16}        // pixel size (default 16)
  color="currentColor"
/>
```

Available icons: `search`, `sort-ascending`, `sort-descending`, `chevron-left`, `chevron-right`, `chevron-down`, `check`, `minus`, `close`, `filter`, `refresh`, `chevron-first`, `chevron-last`.

### Checkbox

> SLDS 2 ref: [Checkbox](https://www.lightningdesignsystem.com/components/checkbox/)

```tsx
import { Checkbox } from '@eds/components/Checkbox';

<Checkbox
  label="Select all"
  checked={true}
  indeterminate={false}
  disabled={false}
  onChange={(checked) => {}}
/>
```

Custom visual checkbox with support for `indeterminate` state (used by DataTable select-all). Uses native `<input type="checkbox">` under the hood for accessibility.

### Select

> SLDS 2 ref: [Select](https://www.lightningdesignsystem.com/components/select/)

```tsx
import { Select } from '@eds/components/Select';

<Select
  label="Status"
  value={status}
  options={[
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ]}
  placeholder="Select…"
  required
  error="Please select a status"
  onChange={(value) => setStatus(value)}
/>
```

Uses native `<select>` element for full accessibility compliance. Label, hint, error, required decorations match the Input component style.

### Spinner

> SLDS 2 ref: [Spinners](https://www.lightningdesignsystem.com/components/spinners/)

```tsx
import { Spinner } from '@eds/components/Spinner';

// Overlay spinner (default)
<Spinner size="medium" label="Loading" />

// Inline spinner
<Spinner size="small" label="Loading" inline />
```

**Sizes:** `x-small` (16px), `small` (24px), `medium` (32px), `large` (48px).

CSS-only animation with a brand-colored arc spinning over a neutral track. Overlay mode adds a semi-transparent background.

### SearchBar

> Based on SLDS 2 [Input — Search type](https://www.lightningdesignsystem.com/components/input/)

```tsx
import { SearchBar } from '@eds/components/SearchBar';

<SearchBar
  value={query}
  placeholder="Search contacts…"
  onChange={(value) => setQuery(value)}
  debounceMs={300}
/>
```

Search input with a magnifying glass icon, debounced `onChange`, clear button, and Escape-to-clear keyboard support.

### EmptyState

> SLDS 2 ref: [Empty State](https://www.lightningdesignsystem.com/components/empty-state/)

```tsx
import { EmptyState } from '@eds/components/EmptyState';

<EmptyState
  title="No contacts found"
  description="Try adjusting your search criteria"
  icon="👥"
  action={<Button label="Clear filters" variant="outline" />}
/>
```

Centered message displayed when a list or table has no data.

### PageHeader

Consistent header for list pages with title, description, search, and action slots.

```tsx
import { PageHeader } from '@eds/components/PageHeader';

<PageHeader
  title="Contacts"
  description="Manage your contacts"
  icon="👥"
  actions={<Button label="New Contact" variant="brand" />}
>
  <SearchBar value={query} onChange={setQuery} />
</PageHeader>
```

### DataTable

> SLDS 2 ref: [Data Table](https://www.lightningdesignsystem.com/components/data-tables/)

The primary component of Phase 1. Renders a semantic `<table>` with sortable columns, row selection, hover/striped rows, loading overlay, and empty state.

```tsx
import { DataTable } from '@eds/components/DataTable';
import type { ColumnDefinition } from '@eds/components/DataTable';

const columns: ColumnDefinition<Contact>[] = [
  { key: 'name', label: 'Name', accessor: 'name', sortable: true, width: '30%' },
  { key: 'email', label: 'Email', accessor: 'email', sortable: true, width: '30%',
    renderCell: (val, record) => <a href={`mailto:${val}`}>{val}</a> },
  { key: 'city', label: 'City', accessor: 'city', width: '20%' },
  { key: 'created', label: 'Created', accessor: 'createdAt', sortable: true, width: '20%',
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

**Key features:**
- Semantic `<table>` with `<th scope="col">` and `aria-sort`
- Select-all checkbox with indeterminate state
- Sort toggle: click header → asc → desc → unsorted
- Row hover highlight
- Loading spinner overlay with `aria-busy`
- Empty state when no data
- Custom cell renderers via `renderCell`

### Pagination

Page navigation controls following SLDS 2 button group patterns.

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

Renders: record count summary, first/prev/page-numbers/next/last buttons, and a rows-per-page select. Active page is highlighted with brand color. Uses `<nav aria-label="Pagination">` for accessibility.

---

## Phase 2 — Record Detail Components

Components added in Phase 2 to support record detail pages (contact, company, deal).

### Avatar

Circular (user) or rounded-square (entity) avatar with image, initials fallback, or icon fallback.

```tsx
import { Avatar } from '@eds/components/Avatar';

<Avatar
  name="John Doe"
  src="https://example.com/avatar.jpg"
  type="user"     // 'user' | 'entity'
  size="medium"   // 'x-small' (20px) | 'small' (24px) | 'medium' (32px) | 'large' (48px)
/>
```

**Behavior:**
- `user` type renders as circle; `entity` renders as rounded square
- If `src` fails to load or is not provided, renders initials extracted from `name`
- User initials: first letter of first + last word; Entity initials: first two letters
- Falls back to `user` or `company` icon if name is empty
- Uses `brandPrimary` background with `textInverse` foreground for initials

### Tabs

Horizontal tab bar with ARIA tablist/tab/tabpanel roles following SLDS 2 tab pattern.

```tsx
import { Tabs } from '@eds/components/Tabs';

<Tabs
  items={[
    { id: 'details', label: 'Details' },
    { id: 'timeline', label: 'Timeline', badge: 3 },
    { id: 'notes', label: 'Notes', disabled: true },
  ]}
  activeId="details"
  onTabChange={(id) => setActiveTab(id)}
  size="medium"   // 'small' | 'medium'
/>
```

**Accessibility:**
- `role="tablist"` on container, `role="tab"` on each tab, `role="tabpanel"` on content
- Arrow keys navigate between tabs; Home/End jump to first/last
- Only active tab is in tab order (`tabIndex={0}`)
- `aria-selected`, `aria-controls`, `aria-labelledby` correctly wired

### Modal

Dialog overlay with focus trap, backdrop, and keyboard support.

```tsx
import { Modal } from '@eds/components/Modal';

<Modal
  open={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirm Action"
  size="medium"   // 'small' (480px) | 'medium' (640px) | 'large' (960px)
  footer={<Button label="OK" variant="brand" onClick={handleOk} />}
>
  <p>Are you sure?</p>
</Modal>
```

**Behavior:**
- `role="dialog"`, `aria-modal="true"`, `aria-labelledby` linked to title
- Focus trapped inside modal when open; Escape key closes
- Focus moves to first focusable element on open, restores to trigger on close
- Backdrop click closes modal
- CSS animations: `eds-fade-in` (backdrop), `eds-slide-up` (panel)

### Toast / ToastProvider

Notification system with success/error/warning/info variants following SLDS 2 toast pattern.

```tsx
// Wrap app with provider
import { ToastProvider } from '@eds/components/Toast';

<ToastProvider>
  <App />
</ToastProvider>

// Use in any component
import { useToast } from '@eds/hooks/useToast';

const { showSuccess, showError, showWarning, showInfo } = useToast();
showSuccess('Record saved');
showError('Failed to update', 'Please try again');
```

**Variants:** `success` (green), `error` (red), `warning` (amber), `info` (blue)
**Auto-dismiss:** Success without detail link = 4.8s; all others = sticky (user must dismiss)
**Accessibility:** `role="status"`, `aria-live="polite"`, `aria-atomic="true"`. Close button has `aria-label="Close notification"`.

### FieldRenderer

Read-only field display that formats values by type.

```tsx
import { FieldRenderer } from '@eds/components/FieldRenderer';

<FieldRenderer
  type="email"    // 'text' | 'email' | 'phone' | 'url' | 'number' | 'date' | 'currency' | 'boolean' | 'select'
  value="john@example.com"
  emptyPlaceholder="—"
/>
```

**Type behaviors:**
- `email` → renders `mailto:` link
- `phone` → renders `tel:` link
- `url` → renders external link with icon
- `number` → locale-formatted with `toLocaleString()`
- `currency` → micros/1M formatted with `Intl.NumberFormat`
- `boolean` → "Yes" / "No"
- `date` → `toLocaleDateString()`

### InlineEdit

Click-to-edit field with read/edit mode toggle. Uses FieldRenderer in read mode.

```tsx
import { InlineEdit } from '@eds/components/InlineEdit';

<InlineEdit
  type="text"
  value="John"
  label="First Name"
  onSave={async (value) => { /* save to API */ }}
  editable={true}
/>
```

**Behavior:**
- Read mode: displays value via FieldRenderer, pencil icon on hover
- Edit mode: shows appropriate `<input>` type (text, email, tel, number, date, url) or `<select>`
- Save: Enter key or checkmark button. Cancel: Escape key or × button
- Shows loading spinner while saving, error message on failure
- `role="button"` + `aria-label="Edit {label}"` in read mode

### PropertyBox

Vertical list of labeled field pairs, each using InlineEdit.

```tsx
import { PropertyBox } from '@eds/components/PropertyBox';

<PropertyBox
  fields={[
    { label: 'Name', fieldName: 'name', type: 'text', editable: true },
    { label: 'Email', fieldName: 'email', type: 'email', editable: true },
    { label: 'Created', fieldName: 'createdAt', type: 'date', editable: false },
  ]}
  values={{ name: 'John', email: 'john@example.com', createdAt: '2025-01-15T00:00:00Z' }}
  onSave={async (fieldName, value) => { /* save */ }}
  compact={false}
/>
```

**Layout:** Label (140px, right-aligned) + value (flex 1, max-width 300px). Dividers between rows (omitted in compact mode).

### RecordHeader

Page header for record detail pages with breadcrumb navigation, avatar, name, and object label.

```tsx
import { RecordHeader } from '@eds/components/RecordHeader';

<RecordHeader
  avatar={<Avatar name="John Doe" type="user" size="large" />}
  recordName="John Doe"
  objectLabel="Contact"
  breadcrumbs={[
    { label: 'Contacts', href: '#/contacts' },
    { label: 'John Doe' },
  ]}
  actions={<Button label="Edit" variant="outline" />}
/>
```

**Accessibility:** `<nav aria-label="Breadcrumb">` + `<ol>` for breadcrumbs. Record name rendered as `<h1>`.

### RelationCard

Collapsible card displaying related records (one-to-one or one-to-many).

```tsx
import { RelationCard } from '@eds/components/RelationCard';

<RelationCard
  title="Contacts"
  type="many"     // 'one' | 'many'
  records={[
    { id: '1', name: 'John Doe', subtitle: 'john@example.com', avatarUrl: '...' },
    { id: '2', name: 'Jane Smith', subtitle: 'jane@example.com' },
  ]}
  onRecordClick={(record) => navigate(`/contacts/${record.id}`)}
  initialExpanded={true}
  maxVisible={5}
  avatarType="user"
  emptyMessage="No contacts linked"
/>
```

**Behavior:**
- Shows count badge in title for `many` type
- Collapsible with chevron toggle
- "Show more" / "Show less" when records exceed `maxVisible`
- Each record row: Avatar + name + subtitle, clickable with hover highlight

### Timeline

Vertical timeline displaying activity events with relative timestamps.

```tsx
import { Timeline } from '@eds/components/Timeline';

<Timeline
  events={[
    { id: '1', type: 'created', title: 'Record created', timestamp: '2025-01-15T10:30:00Z' },
    { id: '2', type: 'email', title: 'Email sent', timestamp: '2025-01-16T14:00:00Z',
      author: { name: 'John Doe', avatarUrl: '...' } },
  ]}
  maxVisible={10}
  onShowMore={() => loadMore()}
/>
```

**Event types:** `created`, `updated`, `note`, `email`, `task`, `call`, `event` — each with a distinct icon and color on the timeline dot.
**Timestamps:** Relative format ("2h ago", "Yesterday", "Mar 15, 2025").

---

## Hooks

### useRecordDetail

Fetches a single record by ID via the Twenty workspace GraphQL API.

```tsx
import { useRecordDetail } from '@eds/hooks/useRecordDetail';

const { record, loading, error, refresh } = useRecordDetail<PersonRecord>({
  objectNameSingular: 'person',
  objectNamePlural: 'people',
  recordId: 'uuid-here',
  fields: 'id name { firstName lastName } emails { primaryEmail }',
});
```

### useRecordUpdate

Mutation hook for updating a single field on a record. Supports nested dot-path fields.

```tsx
import { useRecordUpdate } from '@eds/hooks/useRecordUpdate';

const { updateField, loading } = useRecordUpdate({
  objectNameSingular: 'person',
  objectNamePlural: 'people',
});

const result = await updateField('record-id', 'name.firstName', 'Jane');
// result: { success: true } or { success: false, error: 'message' }
```

### useToast

Provides access to the toast notification system via React context.

```tsx
import { useToast } from '@eds/hooks/useToast';

const { showSuccess, showError, showWarning, showInfo } = useToast();
showSuccess('Saved successfully');
showError('An error occurred', 'Please try again later');
```

