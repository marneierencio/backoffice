// SFDS2 Design Tokens — inspired by Salesforce Lightning Design System 2
// Color palette
export const colorTokens = {
  // Brand
  brandPrimary: '#0176d3',
  brandPrimaryActive: '#014486',
  brandPrimaryHover: '#0176d3',
  brandPrimaryLight: '#e8f4ff',

  // Neutral
  neutral0: '#ffffff',
  neutral1: '#f3f3f3',
  neutral2: '#e5e5e5',
  neutral3: '#c9c9c9',
  neutral4: '#aeaeae',
  neutral5: '#939393',
  neutral6: '#706e6b',
  neutral7: '#514f4d',
  neutral8: '#3e3e3c',
  neutral9: '#2b2826',
  neutral10: '#181716',

  // Feedback
  success: '#2e844a',
  successLight: '#cdefc4',
  warning: '#dd7a01',
  warningLight: '#fdefc8',
  error: '#ba0517',
  errorLight: '#ffdde1',
  info: '#0176d3',
  infoLight: '#d8edff',

  // Text
  textDefault: '#181716',
  textLabel: '#3e3e3c',
  textPlaceholder: '#706e6b',
  textDisabled: '#aeaeae',
  textInverse: '#ffffff',
  textLink: '#0176d3',
  textLinkActive: '#014486',

  // Border
  borderDefault: '#c9c9c9',
  borderInput: '#939393',
  borderFocus: '#0176d3',
  borderError: '#ba0517',
  borderSuccess: '#2e844a',
  borderWarning: '#dd7a01',
} as const;

// Typography
export const typographyTokens = {
  fontFamilyBase: "'Salesforce Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif",
  fontSizeXSmall: '0.625rem',   // 10px
  fontSizeSmall: '0.75rem',     // 12px
  fontSizeMedium: '0.875rem',   // 14px
  fontSizeBase: '1rem',         // 16px
  fontSizeLarge: '1.125rem',    // 18px
  fontSizeXLarge: '1.25rem',    // 20px
  fontSizeXXLarge: '1.5rem',    // 24px
  fontSizeXXXLarge: '2rem',     // 32px

  fontWeightRegular: '400',
  fontWeightMedium: '500',
  fontWeightBold: '700',

  lineHeightReset: '1',
  lineHeightText: '1.5',
  lineHeightHeading: '1.25',
} as const;

// Spacing (base-8 grid)
export const spacingTokens = {
  spacingNone: '0',
  spacingXXXSmall: '0.125rem',  // 2px
  spacingXXSmall: '0.25rem',    // 4px
  spacingXSmall: '0.5rem',      // 8px
  spacingSmall: '0.75rem',      // 12px
  spacingMedium: '1rem',        // 16px
  spacingLarge: '1.5rem',       // 24px
  spacingXLarge: '2rem',        // 32px
  spacingXXLarge: '3rem',       // 48px
  spacingXXXLarge: '4rem',      // 64px
} as const;

// Border radius
export const radiusTokens = {
  radiusSmall: '0.125rem',  // 2px
  radiusMedium: '0.25rem',  // 4px
  radiusLarge: '0.5rem',    // 8px
  radiusXLarge: '1rem',     // 16px
  radiusCircle: '50%',
  radiusPill: '9999px',
} as const;

// Elevation (box shadows)
export const elevationTokens = {
  elevationNone: 'none',
  elevationRaised: '0 1px 2px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.08)',
  elevationDropdown: '0 2px 6px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.1)',
  elevationModal: '0 4px 16px rgba(0, 0, 0, 0.14), 0 8px 24px rgba(0, 0, 0, 0.12)',
  elevationOverlay: '0 8px 32px rgba(0, 0, 0, 0.16), 0 16px 48px rgba(0, 0, 0, 0.14)',
} as const;

// Z-index stack
export const zIndexTokens = {
  zIndexBase: 0,
  zIndexRaised: 100,
  zIndexDropdown: 1000,
  zIndexModal: 5000,
  zIndexToast: 9000,
  zIndexOverlay: 9999,
} as const;

export const tokens = {
  color: colorTokens,
  typography: typographyTokens,
  spacing: spacingTokens,
  radius: radiusTokens,
  elevation: elevationTokens,
  zIndex: zIndexTokens,
} as const;

export type Tokens = typeof tokens;
