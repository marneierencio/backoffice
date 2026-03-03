# EDS Phase 1 — Record Listing: Design & Implementation Plan

This document specifies the components, behaviors, tokens, and page structure for Phase 1 of the EDS migration (Record Listing). All designs follow [SLDS 2](https://www.lightningdesignsystem.com/) principles adapted for React, using EDS design tokens (`--eds-g-*`).

---

## Table of Contents

1. [Scope](#scope)
2. [New Components](#new-components)
   - [Checkbox](#checkbox)
   - [Select](#select)
   - [Spinner](#spinner)
   - [Icon (utility)](#icon-utility)
   - [SearchBar](#searchbar)
   - [DataTable](#datatable)
   - [Pagination](#pagination)
   - [EmptyState](#emptystate)
   - [PageHeader](#pageheader)
3. [New Hooks](#new-hooks)
   - [useRecordList](#userecordlist)
4. [Pages](#pages)
   - [ContactsListPage](#contactslistpage)
   - [CompaniesListPage](#companieslistpage)
   - [DealsListPage (Opportunities)](#dealslistpage-opportunities)
5. [GraphQL Queries](#graphql-queries)
6. [Routing Changes](#routing-changes)
7. [Design Token Additions](#design-token-additions)
8. [Accessibility Checklist](#accessibility-checklist)

---

## Scope

Phase 1 delivers **read-only record listing** for the three core CRM objects. Users can:

- View a paginated table of records
- Sort by column (single-column ascending/descending)
- Search with a text query
- Select rows (checkbox) — no batch actions yet, but the ground is prepared
- Navigate pages via pagination controls

No inline editing, no record creation, no record deletion in this phase.

---

## New Components

### Checkbox

> SLDS 2 reference: [Checkbox](https://www.lightningdesignsystem.com/components/checkbox/)

**File:** `src/components/Checkbox/Checkbox.tsx`

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

**Visual spec:**
- 16×16px box, `border: 1px solid borderInput`, `border-radius: radiusSmall` (2px)
- Checked: `backgroundColor: brandPrimary`, white SVG checkmark
- Indeterminate: `backgroundColor: brandPrimary`, white horizontal dash
- Focus ring: `0 0 0 2px brandPrimaryLight, 0 0 0 4px brandPrimary`
- Label (if provided) appears to the right, `fontSizeMedium`, `fontWeightRegular`
- Hover: border darkens to `neutral6`

---

### Select

> SLDS 2 reference: [Select](https://www.lightningdesignsystem.com/components/select/)

**File:** `src/components/Select/Select.tsx`

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

**Visual spec:**
- Uses native `<select>` element styled with EDS tokens
- Height: 36px, `padding: 0 spacingSmall`, border matches Input component
- Right arrow indicator via native browser chrome (we don't override)
- Label above the select, matching Input label style
- States: default, focus (blue border), disabled (gray background), error (red border + message)

---

### Spinner

> SLDS 2 reference: [Spinners](https://www.lightningdesignsystem.com/components/spinners/)

**File:** `src/components/Spinner/Spinner.tsx`

```tsx
type SpinnerSize = 'x-small' | 'small' | 'medium' | 'large';

type SpinnerProps = {
  size?: SpinnerSize;
  label?: string;         // screen-reader label, default "Loading"
  inline?: boolean;       // inline-block vs centered overlay
};
```

**Visual spec:**
- CSS-only animation: a circular border with one colored arc spinning (`animation: spin 0.8s linear infinite`)
- Sizes: x-small=16px, small=24px, medium=32px, large=48px
- Color: `brandPrimary` arc, `neutral2` track
- When `inline=false` (default), centered with semi-transparent backdrop

---

### Icon (utility)

**File:** `src/components/Icon/Icon.tsx`

A minimal inline SVG icon system using svg paths. No icon library dependency.

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
  size?: number;           // default 16
  color?: string;          // default currentColor
  'aria-hidden'?: boolean; // default true
  className?: string;
};
```

**Visual spec:**
- Rendered as `<svg>` with `width`/`height` from `size` prop and `fill` from `color`
- `aria-hidden="true"` by default (decorative)
- Each icon is a `<path d="...">` within a 16×16 viewBox

---

### SearchBar

> Based on SLDS 2 [Input — Search type](https://www.lightningdesignsystem.com/components/input/)

**File:** `src/components/SearchBar/SearchBar.tsx`

```tsx
type SearchBarProps = {
  value: string;
  placeholder?: string;  // default "Search…"
  onChange: (value: string) => void;
  onClear?: () => void;
  debounceMs?: number;    // default 300
  disabled?: boolean;
  'aria-label'?: string;
};
```

**Visual spec:**
- Input with search icon (`Icon name="search"`) on the left
- Clear button (×) appears when value is non-empty
- Border: `1px solid borderInput`, focus: `borderFocus`
- Height: 36px, border-radius: `radiusMedium`
- Internal state debounces onChange callback

---

### DataTable

> SLDS 2 reference: [Data Table](https://www.lightningdesignsystem.com/components/data-tables/)

**File:** `src/components/DataTable/DataTable.tsx`

This is the primary component of Phase 1.

```tsx
type SortDirection = 'asc' | 'desc' | null;

type ColumnDefinition<TRecord> = {
  key: string;
  label: string;
  accessor: keyof TRecord | ((record: TRecord) => React.ReactNode);
  sortable?: boolean;
  width?: string;             // CSS width, e.g. "200px" or "25%"
  align?: 'left' | 'center' | 'right';
  renderCell?: (value: unknown, record: TRecord) => React.ReactNode;
};

type DataTableProps<TRecord extends { id: string }> = {
  columns: ColumnDefinition<TRecord>[];
  data: TRecord[];
  loading?: boolean;
  emptyMessage?: string;

  // Selection
  selectable?: boolean;
  selectedIds?: Set<string>;
  onSelectionChange?: (selected: Set<string>) => void;

  // Sorting
  sortColumn?: string;
  sortDirection?: SortDirection;
  onSort?: (column: string, direction: SortDirection) => void;

  // Row click
  onRowClick?: (record: TRecord) => void;

  // Striped rows
  striped?: boolean;

  // Bordered
  bordered?: boolean;
};
```

**Anatomy (SLDS 2):**

| # | Element | Description |
|---|---------|-------------|
| 1 | Header Row | Top row with column titles, sort controls |
| 2 | Header Cell | `<th>` with label + sort icon button |
| 3 | Select-all Checkbox | In first header cell when `selectable` |
| 4 | Body Row | `<tr>` with record data |
| 5 | Row Checkbox | In first body cell when `selectable` |
| 6 | Cell | `<td>` with content |
| 7 | Sort Icon | Ascending/descending indicator in sorted column header |
| 8 | Hover Row | Background highlight on mouse hover |
| 9 | Selected Row | Light blue background when row is selected |
| 10 | Loading Overlay | Spinner overlay when `loading=true` |
| 11 | Empty State | Message when `data.length === 0` and not loading |

**Visual spec:**

- **Table**: `width: 100%`, `border-collapse: separate`, `border-spacing: 0`
- **Optional border**: `border: 1px solid borderDefault`, `border-radius: radiusLarge`
- **Header row**: `backgroundColor: neutral1`, `borderBottom: 2px solid neutral3`
- **Header cell**: `padding: spacingXSmall spacingMedium`, `fontSize: fontSizeSmall`, `fontWeight: fontWeightBold`, `color: textLabel`, `text-transform: uppercase`, `letter-spacing: 0.04em`
- **Body row**: `borderBottom: 1px solid neutral2`
- **Body row hover**: `backgroundColor: brandPrimaryLight` (very light blue)
- **Body row selected**: `backgroundColor: brandPrimaryLight`
- **Striped rows**: odd rows `backgroundColor: neutral1`
- **Body cell**: `padding: spacingXSmall spacingMedium`, `fontSize: fontSizeMedium`, `color: textDefault`, `verticalAlign: middle`
- **Sort button**: icon-only button in header cell, shows `sort-ascending` or `sort-descending`; unsorted columns show icon on hover
- **Loading**: `Spinner` component overlaid with `position: absolute`, 50% opacity backdrop
- **Empty state**: centered text in a `<tr>` spanning all columns

**Behaviors:**
- Click sortable header → toggle sort direction: null → asc → desc → null
- Click checkbox → select/deselect individual row
- Click select-all → select all / deselect all (indeterminate when partial)
- Sort indicators follow SLDS 2: arrow-up for ascending, arrow-down for descending

---

### Pagination

> No direct SLDS 2 pagination component; follows [Button Group](https://www.lightningdesignsystem.com/components/button-groups/) pattern + page info text.

**File:** `src/components/Pagination/Pagination.tsx`

```tsx
type PaginationProps = {
  currentPage: number;         // 1-based
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];  // default [10, 25, 50, 100]
};
```

**Visual spec:**

```
┌─────────────────────────────────────────────────────────────────┐
│  Showing 1–25 of 1,248     │  « ‹ 1 2 3 ... 50 › »   │  25 ▾ │
└─────────────────────────────────────────────────────────────────┘
```

- Left: text summary "Showing {start}–{end} of {total}"
- Center: page buttons — first, prev, page numbers (max 5 visible + ellipsis), next, last
- Right: page-size select dropdown
- All buttons use `Button` variant `ghost` or `outline`, `size: small`
- Active page: `Button` variant `brand`
- Disabled prev/next at boundaries

---

### EmptyState

> SLDS 2 reference: [Empty State](https://www.lightningdesignsystem.com/components/empty-state/)

**File:** `src/components/EmptyState/EmptyState.tsx`

```tsx
type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;  // e.g. a Button
};
```

**Visual spec:**
- Centered container, `padding: spacingXXLarge`
- Icon/emoji at top, `fontSize: 3rem`, muted color
- Title: `fontSizeXLarge`, `fontWeightBold`, `color: textDefault`
- Description: `fontSizeMedium`, `color: textPlaceholder`, `marginTop: spacingXSmall`
- Action: `marginTop: spacingMedium`

---

### PageHeader

> Consistent header for list pages with title, description, search, and actions.

**File:** `src/components/PageHeader/PageHeader.tsx`

```tsx
type PageHeaderProps = {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;   // right-aligned action buttons
  children?: React.ReactNode;  // below the header (search bar, filters)
};
```

**Visual spec:**
- Flex row: icon + title/description on the left, actions on the right
- Title: `fontSizeXXLarge`, `fontWeightBold`
- Description: `fontSizeMedium`, `textPlaceholder`
- Below header: optional slot for search bar/filters with `marginTop: spacingMedium`
- `marginBottom: spacingLarge` separating from content below

---

## New Hooks

### useRecordList

**File:** `src/hooks/useRecordList.ts`

A generic hook for fetching paginated, sortable, searchable record lists from the Twenty GraphQL API.

```tsx
type UseRecordListOptions = {
  objectNamePlural: string;   // e.g. "people", "companies", "opportunities"
  fields: string;             // GraphQL field selection string
  pageSize?: number;          // default 25
};

type UseRecordListReturn<TRecord> = {
  data: TRecord[];
  totalCount: number;
  loading: boolean;
  error: string | null;

  // Pagination
  currentPage: number;
  pageSize: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;

  // Sorting
  sortColumn: string | null;
  sortDirection: 'asc' | 'desc' | null;
  setSort: (column: string | null, direction: 'asc' | 'desc' | null) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Refresh
  refresh: () => void;
};
```

The hook builds a dynamic GraphQL query using the Twenty object API pattern:

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

**Implementation notes:**
- Uses cursor-based pagination internally but exposes page-based API to consumers
- Maintains cursor map: `{ [pageNumber]: cursor }` for back-navigation
- Search query maps to `filter: { or: [{ name: { firstName: { like: "%query%" } } }, ...] }`
- Sort maps to `orderBy: [{ fieldName: direction }]`

---

## Pages

### ContactsListPage

**File:** `src/pages/ContactsListPage.tsx`

**Object:** `people` (Twenty's Person object)

**Columns:**
| Column | Field | Sortable | Width |
|--------|-------|----------|-------|
| Name | `name.firstName + name.lastName` | Yes | 25% |
| Email | `emails.primaryEmail` | Yes | 20% |
| Phone | `phones.primaryPhoneNumber` | No | 15% |
| Company | `company.name` | Yes | 20% |
| City | `city` | Yes | 10% |
| Created | `createdAt` | Yes | 10% |

**Layout:**
```
PageHeader (title="Contacts", icon="👥")
  └─ SearchBar
DataTable (columns, data, sorting, selection, pagination)
Pagination
```

---

### CompaniesListPage

**File:** `src/pages/CompaniesListPage.tsx`

**Object:** `companies` (Twenty's Company object)

**Columns:**
| Column | Field | Sortable | Width |
|--------|-------|----------|-------|
| Name | `name` | Yes | 25% |
| Domain | `domainName.primaryLinkUrl` | No | 20% |
| Employees | `employees` | Yes | 10% |
| Address | `address.addressCity` | Yes | 15% |
| Created | `createdAt` | Yes | 15% |

---

### DealsListPage (Opportunities)

**File:** `src/pages/DealsListPage.tsx`

**Object:** `opportunities` (Twenty's Opportunity object)

**Columns:**
| Column | Field | Sortable | Width |
|--------|-------|----------|-------|
| Name | `name` | Yes | 25% |
| Amount | `amount.amountMicros` | Yes | 15% |
| Stage | `stage` | Yes | 15% |
| Close Date | `closeDate` | Yes | 15% |
| Company | `company.name` | Yes | 20% |
| Created | `createdAt` | Yes | 10% |

---

## GraphQL Queries

The EDS frontend uses the `/api` endpoint (workspace-scoped GraphQL) rather than `/metadata`. The `api.ts` utility must be extended to support both endpoints.

### API Changes

Add a second GraphQL executor that targets `/api` (workspace-scoped):

```tsx
// api.ts additions
export const gqlWorkspace = async <TData = unknown>(
  query: string,
  variables?: Record<string, unknown>,
  options?: FetchOptions,
): Promise<{ data?: TData; errors?: Array<{ message: string }> }> => {
  // Same as gql() but hits /api instead of /metadata
};
```

---

## Routing Changes

Update `AppRouter.tsx` to add three new routes:

```tsx
{ path: '/contacts',  element: <ProtectedLayout><ContactsListPage /></ProtectedLayout> },
{ path: '/companies', element: <ProtectedLayout><CompaniesListPage /></ProtectedLayout> },
{ path: '/deals',     element: <ProtectedLayout><DealsListPage /></ProtectedLayout> },
```

The sidebar already has these entries (added in Phase 0). The routes will activate them.

---

## Design Token Additions

No new CSS custom properties needed. All components use existing tokens. Some composite style references:

| Usage | Tokens Used |
|-------|-------------|
| Table header bg | `neutral1` |
| Table header border | `neutral3` (2px bottom) |
| Row divider | `neutral2` (1px bottom) |
| Row hover | `brandPrimaryLight` |
| Selected row | `brandPrimaryLight` |
| Sort icon active | `brandPrimary` |
| Sort icon inactive | `neutral4` |
| Search icon | `textPlaceholder` |
| Pagination active page | `brandPrimary` bg, `textInverse` text |
| Empty state icon | `textPlaceholder` |

---

## Accessibility Checklist

Per [SLDS 2 Data Table Accessibility](https://www.lightningdesignsystem.com/components/data-tables/) and WCAG 2.1 AA:

- [ ] DataTable uses `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>` (semantic HTML)
- [ ] `<th scope="col">` for column headers
- [ ] Sort controls are `<button>` elements (keyboard accessible)
- [ ] Sort state communicated via `aria-sort="ascending"` / `"descending"` / `"none"` on `<th>`
- [ ] Select-all checkbox has `aria-label="Select all rows"`
- [ ] Individual row checkboxes have `aria-label="Select {record name}"`
- [ ] Loading state: `aria-busy="true"` on `<table>`, Spinner has `role="status"` and `aria-label="Loading"`
- [ ] Empty state uses `role="status"` for screen-reader announcement
- [ ] Pagination: `<nav aria-label="Pagination">`, buttons with `aria-label` for prev/next/page
- [ ] Current page button has `aria-current="page"`
- [ ] Search input has `role="searchbox"` and `aria-label`
- [ ] All interactive elements reachable via Tab key
- [ ] Focus visible on all interactive elements (browser default + custom ring)
- [ ] Select component uses native `<select>` (fully accessible by default)

---

## File Structure Summary

```
packages/twenty-eds/src/
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
│   └── index.ts            ← updated barrel
├── hooks/
│   ├── useAuth.tsx
│   └── useRecordList.ts    ← new
├── pages/
│   ├── ContactsListPage.tsx   ← new
│   ├── CompaniesListPage.tsx  ← new
│   ├── DealsListPage.tsx      ← new
│   ├── DashboardPage.tsx
│   ├── LoginPage.tsx
│   └── ProfileSettingsPage.tsx
├── utils/
│   └── api.ts              ← extended
└── AppRouter.tsx            ← updated
```

---

## Definition of Done (Per EDS-MIGRATION.md)

1. ✅ All data loaded via GraphQL (same API as Twenty)
2. ✅ Read-only listing (CRUD deferred to Phase 3)
3. ✅ Components use only EDS design tokens
4. ✅ Accessibility: keyboard navigable, ARIA attributes correct
5. ✅ Responsive: works on tablet (768px) and desktop (1280px+)
6. ✅ Routes added to AppRouter
7. ✅ Documented in EDS-COMPONENTS.md
