// NotFoundPage — SLDS 2 IllustrationError pattern
// Reference: https://www.lightningdesignsystem.com/components/illustration/
import { Button } from '@eds/components/Button';
import { tokens } from '@eds/tokens';
import { useNavigate } from 'react-router-dom';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div
      role="main"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        padding: tokens.spacing.spacingXLarge,
        fontFamily: tokens.typography.fontFamilyBase,
        textAlign: 'center',
      }}
    >
      {/* SLDS 2 Illustration — "No Access" / Desert scene equivalent */}
      <svg
        aria-hidden="true"
        width="200"
        height="200"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ marginBottom: tokens.spacing.spacingLarge }}
      >
        {/* Sky background */}
        <circle cx="100" cy="100" r="100" fill="var(--eds-g-color-neutral-base-5, #f3f3f3)" />
        {/* Ground */}
        <ellipse cx="100" cy="160" rx="80" ry="16" fill="var(--eds-g-color-neutral-base-10, #e5e5e5)" />
        {/* Cactus — SLDS 2 desert / no-data illustration metaphor */}
        <rect x="95" y="100" width="10" height="50" rx="5" fill="var(--eds-g-color-neutral-base-30, #aeaeae)" />
        <rect x="75" y="115" width="10" height="28" rx="5" fill="var(--eds-g-color-neutral-base-30, #aeaeae)" />
        <rect x="75" y="115" width="30" height="10" rx="5" fill="var(--eds-g-color-neutral-base-30, #aeaeae)" />
        <rect x="115" y="120" width="10" height="22" rx="5" fill="var(--eds-g-color-neutral-base-30, #aeaeae)" />
        <rect x="95" y="120" width="30" height="10" rx="5" fill="var(--eds-g-color-neutral-base-30, #aeaeae)" />
        {/* 404 text in the sky */}
        <text
          x="100"
          y="80"
          textAnchor="middle"
          fontSize="28"
          fontWeight="700"
          fill="var(--eds-g-color-neutral-base-50, #706e6b)"
          fontFamily="system-ui, sans-serif"
        >
          404
        </text>
      </svg>

      <h1
        style={{
          fontSize: tokens.typography.fontSizeXXLarge,
          fontWeight: tokens.typography.fontWeightBold,
          color: tokens.color.textDefault,
          margin: `0 0 ${tokens.spacing.spacingSmall}`,
          lineHeight: '1.25',
        }}
      >
        Page not found
      </h1>

      <p
        style={{
          fontSize: tokens.typography.fontSizeBase,
          color: tokens.color.textPlaceholder,
          maxWidth: '400px',
          margin: `0 0 ${tokens.spacing.spacingLarge}`,
          lineHeight: '1.5',
        }}
      >
        The page you are looking for doesn't exist or you don't have permission to view it. Check the URL or go back to your dashboard.
      </p>

      <div style={{ display: 'flex', gap: tokens.spacing.spacingSmall, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Button
          label="Go to Dashboard"
          variant="brand"
          onClick={() => navigate('/')}
        />
        <Button
          label="Go back"
          variant="neutral"
          onClick={() => window.history.back()}
        />
      </div>
    </div>
  );
};
