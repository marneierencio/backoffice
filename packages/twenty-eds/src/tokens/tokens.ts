// EDS 1.0 Design Tokens — Erencio Design System
// Architecture mirrors SLDS 2: CSS custom properties as the visual language
// Naming: --eds-g-* for global styling hooks (parallels SLDS 2 --slds-g-*)
//
// Color system follows SLDS 2 semantic hierarchy:
//   Surface    → backgrounds and large areas
//   Accent     → brand colors to draw attention
//   Container  → fill color for elements containing text/icons
//   On         → text/icons placed ON a colored surface
//   Feedback   → success, error, warning, info

// Color palette — values reference CSS custom properties defined in global.css
export const colorTokens = {
  // Brand / Accent
  brandPrimary: 'var(--eds-g-color-brand-base-50, #0176d3)',
  brandPrimaryHover: 'var(--eds-g-color-brand-base-60, #014486)',
  brandPrimaryActive: 'var(--eds-g-color-brand-base-70, #032d60)',
  brandPrimaryLight: 'var(--eds-g-color-brand-base-10, #e5f2ff)',

  // Neutral (lightest → darkest)
  neutral0: 'var(--eds-g-color-neutral-base-1, #ffffff)',
  neutral1: 'var(--eds-g-color-neutral-base-5, #f3f3f3)',
  neutral2: 'var(--eds-g-color-neutral-base-10, #e5e5e5)',
  neutral3: 'var(--eds-g-color-neutral-base-20, #c9c9c9)',
  neutral4: 'var(--eds-g-color-neutral-base-30, #aeaeae)',
  neutral5: 'var(--eds-g-color-neutral-base-40, #939393)',
  neutral6: 'var(--eds-g-color-neutral-base-50, #706e6b)',
  neutral7: 'var(--eds-g-color-neutral-base-60, #514f4d)',
  neutral8: 'var(--eds-g-color-neutral-base-70, #3e3e3c)',
  neutral9: 'var(--eds-g-color-neutral-base-80, #2b2826)',
  neutral10: 'var(--eds-g-color-neutral-base-100, #181716)',

  // Feedback
  success: 'var(--eds-g-color-success-base-50, #2e844a)',
  successLight: 'var(--eds-g-color-success-container, #cdefc4)',
  warning: 'var(--eds-g-color-warning-base-50, #dd7a01)',
  warningLight: 'var(--eds-g-color-warning-container, #fdefc8)',
  error: 'var(--eds-g-color-error-base-50, #ba0517)',
  errorLight: 'var(--eds-g-color-error-container, #fddde3)',
  info: 'var(--eds-g-color-info-base-50, #0176d3)',
  infoLight: 'var(--eds-g-color-info-container, #d8edff)',

  // Text (on-surface)
  textDefault: 'var(--eds-g-color-on-surface-3, #181716)',
  textLabel: 'var(--eds-g-color-on-surface-2, #3e3e3c)',
  textPlaceholder: 'var(--eds-g-color-on-surface-1, #706e6b)',
  textDisabled: 'var(--eds-g-color-neutral-base-30, #aeaeae)',
  textInverse: 'var(--eds-g-color-on-surface-inverse, #ffffff)',
  textLink: 'var(--eds-g-color-brand-base-50, #0176d3)',
  textLinkActive: 'var(--eds-g-color-brand-base-60, #014486)',

  // Border
  borderDefault: 'var(--eds-g-color-border-2, #c9c9c9)',
  borderInput: 'var(--eds-g-color-border-input, #939393)',
  borderFocus: 'var(--eds-g-color-border-focus, #0176d3)',
  borderError: 'var(--eds-g-color-border-error, #ba0517)',
  borderSuccess: 'var(--eds-g-color-success-base-50, #2e844a)',
  borderWarning: 'var(--eds-g-color-warning-base-50, #dd7a01)',
} as const;

