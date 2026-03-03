# EDS Frontend — Contribution Guide

This guide covers how to contribute to the EDS frontend package (`packages/twenty-eds`).

## Getting Started

```bash
# From the repo root
yarn install

# Start only the EDS frontend (port 3002)
npx nx start twenty-eds

# The backend must be running separately:
npx nx start twenty-server   # port 3000
```

> The Vite dev server proxies `/api` to `http://localhost:3000`, so you don't need CORS configuration.

## Package Structure

```
packages/twenty-eds/
├── index.html              # Entry HTML
├── vite.config.ts          # Vite config (port 3002, API proxy)
├── tsconfig.json           # TypeScript config
├── package.json
└── src/
    ├── main.tsx            # ReactDOM entry point
    ├── App.tsx             # Root component (AuthProvider + AppRouter)
    ├── AppRouter.tsx       # Hash-based routing (login, dashboard, settings)
    ├── global.css          # CSS custom properties (--eds-g-*) + reset
    ├── utilities.css       # SLDS 2-style utility classes (.eds-*)
    ├── tokens/             # Design tokens
    │   └── tokens.ts       # Color, typography, spacing, radius, elevation, z-index
    ├── components/         # Primitive UI components
    │   ├── Button/
    │   ├── Input/
    │   ├── Card/
    │   ├── Badge/
    │   └── Layout/         # Shell (app shell with topbar + sidebar)
    ├── hooks/
    │   └── useAuth.tsx     # Authentication context + JWT management
    ├── pages/
    │   ├── LoginPage.tsx
    │   ├── DashboardPage.tsx
    │   └── ProfileSettingsPage.tsx
    └── utils/
        └── api.ts          # Minimal GraphQL client
```

## Adding a New Component

1. Create `src/components/<ComponentName>/<ComponentName>.tsx`
2. Export named component and types
3. Create `src/components/<ComponentName>/index.ts` (barrel export)
4. Add to `src/components/index.ts`
5. Document in `docs/EDS-COMPONENTS.md`

### Component Template

```tsx
import React from 'react';
import { tokens } from '@eds/tokens';

export type MyComponentProps = {
  label: string;
  // ... other props
};

export const MyComponent = ({ label }: MyComponentProps) => {
  const style: React.CSSProperties = {
    fontFamily: tokens.typography.fontFamilyBase,
    color: tokens.color.textDefault,
    // ... styles from tokens
  };

  return <div style={style}>{label}</div>;
};
```

## Adding a New Page

1. Create `src/pages/<PageName>Page.tsx`
2. Add a route in `src/AppRouter.tsx`
3. Add a sidebar item in `src/App.tsx` (inside `ProtectedLayout`)

## Design Token Usage

Always use tokens for visual values — never hard-code colors or spacings:

```tsx
// ✅ Correct
backgroundColor: tokens.color.brandPrimary

// ❌ Wrong
backgroundColor: '#0176d3'
```

See `src/tokens/tokens.ts` for all available tokens.

## API Calls

Use the GraphQL client from `@eds/utils/api`:

```tsx
import { gql } from '@eds/utils/api';

const result = await gql<{ myQuery: MyType }>(
  `query MyQuery { myQuery { id name } }`,
  { variables: 'here' }
);
```

The `authToken` is set automatically after login via `setAuthToken()`.

## Code Style

- Named exports only (no default exports)
- Types over interfaces (except for extending 3rd party interfaces)
- No `any` — strict TypeScript
- Inline styles using `React.CSSProperties` + tokens
- No Emotion (keep zero CSS-in-JS dependencies in this package)
- Use `--eds-g-*` CSS custom properties for all visual values
- Utility CSS classes from `utilities.css` available for layout helpers
- File names: PascalCase for components, camelCase for utilities and hooks

## Testing

```bash
# Run EDS-related tests
cd packages/twenty-front && npx jest "useFrontendShell"
```

The main test coverage for the frontend selection logic is in the `twenty-front` package:
`src/modules/workspace/hooks/__tests__/useFrontendShell.test.ts`

## Deployment

The EDS build output goes to `packages/twenty-eds/dist`. To serve it alongside the main Twenty frontend:

1. Build: `npx nx build twenty-eds`
2. Serve the `dist/` folder at `/eds` on your reverse proxy (Nginx/Caddy/Cloudflare)

Example Nginx configuration:

```nginx
location /eds {
  alias /app/packages/twenty-eds/dist;
  try_files $uri $uri/ /eds/index.html;
}

location / {
  alias /app/packages/twenty-front/build;
  try_files $uri $uri/ /index.html;
}
```
