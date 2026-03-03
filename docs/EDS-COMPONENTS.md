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