// Typography — SLDS 2 uses system fonts (no custom web fonts)
// Font scale: --eds-g-font-scale-2 (11px) through --eds-g-font-scale-8 (24px)
// Font weight: 3 (300 light), 4 (400 regular), 6 (600 semi), 7 (700 bold)
export const typographyTokens = {
  fontFamilyBase: "var(--eds-g-font-family, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif)",

  fontSizeXSmall: 'var(--eds-g-font-scale-2, 0.6875rem)',   // 11px
  fontSizeSmall: 'var(--eds-g-font-scale-3, 0.75rem)',      // 12px
  fontSizeMedium: 'var(--eds-g-font-scale-4, 0.875rem)',    // 14px — body default
  fontSizeBase: 'var(--eds-g-font-scale-5, 1rem)',           // 16px
  fontSizeLarge: 'var(--eds-g-font-scale-6, 1.125rem)',      // 18px
  fontSizeXLarge: 'var(--eds-g-font-scale-7, 1.25rem)',      // 20px
  fontSizeXXLarge: 'var(--eds-g-font-scale-8, 1.5rem)',      // 24px
  fontSizeXXXLarge: 'var(--eds-g-font-size-display, 2rem)',  // 32px — display

  fontWeightLight: 'var(--eds-g-font-weight-3, 300)',
  fontWeightRegular: 'var(--eds-g-font-weight-4, 400)',
  fontWeightMedium: 'var(--eds-g-font-weight-6, 600)',
  fontWeightBold: 'var(--eds-g-font-weight-7, 700)',

  lineHeightReset: '1',
  lineHeightHeading: 'var(--eds-g-line-height-heading, 1.25)',
  lineHeightText: 'var(--eds-g-line-height-text, 1.5)',
} as const;

// Spacing — SLDS 2 numbered scale 1–12, based on 4px/8px grid
export const spacingTokens = {
  spacingNone: '0',
  spacingXXXSmall: 'var(--eds-g-spacing-1, 0.25rem)',   // 4px
  spacingXXSmall: 'var(--eds-g-spacing-1, 0.25rem)',     // 4px
  spacingXSmall: 'var(--eds-g-spacing-2, 0.5rem)',       // 8px
  spacingSmall: 'var(--eds-g-spacing-3, 0.75rem)',       // 12px
  spacingMedium: 'var(--eds-g-spacing-4, 1rem)',          // 16px
  spacingLarge: 'var(--eds-g-spacing-6, 1.5rem)',         // 24px
  spacingXLarge: 'var(--eds-g-spacing-8, 2rem)',           // 32px
  spacingXXLarge: 'var(--eds-g-spacing-10, 3rem)',         // 48px
  spacingXXXLarge: 'var(--eds-g-spacing-12, 4rem)',        // 64px
} as const;

// Border radius — SLDS 2 --slds-g-radius-border-*
export const radiusTokens = {
  radiusSmall: 'var(--eds-g-radius-border-1, 0.125rem)',   // 2px
  radiusMedium: 'var(--eds-g-radius-border-2, 0.25rem)',    // 4px
  radiusLarge: 'var(--eds-g-radius-border-4, 0.5rem)',      // 8px
  radiusXLarge: 'var(--eds-g-radius-border-5, 1rem)',       // 16px
  radiusCircle: '50%',
  radiusPill: '9999px',
} as const;

// Elevation (box shadows) — SLDS 2 --slds-g-shadow-*
export const elevationTokens = {
  elevationNone: 'none',
  elevationRaised: 'var(--eds-g-shadow-2, 0 2px 4px rgba(0,0,0,0.1))',
  elevationDropdown: 'var(--eds-g-shadow-3, 0 4px 12px rgba(0,0,0,0.12))',
  elevationModal: 'var(--eds-g-shadow-4, 0 8px 24px rgba(0,0,0,0.15))',
  elevationOverlay: 'var(--eds-g-shadow-5, 0 16px 48px rgba(0,0,0,0.2))',
} as const;

// Z-index stack
export const zIndexTokens = {
  zIndexBase: 0,
  zIndexRaised: 100,
  zIndexDropdown: 1000,
  zIndexSticky: 1100,
  zIndexModal: 5000,
  zIndexToast: 9000,
  zIndexOverlay: 9999,
} as const;

// Duration / Transitions — SLDS 2 naming
export const durationTokens = {
  durationImmediately: 'var(--eds-g-duration-immediately, 0ms)',
  durationQuickly: 'var(--eds-g-duration-quickly, 100ms)',
  durationPromptly: 'var(--eds-g-duration-promptly, 200ms)',
  durationSlowly: 'var(--eds-g-duration-slowly, 400ms)',
  durationPaused: 'var(--eds-g-duration-paused, 3200ms)',
} as const;

export const tokens = {
  color: colorTokens,
  typography: typographyTokens,
  spacing: spacingTokens,
  radius: radiusTokens,
  elevation: elevationTokens,
  zIndex: zIndexTokens,
  duration: durationTokens,
} as const;

export type Tokens = typeof tokens;
