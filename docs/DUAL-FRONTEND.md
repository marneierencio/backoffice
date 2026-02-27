# Dual-Frontend Architecture

This document describes the parallel frontend architecture introduced in this PR, which allows the Erencio Backoffice to serve two independent UI shells from the same backend.

## Overview

The system now supports two frontend experiences:

| Shell | Package | URL | Status |
|-------|---------|-----|--------|
| **Twenty** (Standard) | `packages/twenty-front` | `/` | Production |
| **SFDS2** | `packages/twenty-sfds2` | `/sfds2` | Beta |

Both frontends share the same:
- NestJS backend API (`/api/graphql`)
- Authentication flow (JWT tokens)
- Data model (PostgreSQL via TypeORM)
- Redis cache and BullMQ workers

## Key Design Decisions

### Why a separate package (not theming)?
The SFDS2 frontend implements a fundamentally different component architecture inspired by [Salesforce Lightning Design System 2 (SLDS 2)](https://www.lightningdesignsystem.com/). A pure theme would not allow structural differences in layout, interaction patterns, and accessibility patterns. A separate Vite + React package gives full independence while sharing the API.

### Bootstrap Resolution Order

When the application loads, the effective frontend is determined in this order:

```
1. Workspace Policy (highest priority)
   ├── FORCE_TWENTY → always load Twenty
   ├── FORCE_SFDS2  → always load SFDS2
   └── ALLOW_USER_CHOICE → proceed to step 2

2. User Preference (from user.frontendPreference)
   ├── TWENTY → load Twenty
   └── SFDS2  → load SFDS2

3. System Default → TWENTY
```

This logic is implemented in:
- **Frontend hook**: `packages/twenty-front/src/modules/workspace/hooks/useFrontendShell.ts`
- **Backend entity**: `UserEntity.frontendPreference` + `WorkspaceEntity.frontendPolicy`

## Data Model Changes

### UserEntity (`core.user`)

New column:
```sql
frontendPreference user_frontendPreference_enum NOT NULL DEFAULT 'TWENTY'
```

Possible values: `TWENTY`, `SFDS2`

### WorkspaceEntity (`core.workspace`)

New column:
```sql
frontendPolicy workspace_frontendPolicy_enum NOT NULL DEFAULT 'ALLOW_USER_CHOICE'
```

Possible values: `ALLOW_USER_CHOICE`, `FORCE_TWENTY`, `FORCE_SFDS2`

### Migration

File: `packages/twenty-server/src/database/typeorm/core/migrations/common/1772000000000-add-frontend-preference-and-policy.ts`

## API

### Update User Frontend Preference

```graphql
mutation UpdateUserFrontendPreference($frontendPreference: FrontendPreference!) {
  updateUserFrontendPreference(frontendPreference: $frontendPreference)
}
```

Requires: authenticated user + workspace session.

### Update Workspace Frontend Policy

```graphql
mutation UpdateWorkspace($data: UpdateWorkspaceInput!) {
  updateWorkspace(data: $data) {
    id
    frontendPolicy
  }
}
```

Where `$data = { frontendPolicy: "FORCE_SFDS2" }`. Requires workspace admin or `WORKSPACE` permission.

## Feature Flag

The SFDS2 shell is gated by the workspace feature flag `IS_SFDS2_ENABLED`. Even if a user has a preference for SFDS2, the redirect will only happen when this flag is enabled for the workspace.

To enable via admin panel:
1. Go to Admin Panel → Workspace → Feature Flags
2. Toggle `IS_SFDS2_ENABLED` to `true`

## Component Architecture

See [SFDS2-COMPONENTS.md](./SFDS2-COMPONENTS.md) for detailed component documentation.

## Migration Plan

See [SFDS2-MIGRATION.md](./SFDS2-MIGRATION.md) for the incremental migration plan.

## Contributing

See [SFDS2-CONTRIBUTING.md](./SFDS2-CONTRIBUTING.md) for contribution guidelines.
