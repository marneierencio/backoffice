# SFDS2 Component Library

This document describes the component library implemented in `packages/twenty-sfds2`, inspired by [Salesforce Lightning Design System 2 (SLDS 2)](https://www.lightningdesignsystem.com/).

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
| `colorTokens.brandPrimary` | `#0176d3` | Primary actions, links, focus rings |
| `colorTokens.neutral0` | `#ffffff` | Card/surface backgrounds |
| `colorTokens.neutral1` | `#f3f3f3` | Page background |
| `colorTokens.error` | `#ba0517` | Error states |
| `colorTokens.success` | `#2e844a` | Success states |
| `colorTokens.warning` | `#dd7a01` | Warning states |

### Spacing Tokens
Based on a 4px/8px grid:
- `spacingXXSmall` = 4px
- `spacingXSmall` = 8px
- `spacingSmall` = 12px
- `spacingMedium` = 16px
- `spacingLarge` = 24px
- `spacingXLarge` = 32px

### Typography Tokens
Base font: `Salesforce Sans, Helvetica Neue, Helvetica, Arial, sans-serif`

Font sizes from `fontSizeXSmall` (10px) to `fontSizeXXXLarge` (32px).

## Component Inventory

### Button

```tsx
import { Button } from '@sfds2/components/Button';

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
import { Input } from '@sfds2/components/Input';

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
import { Card } from '@sfds2/components/Card';

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
import { Badge } from '@sfds2/components/Badge';

<Badge
  label="Active"
  variant="success"   // 'default' | 'success' | 'warning' | 'error' | 'info' | 'brand'
  size="medium"       // 'small' | 'medium'
/>
```

### Shell (Layout)

```tsx
import { Shell } from '@sfds2/components/Layout';

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

1. **CSS-in-JS vs CSS custom properties**: SFDS2 uses inline styles and CSS variables (via `global.css`) rather than SLDS utility classes, because the project already uses Emotion-based CSS-in-JS in Twenty. This avoids dual CSS toolchains.

2. **No LWC dependency**: Official SLDS 2 is designed for Lightning Web Components. This implementation adapts the design principles (tokens, component API, accessibility) to React.

3. **Simplified token structure**: The full SLDS 2 spec has 500+ tokens. This implementation includes the essential set for the components delivered, with room to expand.
