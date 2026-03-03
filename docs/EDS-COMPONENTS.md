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

