# SFDS2 Incremental Migration Plan

This document outlines the strategy for gradually migrating screens from the Twenty (standard) frontend to the SFDS2 interface.

## Principles

- **No forced migration**: Users choose their interface, admins can enforce via workspace policy
- **Feature parity last**: The SFDS2 frontend reaches feature parity gradually — missing pages fall back gracefully
- **Independent releases**: Each sprint can deliver new SFDS2 pages without affecting the standard frontend
- **API-compatible**: Both frontends call the same GraphQL API — no backend changes per page

## Migration Phases

### Phase 0 — Foundation (Current) ✅
- [x] SFDS2 package structure
- [x] Design tokens (color, typography, spacing, radius, elevation, z-index)
- [x] Core primitive components: Button, Input, Card, Badge
- [x] Layout: Shell (topbar + collapsible sidebar)
- [x] Auth context (JWT login, session persistence)
- [x] Dashboard page
- [x] Profile settings page with frontend switch
- [x] Backend: `user.frontendPreference` + `workspace.frontendPolicy`
- [x] Frontend selection logic (`useFrontendShell` hook)
- [x] User settings integration (SettingsExperience)
- [x] Workspace settings integration (SettingsWorkspace)
- [x] Feature flag `IS_SFDS2_ENABLED`

### Phase 1 — Record Listing
- [ ] Select component
- [ ] Table component with sorting and pagination
- [ ] Search bar
- [ ] Contacts list page
- [ ] Companies list page
- [ ] Deals/Opportunities list page

### Phase 2 — Record Detail
- [ ] Record show page
- [ ] Field editing inline
- [ ] Modal component
- [ ] Tabs component
- [ ] Toast notification system
- [ ] Avatar component

### Phase 3 — Core CRM Actions
- [ ] Create record form
- [ ] Edit record form
- [ ] Delete confirmation dialog
- [ ] Relationship fields
- [ ] File upload field

### Phase 4 — Navigation & Productivity
- [ ] Command menu integration
- [ ] Global search
- [ ] Notifications panel
- [ ] Calendar view
- [ ] Kanban view

### Phase 5 — Settings (Admin)
- [ ] Full workspace settings
- [ ] Member management
- [ ] Role management
- [ ] Data model settings
- [ ] API keys
- [ ] Billing

### Phase 6 — Feature Parity
- [ ] All remaining pages migrated
- [ ] SFDS2 can be set as workspace default
- [ ] Feature flag `IS_SFDS2_ENABLED` becomes on-by-default

## Fallback Strategy

For pages not yet migrated in SFDS2, two strategies are possible:

### Option A: Redirect to Twenty (current)
If a user navigates to `/sfds2/contacts` but the page is not yet implemented, redirect them to the equivalent path in Twenty (`/contacts`).

### Option B: Embedded iframe (future)
Embed the Twenty page in an iframe within the SFDS2 shell for a seamless experience while migration is in progress.

Currently **Option A** is implemented implicitly — the `AppRouter.tsx` only has routes for implemented pages; unmatched routes fall back to the Dashboard.

## Tracking Progress

Open a GitHub Issue tagged `sfds2-migration` for each screen migration sprint. Reference this document in the issue description.

## Definition of Done per Screen

A screen is considered migrated when:
1. All data is loaded via the same GraphQL queries as Twenty
2. All CRUD actions work
3. Component uses only SFDS2 design tokens
4. Accessibility: keyboard navigable, ARIA attributes correct
5. Responsive: works on tablet (768px) and desktop (1280px+)
6. Added to AppRouter with correct path
7. Documented in SFDS2-COMPONENTS.md if new components were created
