# EDS Phase 3 — Core CRM Actions: Design & Implementation Plan

This document specifies the components, behaviors, tokens, and page structure for Phase 3 of the EDS migration (Core CRM Actions). All designs follow [SLDS 2](https://www.lightningdesignsystem.com/) principles adapted for React, using EDS design tokens (`--eds-g-*`).

---

## Table of Contents

1. [Scope](#scope)
2. [New Components](#new-components)
   - [FormElement](#formelement)
   - [Textarea](#textarea)
   - [FileSelector](#fileselector)
   - [Combobox](#combobox)
   - [ConfirmDialog](#confirmdialog)
   - [RecordForm](#recordform)
3. [Updated Components](#updated-components)
   - [Icon (new icons)](#icon-new-icons)
   - [InlineEdit (relationship support)](#inlineedit-relationship-support)
4. [New Hooks](#new-hooks)
   - [useRecordCreate](#userecordcreate)
   - [useRecordDelete](#userecorddelete)
   - [useFileUpload](#usefileupload)
   - [useRelationSearch](#userelationsearch)
5. [Pages](#pages)
   - [CreateContactPage](#createcontactpage)
   - [CreateCompanyPage](#createcompanypage)
   - [CreateDealPage](#createdealpage)
6. [GraphQL Queries & Mutations](#graphql-queries--mutations)
7. [Routing Changes](#routing-changes)
8. [Design Token Additions](#design-token-additions)
9. [Accessibility Checklist](#accessibility-checklist)
10. [File Structure Summary](#file-structure-summary)
11. [Definition of Done](#definition-of-done)

---

## Scope

Phase 3 delivers **Core CRM Actions** for the three primary objects (contacts, companies, opportunities). Users can:

- Create a new record via a dedicated form page (stacked form layout)
- Edit an existing record in-place (click-to-edit, already via InlineEdit from Phase 2) AND via a full edit-mode form
- Delete a record with a destructive confirmation dialog
- Set relationship fields (e.g. assign a company to a contact) via a searchable combobox
- Upload files (attachments) to a record

Navigation from list pages: a "New" button in the `PageHeader` opens the create form. From detail pages: "Edit" toggles full-form edit mode and "Delete" triggers the confirmation dialog.

---

## New Components

### FormElement

> SLDS 2 reference: [Form Element](https://www.lightningdesignsystem.com/components/form-element/)

**File:** `src/components/FormElement/FormElement.tsx`

The foundational wrapper that provides structure (label, help text, validation message) around any input control. All form fields use this wrapper.

```tsx
type FormElementLayout = 'stacked' | 'horizontal';

type FormElementProps = {
  id: string;                          // Unique ID, used for label-input association
  label: string;                       // Field label text
  required?: boolean;                  // Shows red asterisk, marks field required
  helpText?: string;                   // Tooltip/help text shown via info icon
  error?: string;                      // Validation error message (red text below input)
  layout?: FormElementLayout;          // 'stacked' (default) or 'horizontal'
  children: React.ReactNode;           // The input control (Input, Textarea, Select, etc.)
  className?: string;
  style?: React.CSSProperties;
};
```

**Anatomy (SLDS 2):**

| # | Element | Description |
|---|---------|-------------|
| 1 | Required Asterisk | Red `*` before label when `required=true` |
| 2 | Field Label | `<label>` describing the purpose of the input |
| 3 | Help Text Icon | Info icon that triggers a tooltip with `helpText` |
| 4 | Input Component | Child element (the actual control) |
| 5 | Supporting Text | Below input; shows `error` message or helper text |

**Visual spec:**
- **Stacked layout (default):** Label sits above the input; full width. `marginBottom: spacingMedium` between form elements.
- **Horizontal layout:** Label left (33% width), control right (67% width). Items vertically centered.
- **Label:** `fontSize: fontSizeMedium`, `fontWeight: fontWeightMedium`, `color: textLabel`, `marginBottom: spacingXXSmall` (stacked) or inline (horizontal).
- **Required asterisk:** `color: error`, placed before label text. `aria-hidden="true"` (screen readers get `aria-required` on the input instead).
- **Error state:** Input border turns `borderError`. Error message below: `fontSize: fontSizeSmall`, `color: error`, prefixed with error icon. Associated via `aria-describedby`.
- **Help icon:** 14px info icon, `color: textPlaceholder`, hover reveals tooltip. `aria-label="Help for {label}"`.

**Behaviors:**
- When `error` is set, the supporting text area shows the message with `aria-live="assertive"` for screen readers.
- The `<label>` uses `htmlFor={id}` so clicking the label focuses the input.
- Tab order follows natural document order.

---

### Textarea

> SLDS 2 reference: [Textarea](https://www.lightningdesignsystem.com/components/textarea/)

**File:** `src/components/Textarea/Textarea.tsx`

Multi-line text input for descriptions, notes, and comments.

```tsx
type TextareaProps = {
  id?: string;
  value: string;
  placeholder?: string;
  label?: string;                      // If used standalone (without FormElement wrapper)
  rows?: number;                       // Default: 4
  maxLength?: number;                  // Optional character limit
  disabled?: boolean;
  readOnly?: boolean;
  error?: boolean;                     // Visual error state (border + icon)
  resize?: 'none' | 'vertical' | 'both';  // Default: 'vertical'
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLTextAreaElement>) => void;
  'aria-label'?: string;
  'aria-describedby'?: string;
};
```

**Visual spec:**
- `width: 100%`, `minHeight: rows * lineHeight`, default `rows: 4`.
- Border: `1px solid borderInput`, focus: `borderFocus` with `box-shadow: 0 0 0 1px brandPrimary`.
- Error: `borderError` border, no shadow.
- `padding: spacingXSmall spacingSmall`, `borderRadius: radiusMedium`.
- `fontFamily: fontFamilyBase`, `fontSize: fontSizeMedium`, `color: textDefault`.
- Disabled: `backgroundColor: neutral1`, `color: textDisabled`, `cursor: not-allowed`.
- Read-only: `backgroundColor: transparent`, `border: none`, `padding: 0`.
- Grabber (resize handle): native browser resize handle, controlled via `resize` prop.
- Character counter (when `maxLength` set): displayed below right-aligned, `fontSize: fontSizeSmall`, `color: textPlaceholder`. Turns `color: error` when at/over limit.

**States:**
1. Default — gray border, placeholder visible
2. Active/Focus — blue border + focus ring, placeholder hidden
3. Disabled — gray background, no focus
4. Read-only — no border, plain text appearance
5. Error — red border, error message below

---

### FileSelector

> SLDS 2 reference: [File Selector](https://www.lightningdesignsystem.com/components/file-selector/)

**File:** `src/components/FileSelector/FileSelector.tsx`

Upload files from a local device. Supports drag-and-drop and click-to-browse.

```tsx
type FileSelectorProps = {
  label?: string;                      // Field label (e.g. "Attachments")
  accept?: string;                     // File type filter (e.g. "image/*,.pdf")
  multiple?: boolean;                  // Allow multiple files (default: false)
  maxSizeMB?: number;                  // Max file size in MB (default: 10)
  disabled?: boolean;
  files: File[];                       // Currently selected files (controlled)
  uploading?: boolean;                 // Show upload spinner
  error?: string;                      // Error message
  onChange: (files: File[]) => void;   // Called when files are selected/dropped
  onRemove?: (index: number) => void;  // Called when a file is removed from list
  'aria-label'?: string;
};
```

**Anatomy (SLDS 2):**

| # | Element | Description |
|---|---------|-------------|
| 1 | Field Label | Describes purpose of the file selector |
| 2 | Drop Zone | Dashed-border area inviting drag-and-drop |
| 3 | Upload Button | Opens file browser |
| 4 | Instructions | "Or drag files here" helper text |
| 5 | File List | Selected files shown as removable pills |
| 6 | Supporting Text | Error/validation messages |

**Visual spec:**
- **Drop zone:** Dashed border `2px dashed borderDefault`, `borderRadius: radiusMedium`, `padding: spacingLarge`, centered content.
- **Drop zone (hover/drag-over):** `borderColor: brandPrimary`, `backgroundColor: brandPrimaryLight` (faint blue).
- **Drop zone (drag-over error):** `borderColor: error`, error icon visible.
- **Upload button:** Brand outline variant, centered in drop zone.
- **Instructions:** `fontSize: fontSizeSmall`, `color: textPlaceholder`, below button.
- **File list:** Each file as a pill/chip with filename + size + remove (×) button. `backgroundColor: neutral1`, `borderRadius: radiusPill`, `padding: spacingXXSmall spacingSmall`.
- **Uploading state:** Spinner replaces button text, progress shown.
- **Disabled:** `opacity: 0.5`, `cursor: not-allowed`, drop zone non-interactive.
- **Error:** `borderColor: borderError`, error message below in red.

**Behaviors:**
- Click on drop zone or button → opens native file picker.
- Drag file over drop zone → visual highlight (border + bg change).
- Drop files → validates size/type, calls `onChange`.
- Files exceeding `maxSizeMB` or not matching `accept` → show error, reject file.
- Remove button on each file pill calls `onRemove(index)`.
- When `uploading=true`, show spinner inside drop zone area.
- `aria-label` on the hidden file input for screen readers.

---

### Combobox

> SLDS 2 reference: [Combobox](https://www.lightningdesignsystem.com/components/combobox/)

**File:** `src/components/Combobox/Combobox.tsx`

A searchable select dropdown used primarily for relationship fields (e.g., selecting a company for a contact).

```tsx
type ComboboxOption = {
  id: string;
  label: string;
  sublabel?: string;                   // Secondary line (e.g. domain name)
  avatarUrl?: string;                  // Optional avatar/icon
};

type ComboboxProps = {
  id?: string;
  label?: string;
  placeholder?: string;
  value: ComboboxOption | null;        // Currently selected option
  options: ComboboxOption[];           // Available options (can be live-searched)
  loading?: boolean;                   // Show spinner in dropdown
  disabled?: boolean;
  readOnly?: boolean;
  error?: string;
  searchQuery: string;                 // Controlled search input
  onSearchChange: (query: string) => void;   // Called as user types
  onSelect: (option: ComboboxOption | null) => void;  // Called on selection
  onClear?: () => void;               // Called when selection is cleared
  emptyMessage?: string;              // Shown when no options match
  'aria-label'?: string;
  'aria-describedby'?: string;
};
```

**Anatomy (SLDS 2):**

| # | Element | Description |
|---|---------|-------------|
| 1 | Input | Text input for searching/filtering |
| 2 | Selected Pill | Shows current selection as a pill (when value set) |
| 3 | Dropdown Listbox | `<ul role="listbox">` showing filtered options |
| 4 | Option | `<li role="option">` with label, sublabel, and optional avatar |
| 5 | Clear Button | × button to remove current selection |
| 6 | Loading Spinner | Shown inside dropdown when loading options |

**Visual spec:**
- **Input:** Same dimensions as standard Input (height 36px, same borders/radius).
- **Input with selection:** Shows selected option label as text; clear (×) button on right.
- **Dropdown:** `position: absolute`, `zIndex: zIndexDropdown`, `backgroundColor: neutral0`, `border: 1px solid borderDefault`, `borderRadius: radiusMedium`, `boxShadow: elevationDropdown`, `maxHeight: 240px`, `overflowY: auto`.
- **Option (default):** `padding: spacingXSmall spacingSmall`, `fontSize: fontSizeMedium`. Avatar (20px, rounded) on left if present.
- **Option (hover):** `backgroundColor: neutral1`.
- **Option (focused):** `backgroundColor: brandPrimaryLight`, `outline: none`. Indicated by `aria-activedescendant`.
- **Option (selected):** Check icon on right, `fontWeight: fontWeightMedium`.
- **Empty state:** Centered text "No results found", `color: textPlaceholder`, `padding: spacingMedium`.
- **Loading:** Spinner centered in dropdown with "Searching..." text.

**Behaviors:**
- Typing in the input calls `onSearchChange` (debounced externally by the hook).
- Arrow Down/Up navigates options. Enter selects highlighted option. Escape closes dropdown.
- Click on option selects it and closes dropdown.
- When `value` is set, the input shows the label read-only. Click on clear (×) resets.
- Dropdown opens on focus/click when no value is set.
- `role="combobox"` on input, `aria-expanded`, `aria-controls`, `aria-activedescendant` for accessibility.
- `role="listbox"` on dropdown, `role="option"` on each item.

---

### ConfirmDialog

> Based on SLDS 2 [Prompt](https://www.lightningdesignsystem.com/components/prompt/) + [Modal](https://www.lightningdesignsystem.com/components/modals/)

**File:** `src/components/ConfirmDialog/ConfirmDialog.tsx`

A focused modal for destructive confirmations (delete record, discard changes).

```tsx
type ConfirmDialogVariant = 'destructive' | 'warning' | 'info';

type ConfirmDialogProps = {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;                         // e.g. "Delete Contact"
  message: string | React.ReactNode;     // e.g. "Are you sure you want to delete John Doe?"
  confirmLabel?: string;                 // Default: "Delete" / "Confirm"
  cancelLabel?: string;                  // Default: "Cancel"
  variant?: ConfirmDialogVariant;        // Default: 'destructive'
  loading?: boolean;                     // Shows spinner on confirm button
  'aria-label'?: string;
};
```

**Visual spec:**
- Uses the existing `Modal` component internally, `size="small"`.
- **Header:** Icon matching variant (error-icon for destructive, warning for warning, info for info) + title text.
- **Icon color:** Destructive → `error`, Warning → `warning`, Info → `brandPrimary`.
- **Body:** Message text, `fontSize: fontSizeMedium`, `color: textDefault`.
- **Footer:** Two buttons — Cancel (neutral variant) and Confirm (destructive/brand variant matching `variant`).
- **Confirm button (destructive):** `backgroundColor: error`, `color: textInverse`.
- **Confirm button (warning):** `backgroundColor: warning`, `color: textInverse`.
- **Loading state:** Confirm button shows spinner, disabled state.

**Behaviors:**
- Built on top of `Modal` — inherits focus trap, Escape to close, overlay click.
- Confirm button receives initial focus (for keyboard users).
- `onConfirm` called when confirm button clicked. `onCancel` called on cancel, Escape, or overlay click.
- Screen reader: Dialog announced as `role="alertdialog"` with `aria-describedby` pointing to message.

---

### RecordForm

**File:** `src/components/RecordForm/RecordForm.tsx`

A generic form component that renders a structured form from field definitions. Used for both create and edit modes.

```tsx
type FormFieldType =
  | 'text'
  | 'email'
  | 'phone'
  | 'url'
  | 'number'
  | 'currency'
  | 'date'
  | 'datetime'
  | 'boolean'
  | 'select'
  | 'textarea'
  | 'relation'
  | 'file';

type FormFieldDefinition = {
  key: string;                         // Field key (maps to GraphQL field path)
  label: string;                       // Display label
  type: FormFieldType;                 // Input type
  required?: boolean;                  // Field required?
  placeholder?: string;
  helpText?: string;
  options?: Array<{ value: string; label: string }>;  // For 'select' type
  // Relation-specific
  relationObjectNameSingular?: string; // e.g. 'company'
  relationObjectNamePlural?: string;   // e.g. 'companies'
  relationSearchFields?: string[];     // Fields to search on
  relationDisplayField?: string;       // Field to show as label
  // File-specific
  accept?: string;
  maxSizeMB?: number;
  multiple?: boolean;
  // Layout
  colSpan?: 1 | 2;                    // 1 column (50%) or 2 columns (100%) in 2-col grid
};

type FormSection = {
  title?: string;                      // Section heading (optional)
  columns?: 1 | 2;                     // Number of columns (default: 2)
  fields: FormFieldDefinition[];
};

type RecordFormProps = {
  title: string;                       // Page/form title ("New Contact", "Edit Company")
  sections: FormSection[];             // Form sections with fields
  values: Record<string, unknown>;     // Current form values
  errors: Record<string, string>;      // Per-field errors
  saving: boolean;                     // Form submission in progress
  onChange: (field: string, value: unknown) => void;
  onSubmit: () => void;
  onCancel: () => void;
  submitLabel?: string;                // Default: "Save"
  cancelLabel?: string;                // Default: "Cancel"
};
```

**Anatomy:**

| # | Element | Description |
|---|---------|-------------|
| 1 | Form Header | Title + Cancel/Save buttons |
| 2 | Section | Optional section heading + grid of form elements |
| 3 | Form Element | Individual field (FormElement + appropriate input) |
| 4 | Footer | Fixed bottom bar with Cancel + Save buttons |

**Visual spec:**
- **Form header:** Title uses `fontSizeXXLarge`, `fontWeightBold`. Cancel button (ghost) and Save button (brand) aligned right.
- **Section heading:** `fontSize: fontSizeLarge`, `fontWeight: fontWeightMedium`, `color: textDefault`, `borderBottom: 1px solid borderDefault`, `paddingBottom: spacingXSmall`, `marginBottom: spacingMedium`.
- **Field grid:** CSS Grid, 2 columns with `gap: spacingMedium spacingLarge`. Single-column fields span 50%, `colSpan: 2` spans 100%.
- **Single-column layout:** Each field takes full width.
- **Footer bar:** Sticky bottom, `backgroundColor: neutral0`, `borderTop: 1px solid borderDefault`, `padding: spacingMedium spacingLarge`. Buttons right-aligned.
- **Saving state:** Save button disabled + spinner.

**Behaviors:**
- `<form>` element with `onSubmit` handler. Enter key in last field submits form.
- Each field calls `onChange(fieldKey, value)` on change.
- Validation errors mapped by field key → shown in FormElement.
- Relation fields use the Combobox component internally.
- File fields use the FileSelector component.
- `aria-busy="true"` on form when saving.

---

## Updated Components

### Icon (new icons)

New icon additions for Phase 3:

| Icon Name | Usage |
|-----------|-------|
| `plus` | "New record" buttons, add actions |
| `trash` | Delete actions |
| `upload` | File upload button |
| `attachment` | File attachment indicator |
| `link` | Relationship link indicator |
| `unlink` | Remove relationship |
| `drag` | Drag handle for file drop zone |

### InlineEdit (relationship support)

The existing `InlineEdit` component gains a new `fieldType: 'relation'` mode that renders a Combobox instead of a text input. Additional props:

```tsx
// Added to InlineEditProps
relationObjectNameSingular?: string;
relationObjectNamePlural?: string;
relationSearchFields?: string[];
relationDisplayField?: string;
```

When `fieldType === 'relation'`, InlineEdit renders a Combobox in edit mode with live search of related records.

---

## New Hooks

### useRecordCreate

**File:** `src/hooks/useRecordCreate.ts`

```tsx
type UseRecordCreateOptions = {
  objectNameSingular: string;
  objectNamePlural: string;
};

type UseRecordCreateReturn = {
  createRecord: (input: Record<string, unknown>) => Promise<{
    success: boolean;
    recordId?: string;
    error?: string;
  }>;
  loading: boolean;
};
```

Builds and executes a `createPerson` / `createCompany` / `createOpportunity` mutation dynamically.

GraphQL mutation shape:
```graphql
mutation CreatePerson($input: PersonCreateInput!) {
  createPerson(data: $input) {
    id
  }
}
```

### useRecordDelete

**File:** `src/hooks/useRecordDelete.ts`

```tsx
type UseRecordDeleteOptions = {
  objectNameSingular: string;
  objectNamePlural: string;
};

type UseRecordDeleteReturn = {
  deleteRecord: (recordId: string) => Promise<{
    success: boolean;
    error?: string;
  }>;
  loading: boolean;
};
```

Builds and executes a `deletePerson` / `deleteCompany` / `deleteOpportunity` mutation.

GraphQL mutation shape:
```graphql
mutation DeletePerson($id: ID!) {
  deletePerson(id: $id) {
    id
  }
}
```

### useFileUpload

**File:** `src/hooks/useFileUpload.ts`

```tsx
type UseFileUploadReturn = {
  uploadFile: (file: File) => Promise<{
    success: boolean;
    url?: string;
    error?: string;
  }>;
  uploading: boolean;
  progress: number;  // 0-100
};
```

Twenty's file upload uses a REST endpoint: `POST /files` with `multipart/form-data`. The hook manages the upload lifecycle and returns the attachment URL.

### useRelationSearch

**File:** `src/hooks/useRelationSearch.ts`

```tsx
type UseRelationSearchOptions = {
  objectNameSingular: string;
  objectNamePlural: string;
  searchFields: string[];
  displayField: string;
  fields: string;            // GraphQL fields to fetch
};

type UseRelationSearchReturn = {
  options: Array<{ id: string; label: string; sublabel?: string; avatarUrl?: string }>;
  loading: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
};
```

Reuses the `useRecordList` pattern internally but returns results formatted as `ComboboxOption[]`. Includes debounce (300ms) on search input.

---

## Pages

### CreateContactPage

**File:** `src/pages/CreateContactPage.tsx`

**Route:** `/contacts/new`

**Sections:**
1. **Personal Information** (2 columns)
   - First Name (text, required)
   - Last Name (text, required)
   - Email (email)
   - Phone (phone)
   - Job Title (text)
   - City (text)

2. **Organization** (2 columns)
   - Company (relation → `company`, displays company name)

**On submit:** Creates person via `useRecordCreate`, shows success toast, navigates to `/contacts/:id`.
**On cancel:** Navigates back to `/contacts`.

### CreateCompanyPage

**File:** `src/pages/CreateCompanyPage.tsx`

**Route:** `/companies/new`

**Sections:**
1. **Company Information** (2 columns)
   - Name (text, required)
   - Domain Name (url)
   - Employees (number)
   - Address (text, colSpan: 2)
   - Ideal Customer Profile (boolean)

**On submit:** Creates company via `useRecordCreate`, shows success toast, navigates to `/companies/:id`.

### CreateDealPage

**File:** `src/pages/CreateDealPage.tsx`

**Route:** `/deals/new`

**Sections:**
1. **Deal Information** (2 columns)
   - Name (text, required)
   - Stage (select: options from pipeline stages)
   - Close Date (date)
   - Amount (currency)
   - Company (relation → `company`)
   - Contact (relation → `person`, displays full name)

**On submit:** Creates opportunity via `useRecordCreate`, shows success toast, navigates to `/deals/:id`.

---

## GraphQL Queries & Mutations

### Create Record

```graphql
mutation CreatePerson($input: PersonCreateInput!) {
  createPerson(data: $input) { id }
}

mutation CreateCompany($input: CompanyCreateInput!) {
  createCompany(data: $input) { id }
}

mutation CreateOpportunity($input: OpportunityCreateInput!) {
  createOpportunity(data: $input) { id }
}
```

### Delete Record

```graphql
mutation DeletePerson($id: ID!) {
  deletePerson(id: $id) { id }
}

mutation DeleteCompany($id: ID!) {
  deleteCompany(id: $id) { id }
}

mutation DeleteOpportunity($id: ID!) {
  deleteOpportunity(id: $id) { id }
}
```

### Relation Search (reuses list query pattern)

```graphql
query SearchCompanies($filter: CompanyFilterInput, $first: Int) {
  companies(filter: $filter, first: $first) {
    edges { node { id name domainName { primaryLinkUrl } } }
  }
}
```

### File Upload

```
POST /files
Content-Type: multipart/form-data
Authorization: Bearer <token>

file: <binary>
```

Response: `{ url: string }`

---

## Routing Changes

New routes added to `AppRouter.tsx`:

| Path | Page | Description |
|------|------|-------------|
| `/contacts/new` | CreateContactPage | Create new contact |
| `/companies/new` | CreateCompanyPage | Create new company |
| `/deals/new` | CreateDealPage | Create new deal |

**Important:** `/contacts/new` must be placed BEFORE `/contacts/:recordId` in the router definition to ensure correct matching.

The existing detail pages gain "Edit" (full-form toggle) and "Delete" button functionality.

---

## Design Token Additions

New token values (added to existing token objects):

```typescript
// New color tokens for file upload and drag-drop
colorTokens.surfaceDragOver = 'var(--eds-g-color-brand-base-5, rgba(1,118,211,0.05))';

// New CSS custom properties in global.css
--eds-g-color-brand-base-5: rgba(1, 118, 211, 0.05);
```

No other new tokens required — the existing set covers all Phase 3 needs.

---

## Accessibility Checklist

- [ ] All form fields have visible `<label>` elements associated via `htmlFor`/`id`
- [ ] Required fields have `aria-required="true"` on the input element
- [ ] Error messages use `aria-describedby` and `aria-live="assertive"`
- [ ] Combobox follows [WAI-ARIA combobox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/)
- [ ] Arrow keys navigate combobox options, Enter selects, Escape closes
- [ ] ConfirmDialog uses `role="alertdialog"` with `aria-describedby`
- [ ] File selector drop zone has `aria-label` and keyboard alternative (button)
- [ ] All buttons have visible labels or `aria-label`
- [ ] Tab order follows logical document order
- [ ] Focus returns to trigger element after modal/dialog closes
- [ ] Color is not the only means of conveying state (icons accompany colors)
- [ ] Keyboard: all interactive elements reachable and operable via keyboard

---

## File Structure Summary

```
packages/twenty-eds/src/
├── components/
│   ├── Combobox/
│   │   ├── Combobox.tsx
│   │   └── index.ts
│   ├── ConfirmDialog/
│   │   ├── ConfirmDialog.tsx
│   │   └── index.ts
│   ├── FileSelector/
│   │   ├── FileSelector.tsx
│   │   └── index.ts
│   ├── FormElement/
│   │   ├── FormElement.tsx
│   │   └── index.ts
│   ├── RecordForm/
│   │   ├── RecordForm.tsx
│   │   └── index.ts
│   ├── Textarea/
│   │   ├── Textarea.tsx
│   │   └── index.ts
│   ├── Icon/
│   │   └── Icon.tsx          (updated — new icon paths)
│   ├── InlineEdit/
│   │   └── InlineEdit.tsx    (updated — relation support)
│   └── index.ts              (updated — new exports)
├── hooks/
│   ├── useRecordCreate.ts    (new)
│   ├── useRecordDelete.ts    (new)
│   ├── useFileUpload.ts      (new)
│   └── useRelationSearch.ts  (new)
├── pages/
│   ├── CreateContactPage.tsx  (new)
│   ├── CreateCompanyPage.tsx  (new)
│   └── CreateDealPage.tsx     (new)
└── AppRouter.tsx              (updated — new routes)
```

### Updated Files

| File | Changes |
|------|---------|
| `src/components/Icon/Icon.tsx` | 7 new icon paths added |
| `src/components/InlineEdit/InlineEdit.tsx` | Relation field type support |
| `src/components/index.ts` | New exports for Phase 3 components |
| `src/AppRouter.tsx` | New create routes + "New" button wiring |
| `src/pages/ContactDetailPage.tsx` | Delete button + full edit mode |
| `src/pages/CompanyDetailPage.tsx` | Delete button + full edit mode |
| `src/pages/DealDetailPage.tsx` | Delete button + full edit mode |
| `src/pages/ContactsListPage.tsx` | "New Contact" button in header |
| `src/pages/CompaniesListPage.tsx` | "New Company" button in header |
| `src/pages/DealsListPage.tsx` | "New Deal" button in header |

---

## Definition of Done

A feature is considered complete when:

1. All CRUD operations work via the same GraphQL API as Twenty standard frontend
2. Form validation prevents invalid submissions (required fields, format checks)
3. Components use only EDS design tokens — no hard-coded colors or spacings
4. Accessibility: keyboard navigable, ARIA attributes correct, screen-reader tested
5. Responsive: works on tablet (768px) and desktop (1280px+)
6. Relationship fields use live-search Combobox with correct data binding
7. File upload works for at least images and PDFs
8. Delete confirmation dialog prevents accidental data loss
9. Toast feedback shown after create/update/delete operations
10. Routes added to AppRouter and navigation links working
11. This document (EDS-PHASE3-CORE-CRM-ACTIONS.md) updated with any implementation deviations
12. EDS-COMPONENTS.md updated with new component documentation
