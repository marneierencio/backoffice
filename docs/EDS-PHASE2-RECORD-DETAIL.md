# EDS Phase 2 — Record Detail: Design & Implementation Plan

This document specifies the components, behaviors, tokens, and page structure for Phase 2 of the EDS migration (Record Detail). All designs follow [SLDS 2](https://www.lightningdesignsystem.com/) principles adapted for React, using EDS design tokens (`--eds-g-*`).

---

## Table of Contents

1. [Scope](#scope)
2. [New Components](#new-components)
   - [Avatar](#avatar)
   - [Tabs](#tabs)
   - [Modal](#modal)
   - [Toast (Notification System)](#toast-notification-system)
   - [InlineEdit](#inlineedit)
   - [RecordHeader](#recordheader)
   - [PropertyBox](#propertybox)
   - [FieldRenderer](#fieldrenderer)
   - [RelationCard](#relationcard)
   - [Timeline](#timeline)
3. [New Hooks](#new-hooks)
   - [useRecordDetail](#userecorddetail)
   - [useRecordUpdate](#userecordupdate)
   - [useToast](#usetoast)
4. [New Icon Additions](#new-icon-additions)
5. [Pages](#pages)
   - [RecordShowPage (generic)](#recordshowpage-generic)
   - [ContactDetailPage](#contactdetailpage)
   - [CompanyDetailPage](#companydetailpage)
   - [DealDetailPage](#dealdetailpage)
6. [GraphQL Queries & Mutations](#graphql-queries--mutations)
7. [Routing Changes](#routing-changes)
8. [Design Token Additions](#design-token-additions)
9. [Accessibility Checklist](#accessibility-checklist)
10. [File Structure Summary](#file-structure-summary)
11. [Definition of Done](#definition-of-done)

---

## Scope

Phase 2 delivers the **Record Detail (Show) Page** for core CRM objects. Users can:

- View full details of a single record (person, company, opportunity)
- Edit fields inline (click-to-edit pattern)
- Navigate between tabs (Details, Timeline, Notes, Tasks, Emails)
- See related records (relations) in collapsible card sections
- See an avatar + name in the record header with breadcrumb navigation
- Receive toast feedback after save/error actions
- Open modals (e.g. confirmations, future use in Phase 3)

Navigation from list pages: clicking a row in the DataTable navigates to the record detail.

---

## New Components

### Avatar

> SLDS 2 reference: [Avatar](https://www.lightningdesignsystem.com/components/avatar/)

**File:** `src/components/Avatar/Avatar.tsx`

```tsx
type AvatarType = 'user' | 'entity';

type AvatarSize = 'x-small' | 'small' | 'medium' | 'large';

type AvatarProps = {
  name: string;                      // Used for initials fallback + alt text
  src?: string;                      // Image URL
  type?: AvatarType;                 // 'user' (circle) or 'entity' (rounded square)
  size?: AvatarSize;                 // default 'medium'
  className?: string;
  style?: React.CSSProperties;
};
```

**Visual spec:**
- **Sizes:** x-small=20px, small=24px, medium=32px, large=48px
- **Shape:** `user` → `border-radius: 50%`; `entity` → `border-radius: radiusMedium` (4px)
- **Image mode:** `<img>` fills container, `object-fit: cover`
- **Initials fallback:** Two letters extracted from name — for user: first letters of first+last name; for entity: first two letters of single word. `backgroundColor: brandPrimary`, `color: textInverse`, `fontWeight: fontWeightBold`, centered
- **Icon fallback:** When no name provided, render default SVG user/entity icon
- **Focus ring:** When interactive (wrapped in button/link), standard focus ring

---

### Tabs

> SLDS 2 reference: [Tabs](https://www.lightningdesignsystem.com/components/tabs/)

**File:** `src/components/Tabs/Tabs.tsx`

```tsx
type TabItem = {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: number;                    // Count badge (e.g. "3" for tasks)
  disabled?: boolean;
};

type TabsProps = {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  size?: 'default' | 'medium' | 'large';  // default 'default'
  children?: React.ReactNode;         // Tab panel content
};
```

**Anatomy:**
| # | Element | Description |
|---|---------|-------------|
| 1 | Tab Bar | `<div role="tablist">` horizontal row of tabs |
| 2 | Tab | `<button role="tab">` individual tab button |
| 3 | Label | Text label for the tab |
| 4 | Icon | Optional leading icon |
| 5 | Badge | Optional count overlay |
| 6 | Active Indicator | Bottom border on the active tab |
| 7 | Tab Panel | `<div role="tabpanel">` content area below tabs |

**Visual spec:**
- **Tab bar:** `border-bottom: 2px solid neutral2`
- **Tab (default state):** `padding: spacingXSmall spacingMedium`, `color: textPlaceholder`, `fontSizeMedium`, no bottom border
- **Tab (hover):** `color: textDefault`, faint underline `border-bottom: 3px solid neutral3`
- **Tab (active):** `color: brandPrimary`, `fontWeight: fontWeightMedium`, `border-bottom: 3px solid brandPrimary`
- **Tab (focus):** standard focus ring, tab also shows selected state
- **Tab (disabled):** `color: textDisabled`, `cursor: not-allowed`, no hover effect
- **Badge:** Small pill next to label, `backgroundColor: neutral2`, `color: textDefault`, `fontSize: fontSizeXSmall`, `border-radius: radiusPill`, `padding: 0 spacingXXSmall`
- **Sizes:** default height ~40px, medium ~44px, large ~48px (affected by padding and font size)

**Behaviors:**
- Clicking a tab fires `onChange` and switches the active indicator
- Arrow keys navigate between tabs when focused in the tablist
- `Home`/`End` keys jump to first/last tab
- Only the active tab is in tab order (`tabIndex={0}`); others have `tabIndex={-1}`
- Tab content loads only when the tab is activated (lazy rendering)

---

### Modal

> SLDS 2 reference: [Modals](https://www.lightningdesignsystem.com/components/modals/)

**File:** `src/components/Modal/Modal.tsx`

```tsx
type ModalSize = 'small' | 'medium' | 'large';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  tagline?: string;
  size?: ModalSize;                   // default 'medium'
  children?: React.ReactNode;         // Body content
  footer?: React.ReactNode;           // Footer with action buttons
  closeOnOverlayClick?: boolean;      // default true
  closeOnEscape?: boolean;            // default true
  'aria-label'?: string;              // Required if no title
};
```

**Anatomy:**
| # | Element | Description |
|---|---------|-------------|
| 1 | Backdrop | Semi-transparent overlay covering the page |
| 2 | Container | Centered dialog with white background |
| 3 | Header | Title + close button (×) in a flex row |
| 4 | Tagline | Optional subtitle below title |
| 5 | Body | Scrollable content area |
| 6 | Footer | Right-aligned action buttons |

**Visual spec:**
- **Backdrop:** `backgroundColor: rgba(0,0,0,0.5)`, `position: fixed`, full viewport, `z-index: zIndexModal`
- **Container:** `backgroundColor: neutral0`, `border-radius: radiusLarge`, `box-shadow: elevationModal`, centered vertically + horizontally
- **Sizes:** small=min(480px, 60vw), medium=min(640px, 70vw), large=min(960px, 90vw)
- **Max height:** `80vh`, body scrolls when overflowing
- **Header:** `padding: spacingMedium spacingLarge`, `border-bottom: 1px solid borderDefault`
- **Title:** `fontSize: fontSizeXLarge`, `fontWeight: fontWeightBold`, `color: textDefault`
- **Tagline:** `fontSize: fontSizeSmall`, `color: textPlaceholder`, `marginTop: spacingXXSmall`
- **Close button:** ghost icon button, top-right corner, `×` icon
- **Body:** `padding: spacingLarge`, `overflow-y: auto`, `flex: 1`
- **Footer:** `padding: spacingMedium spacingLarge`, `border-top: 1px solid borderDefault`, `text-align: right`, `gap: spacingXSmall`

**Behaviors:**
- Opens with a fade-in animation (`durationPromptly`, 200ms)
- Closes via: close button, overlay click (if enabled), Escape key (if enabled)
- Focus is trapped inside the modal when open (focus trap)
- Focus moves to the first focusable element or the close button on open
- On close, focus returns to the element that triggered the modal
- `aria-modal="true"`, `role="dialog"`, `aria-labelledby` pointing to title

---

### Toast (Notification System)

> SLDS 2 reference: [Toast](https://www.lightningdesignsystem.com/components/toast/)

**Files:**
- `src/components/Toast/Toast.tsx` — single toast component
- `src/components/Toast/ToastContainer.tsx` — positioned container for multiple toasts
- `src/components/Toast/ToastProvider.tsx` — React context provider

```tsx
type ToastVariant = 'success' | 'error' | 'warning' | 'info';

type ToastMode = 'dismissible' | 'sticky';

type ToastData = {
  id: string;
  variant: ToastVariant;
  message: string;
  detail?: string;
  link?: { label: string; href: string };
  mode?: ToastMode;                    // default: based on variant
  durationMs?: number;                 // override auto-dismiss time
};

type ToastProps = ToastData & {
  onClose: (id: string) => void;
};

type ToastContainerProps = {
  toasts: ToastData[];
  onClose: (id: string) => void;
};
```

**Visual spec:**
- **Container:** fixed to top center of viewport, `top: spacingLarge`, `z-index: zIndexToast`, `max-width: 640px`, stacks vertically with `gap: spacingXSmall`
- **Toast:** flex row, `min-height: 48px`, `border-radius: radiusMedium`, `box-shadow: elevationDropdown`
- **Variant colors:**
  | Variant | Background | Left border (4px) | Icon color |
  |---------|------------|-------------------|------------|
  | success | `successLight` | `success` | `success` |
  | error | `errorLight` | `error` | `error` |
  | warning | `warningLight` | `warning` | `warning` |
  | info | `infoLight` | `brandPrimary` | `brandPrimary` |
- **Icon:** Leading variant-specific icon (checkmark, error, warning, info), 20px
- **Message:** `fontSizeMedium`, `fontWeightMedium`, `color: textDefault`
- **Detail:** `fontSizeSmall`, `color: textLabel`, below message
- **Close button:** ghost `×` button, right side
- **Dismiss timing (SLDS 2 spec):**
  | Variant | Has link? | Default mode |
  |---------|-----------|-------------|
  | success | No | dismissible (4.8s) |
  | success | Yes | sticky |
  | error | — | sticky |
  | warning | — | sticky |
  | info | — | sticky |

**Animations:**
- Enter: slide down + fade in, `durationPromptly` (200ms)
- Exit: fade out + slide up, `durationQuickly` (100ms)

---

### InlineEdit

**File:** `src/components/InlineEdit/InlineEdit.tsx`

A click-to-edit component that renders a read-only value and switches to an input on click/Enter.

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
  fieldType?: FieldType;               // default 'text'
  label: string;                       // Accessible label
  placeholder?: string;
  readOnly?: boolean;
  saving?: boolean;
  error?: string;
  options?: Array<{ value: string; label: string }>;  // For fieldType='select'
  currencyCode?: string;               // For fieldType='currency'
  onSave: (newValue: string | number | boolean | null) => void;
  onCancel?: () => void;
};
```

**Visual spec (read mode):**
- Displays formatted value text, `color: textDefault`, `fontSize: fontSizeMedium`
- On hover: faint pencil icon appears, background changes to `neutral1`
- `cursor: pointer` (except when `readOnly`)
- Empty values show placeholder text in `color: textPlaceholder`

**Visual spec (edit mode):**
- Renders an appropriate `<input>` (or `<select>`) matching the `fieldType`
- Input styled matching the existing Input component tokens
- Shows a checkmark (save) and × (cancel) icon buttons below/beside the input
- Focus automatically placed in the input
- `Escape` cancels edit, `Enter` saves

**Behaviors:**
- Click or Enter → enter edit mode
- Save → calls `onSave`, shows saving spinner briefly, exits edit mode
- Cancel → reverts to read mode without saving
- Error → shows error text below the input in edit mode
- `readOnly` → no hover effect, no click-to-edit

---

### RecordHeader

**File:** `src/components/RecordHeader/RecordHeader.tsx`

The header section at the top of a record detail page, similar to SLDS Record Home.

```tsx
type RecordHeaderProps = {
  objectIcon?: React.ReactNode;        // Icon or emoji for the object type
  objectLabel: string;                 // e.g. "Contact", "Company"
  recordName: string;
  avatar?: {
    name: string;
    src?: string;
    type?: 'user' | 'entity';
  };
  breadcrumbs?: Array<{ label: string; href?: string }>;
  actions?: React.ReactNode;           // Right-side action buttons
  children?: React.ReactNode;          // Below the header (e.g. status badge)
};
```

**Visual spec:**
```
┌─────────────────────────────────────────────────────────────────────┐
│  Contacts > John Doe                    [Edit] [Delete] [⋮ More]   │
│  ┌────┐                                                             │
│  │ JD │  John Doe                                                   │
│  └────┘  Contact                                                    │
│          [Active badge]                                              │
└─────────────────────────────────────────────────────────────────────┘
```

- **Breadcrumbs:** `fontSize: fontSizeSmall`, `color: textLink`, separated by `›`, last item is plain text
- **Avatar:** `size: large` (48px), on the left
- **Record Name:** `fontSize: fontSizeXXLarge` (24px), `fontWeight: fontWeightBold`
- **Object Label:** `fontSize: fontSizeSmall`, `color: textPlaceholder`, below name
- **Actions:** flex row of buttons, right-aligned
- **Container:** `padding: spacingLarge`, `border-bottom: 1px solid borderDefault`, `backgroundColor: neutral0`

---

### PropertyBox

**File:** `src/components/PropertyBox/PropertyBox.tsx`

A vertical list of label–value pairs for record fields that can be edited inline.

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
  saving?: Record<string, boolean>;    // Per-field saving state
  errors?: Record<string, string>;     // Per-field error messages
  compact?: boolean;                   // Reduce vertical spacing
};
```

**Visual spec:**
- Each field row: flex row, `min-height: 36px`, `padding: spacingXSmall 0`
- **Label:** `width: 140px`, `flex-shrink: 0`, `fontSize: fontSizeSmall`, `fontWeight: fontWeightMedium`, `color: textLabel`, `text-align: right`, `padding-right: spacingMedium`
- **Value:** `flex: 1`, `max-width: 300px`, renders `InlineEdit` component
- **Divider:** `border-bottom: 1px solid neutral2` between rows (unless compact)
- **Compact mode:** tighter vertical padding, no dividers

---

### FieldRenderer

**File:** `src/components/FieldRenderer/FieldRenderer.tsx`

Renders a field value in read mode with proper formatting based on type.

```tsx
type FieldRendererProps = {
  value: unknown;
  fieldType: FieldType;
  currencyCode?: string;
  dateFormat?: string;                  // default locale short date
  emptyText?: string;                  // default '—'
};
```

**Formatting rules:**
| Type | Display |
|------|---------|
| `text` | Plain text, truncated with ellipsis if too long |
| `email` | `<a href="mailto:...">` with link color |
| `phone` | `<a href="tel:...">` with link color |
| `number` | Locale-formatted number |
| `date` | `toLocaleDateString()` |
| `currency` | Locale-formatted with currency symbol (amount in micros / 1_000_000) |
| `url` | `<a href="..." target="_blank">` with external link icon |
| `select` | Text or Badge depending on context |
| `boolean` | Checkbox (read-only) or "Yes"/"No" text |

---

### RelationCard

**File:** `src/components/RelationCard/RelationCard.tsx`

A collapsible card showing related records, used in the record detail page below the fields.

```tsx
type RelationRecord = {
  id: string;
  name: string;
  avatar?: { name: string; src?: string };
  subtitle?: string;
};

type RelationCardProps = {
  title: string;                        // e.g. "Company", "Contacts"
  relation: 'one' | 'many';
  records: RelationRecord[];
  loading?: boolean;
  onRecordClick?: (id: string) => void;
  emptyMessage?: string;
  maxVisible?: number;                  // default 5 for 'many'
  showMoreLabel?: string;               // default "Show all"
  defaultExpanded?: boolean;            // default true
};
```

**Visual spec:**
- Uses `Card` component as the outer container
- **Header:** title with count badge for `many` relations, collapsible chevron
- **Single relation (one):** avatar + name + subtitle, clickable
- **Multiple relations (many):** vertical list, each item has avatar + name + subtitle
- **Show more:** link button at the bottom when `records.length > maxVisible`
- **Empty:** subtle message "No related records"
- **Loading:** Spinner centered in the card body

---

### Timeline

**File:** `src/components/Timeline/Timeline.tsx`

A vertical timeline showing recent activities for a record.

```tsx
type TimelineEvent = {
  id: string;
  type: 'created' | 'updated' | 'note' | 'email' | 'task' | 'call' | 'event';
  title: string;
  description?: string;
  timestamp: string;                    // ISO date
  author?: { name: string; avatarUrl?: string };
  icon?: React.ReactNode;
};

type TimelineProps = {
  events: TimelineEvent[];
  loading?: boolean;
  maxVisible?: number;                  // default 10
  onShowMore?: () => void;
  emptyMessage?: string;
};
```

**Visual spec:**
- Vertical line: `2px solid neutral2`, left margin at 20px
- Each event: dot (8px circle, `brandPrimary` or type-specific color) on the line + content card to the right
- **Content:** `fontSize: fontSizeMedium`, `color: textDefault`
- **Timestamp:** `fontSize: fontSizeXSmall`, `color: textPlaceholder`, formatted as relative time ("2 hours ago", "Yesterday")
- **Author:** small avatar (x-small) + name inline with timestamp
- **Loading:** spinner at the bottom
- **Empty:** EmptyState component with "No activity yet" message

---

## New Hooks

### useRecordDetail

**File:** `src/hooks/useRecordDetail.ts`

Fetches a single record by ID using the Twenty workspace GraphQL API.

```tsx
type UseRecordDetailOptions = {
  objectNameSingular: string;          // e.g. 'person', 'company', 'opportunity'
  objectNamePlural: string;            // e.g. 'people', 'companies', 'opportunities'
  recordId: string;
  fields: string;                      // GraphQL field selection
};

type UseRecordDetailReturn<TRecord> = {
  record: TRecord | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
};
```

**Implementation:**
- Builds a dynamic GraphQL query: `query FindOne<Object>($id: UUID!) { <singular>(filter: { id: { eq: $id } }) { ...fields } }`
- Calls `gqlWorkspace` on mount and when `recordId` changes
- Returns strongly-typed record or null
- Exposes refresh function for re-fetching after mutations

---

### useRecordUpdate

**File:** `src/hooks/useRecordUpdate.ts`

Mutation hook for updating a single field on a record.

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

**Implementation:**
- Builds a mutation: `mutation Update<Object>($id: UUID!, $input: <Object>UpdateInput!) { update<Object>(id: $id, data: $input) { id } }`
- The `fieldName` can be a nested path (e.g. `name.firstName`) — the hook builds the proper nested input object
- Returns success/error result for the calling component to show toast feedback

---

### useToast

**File:** `src/hooks/useToast.ts`

Hook that provides access to the toast notification system via React context.

```tsx
type UseToastReturn = {
  showToast: (toast: Omit<ToastData, 'id'>) => void;
  showSuccess: (message: string, detail?: string) => void;
  showError: (message: string, detail?: string) => void;
  showWarning: (message: string, detail?: string) => void;
  showInfo: (message: string, detail?: string) => void;
};
```

**Implementation:**
- Consumed from `ToastProvider` context
- `showToast` generates a unique ID and adds the toast to state
- Convenience methods map to specific variants
- Auto-dismiss timers managed internally by the provider

---

## New Icon Additions

The following icons need to be added to the existing `Icon` component:

| Icon Name | Usage | SVG Source |
|-----------|-------|-----------|
| `edit` | Inline edit pencil indicator | Pencil icon |
| `save` | Save action in inline edit | Checkmark circle icon |
| `cancel` | Cancel action in inline edit | X circle icon |
| `user` | Default user avatar fallback | Person silhouette |
| `company` | Default entity avatar fallback | Building icon |
| `chevron-up` | Collapsible section toggle | Upward chevron |
| `external-link` | URL field links | Arrow pointing out of box |
| `more` | More actions menu | Three horizontal dots |
| `email` | Email timeline event | Envelope icon |
| `phone-icon` | Phone field / call event | Phone handset icon |
| `note` | Note timeline event | Document icon |
| `task` | Task timeline event | Checkbox/task icon |
| `calendar` | Calendar event | Calendar icon |
| `clock` | Timestamp display | Clock icon |
| `info` | Info toast variant icon | Info circle |
| `warning` | Warning toast variant icon | Warning triangle |
| `error-icon` | Error toast variant icon | Error circle |
| `success` | Success toast variant icon | Checkmark circle |
| `arrow-left` | Back navigation | Left arrow |

---

## Pages

### RecordShowPage (generic)

**File:** `src/pages/RecordShowPage.tsx`

A generic wrapper that resolves the `objectNameSingular` and `recordId` from the URL, then renders the appropriate detail component.

```tsx
// Route: /contacts/:recordId, /companies/:recordId, /deals/:recordId
// The page determines which detail view to render based on the matched route.
```

### ContactDetailPage

**File:** `src/pages/ContactDetailPage.tsx`

**Object:** `person` / `people`

**Header fields:**
- Avatar: `name.firstName + name.lastName` initials, type `user`
- Record Name: `name.firstName + name.lastName`
- Object Label: "Contact"

**Detail tab — fields:**
| Label | Field Path | Type | Editable |
|-------|-----------|------|----------|
| First Name | `name.firstName` | text | Yes |
| Last Name | `name.lastName` | text | Yes |
| Email | `emails.primaryEmail` | email | Yes |
| Phone | `phones.primaryPhoneNumber` | phone | Yes |
| City | `city` | text | Yes |
| Job Title | `jobTitle` | text | Yes |
| Created | `createdAt` | date | No |

**Relations:**
- Company (one-to-one via `company`)

**Tabs:**
| Tab | Content |
|-----|---------|
| Details | PropertyBox + RelationCard (Company) |
| Timeline | Timeline component (future: populated with activities) |
| Notes | Placeholder for Phase 3 |
| Tasks | Placeholder for Phase 3 |

**GraphQL fields:**
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

**File:** `src/pages/CompanyDetailPage.tsx`

**Object:** `company` / `companies`

**Header fields:**
- Avatar: company `name`, type `entity`
- Record Name: `name`
- Object Label: "Company"

**Detail tab — fields:**
| Label | Field Path | Type | Editable |
|-------|-----------|------|----------|
| Name | `name` | text | Yes |
| Domain | `domainName.primaryLinkUrl` | url | Yes |
| Employees | `employees` | number | Yes |
| Address | `address.addressCity` | text | Yes |
| Created | `createdAt` | date | No |

**Relations:**
- Contacts (one-to-many via `people`)

**Tabs:**
| Tab | Content |
|-----|---------|
| Details | PropertyBox + RelationCard (Contacts) |
| Timeline | Timeline component |
| Notes | Placeholder |
| Tasks | Placeholder |

**GraphQL fields:**
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

**File:** `src/pages/DealDetailPage.tsx`

**Object:** `opportunity` / `opportunities`

**Header fields:**
- Avatar: deal `name`, type `entity`
- Record Name: `name`
- Object Label: "Deal"

**Detail tab — fields:**
| Label | Field Path | Type | Editable |
|-------|-----------|------|----------|
| Name | `name` | text | Yes |
| Amount | `amount.amountMicros` | currency | Yes |
| Stage | `stage` | select | Yes |
| Close Date | `closeDate` | date | Yes |
| Created | `createdAt` | date | No |

**Relations:**
- Company (one-to-one via `company`)

**Tabs:**
| Tab | Content |
|-----|---------|
| Details | PropertyBox + RelationCard (Company) |
| Timeline | Timeline component |
| Notes | Placeholder |
| Tasks | Placeholder |

**GraphQL fields:**
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

## GraphQL Queries & Mutations

### Find One Record

```graphql
query FindOnePerson($filter: PersonFilterInput) {
  person(filter: $filter) {
    ...fields
  }
}
# filter: { id: { eq: $recordId } }
```

### Update Record

```graphql
mutation UpdatePerson($idToUpdate: ID!, $input: PersonUpdateInput!) {
  updatePerson(id: $idToUpdate, data: $input) {
    id
  }
}
```

The update hook builds the mutation dynamically per object type (e.g. `updatePerson`, `updateCompany`, `updateOpportunity`).

---

## Routing Changes

Update `AppRouter.tsx` to add detail routes:

```tsx
{ path: '/contacts/:recordId', element: <ProtectedLayout><ContactDetailPage /></ProtectedLayout> },
{ path: '/companies/:recordId', element: <ProtectedLayout><CompanyDetailPage /></ProtectedLayout> },
{ path: '/deals/:recordId',     element: <ProtectedLayout><DealDetailPage /></ProtectedLayout> },
```

Update list pages to navigate to detail on row click:

```tsx
onRowClick={(record) => navigate(`#/contacts/${record.id}`)}
```

---

## Design Token Additions

No new CSS custom properties needed. All components use existing tokens with these composite mappings:

| Usage | Tokens Used |
|-------|-------------|
| Avatar initials bg | `brandPrimary` |
| Avatar initials text | `textInverse` |
| Tab active indicator | `brandPrimary` (3px bottom border) |
| Tab hover indicator | `neutral3` (3px bottom border) |
| Tab bar border | `neutral2` (2px bottom border) |
| Modal backdrop | `rgba(0,0,0,0.5)` |
| Modal shadow | `elevationModal` |
| Toast success bg | `successLight` / left border `success` |
| Toast error bg | `errorLight` / left border `error` |
| Toast warning bg | `warningLight` / left border `warning` |
| Toast info bg | `infoLight` / left border `brandPrimary` |
| InlineEdit hover bg | `neutral1` |
| Property label color | `textLabel` |
| Timeline line | `neutral2` (2px) |
| Timeline dot | `brandPrimary` (8px circle) |
| Breadcrumb separator | `textPlaceholder` |
| Breadcrumb link | `textLink` |

---

## Accessibility Checklist

Per SLDS 2 guidelines and WCAG 2.1 AA:

### Tabs
- [ ] `role="tablist"` on container, `role="tab"` on each tab, `role="tabpanel"` on content
- [ ] `aria-selected="true"` on active tab, `"false"` on others
- [ ] `aria-controls` on tab pointing to panel, `aria-labelledby` on panel pointing to tab
- [ ] Arrow key navigation between tabs
- [ ] Only active tab in tab order (`tabIndex={0}`)
- [ ] `aria-disabled="true"` on disabled tabs

### Modal
- [ ] `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing to title
- [ ] Focus trapped inside modal when open
- [ ] Focus moves to first focusable element on open
- [ ] Focus returns to trigger element on close
- [ ] Escape key closes modal
- [ ] Backdrop prevents interaction with background

### Toast
- [ ] `role="status"` and `aria-live="polite"` on toast container
- [ ] `aria-atomic="true"` so screen readers announce the whole toast
- [ ] Close button has `aria-label="Close notification"`
- [ ] Auto-dismiss timers pause on hover/focus

### Avatar
- [ ] `alt` text derived from `name` prop (or empty if decorative)
- [ ] When interactive (button/link), the wrapping element has proper role/label

### InlineEdit
- [ ] `role="button"` in read mode with `aria-label="Edit {label}"`
- [ ] Input has `aria-label` matching the field label
- [ ] Save/Cancel buttons have descriptive `aria-label`
- [ ] Error messages linked via `aria-describedby`

### Record Page
- [ ] `<h1>` for record name
- [ ] Breadcrumbs use `<nav aria-label="Breadcrumb">` + `<ol>`
- [ ] All interactive elements keyboard-accessible
- [ ] Color contrast 4.5:1 minimum

---

## File Structure Summary

```
packages/twenty-eds/src/
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
│   └── index.ts            ← updated barrel
├── hooks/
│   ├── useAuth.tsx
│   ├── useRecordList.ts
│   ├── useRecordDetail.ts  ← new
│   ├── useRecordUpdate.ts  ← new
│   └── useToast.ts         ← new
├── pages/
│   ├── ContactsListPage.tsx
│   ├── CompaniesListPage.tsx
│   ├── DealsListPage.tsx
│   ├── ContactDetailPage.tsx   ← new
│   ├── CompanyDetailPage.tsx   ← new
│   ├── DealDetailPage.tsx      ← new
│   ├── DashboardPage.tsx
│   ├── LoginPage.tsx
│   └── ProfileSettingsPage.tsx
├── utils/
│   └── api.ts
└── AppRouter.tsx            ← updated
```

---

## Definition of Done (Per EDS-MIGRATION.md)

1. ✅ All data loaded via GraphQL (same API as Twenty)
2. ✅ Field editing via inline edit (saves via GraphQL mutations)
3. ✅ Components use only EDS design tokens
4. ✅ Accessibility: keyboard navigable, ARIA attributes correct
5. ✅ Responsive: works on tablet (768px) and desktop (1280px+)
6. ✅ Routes added to AppRouter
7. ✅ Documented in EDS-COMPONENTS.md
8. ✅ Toast feedback on save/error actions
9. ✅ Navigation from list pages to detail pages

---

## Implementation Order

The recommended implementation sequence (component dependencies):

1. **Icons** — new icons needed by all subsequent components
2. **Avatar** — standalone, used by RecordHeader and RelationCard
3. **Tabs** — standalone, used by all detail pages
4. **Modal** — standalone, foundation for future phases
5. **Toast + ToastProvider + useToast** — notification system
6. **FieldRenderer** — read-only field display
7. **InlineEdit** — inline editing (depends on FieldRenderer)
8. **PropertyBox** — field list (depends on InlineEdit)
9. **RecordHeader** — page header (depends on Avatar)
10. **RelationCard** — related records display (depends on Avatar, Card)
11. **Timeline** — activity timeline (depends on Avatar)
12. **useRecordDetail** — data fetching hook
13. **useRecordUpdate** — mutation hook
14. **ContactDetailPage** — first detail page (integrates all)
15. **CompanyDetailPage** — second detail page
16. **DealDetailPage** — third detail page
17. **AppRouter + list page updates** — routing and navigation
18. **EDS-COMPONENTS.md update** — documentation
