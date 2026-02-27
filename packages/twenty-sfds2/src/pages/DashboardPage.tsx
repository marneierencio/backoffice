import React from 'react';
import { tokens } from '@sfds2/tokens';
import { Card } from '@sfds2/components/Card';
import { Badge } from '@sfds2/components/Badge';
import { useAuth } from '@sfds2/hooks/useAuth';

const StatCard = ({
  label,
  value,
  trend,
}: {
  label: string;
  value: string;
  trend?: string;
}) => (
  <Card>
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacing.spacingXXSmall,
      }}
    >
      <p
        style={{
          fontSize: tokens.typography.fontSizeSmall,
          color: tokens.color.textPlaceholder,
          fontWeight: tokens.typography.fontWeightBold,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: tokens.typography.fontSizeXXXLarge,
          fontWeight: tokens.typography.fontWeightBold,
          color: tokens.color.textDefault,
          lineHeight: '1',
        }}
      >
        {value}
      </p>
      {trend && (
        <Badge
          label={trend}
          variant={trend.startsWith('+') ? 'success' : 'error'}
          size="small"
        />
      )}
    </div>
  </Card>
);

export const DashboardPage = () => {
  const { user } = useAuth();

  const greeting = user
    ? `Welcome back, ${user.firstName || user.email}!`
    : 'Welcome to SFDS2 Dashboard';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.spacingXLarge }}>
      <div>
        <h1
          style={{
            fontSize: tokens.typography.fontSizeXXLarge,
            fontWeight: tokens.typography.fontWeightBold,
            color: tokens.color.textDefault,
          }}
        >
          Dashboard
        </h1>
        <p style={{ color: tokens.color.textPlaceholder, marginTop: tokens.spacing.spacingXXSmall }}>
          {greeting}
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: tokens.spacing.spacingMedium,
        }}
      >
        <StatCard label="Total Contacts" value="1,248" trend="+12%" />
        <StatCard label="Open Deals" value="87" trend="+3%" />
        <StatCard label="Companies" value="234" />
        <StatCard label="Tasks Due" value="14" trend="-8%" />
      </div>

      <Card
        title="SFDS2 Interface"
        description="You are currently using the Salesforce Design System 2 (SFDS2) inspired frontend."
        variant="highlight"
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: tokens.spacing.spacingSmall,
            color: tokens.color.textLabel,
            fontSize: tokens.typography.fontSizeMedium,
            lineHeight: tokens.typography.lineHeightText,
          }}
        >
          <p>
            This is a parallel frontend experience running alongside the standard Twenty CRM interface.
            Both frontends share the same backend API and data.
          </p>
          <p>
            To switch back to the standard interface, go to{' '}
            <a href="#/settings/profile">Profile Settings</a> and change your frontend preference.
          </p>
          <div style={{ display: 'flex', gap: tokens.spacing.spacingXSmall, marginTop: tokens.spacing.spacingXSmall }}>
            <Badge label="Parallel Frontend" variant="brand" />
            <Badge label="SFDS2" variant="info" />
            <Badge label="Beta" variant="warning" />
          </div>
        </div>
      </Card>
    </div>
  );
};
