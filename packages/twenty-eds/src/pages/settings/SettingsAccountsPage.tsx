// Settings > Accounts — Email and Calendar integration page
// SLDS 2 reference: https://www.lightningdesignsystem.com/components/tiles/
// Mirrors Twenty's SettingsAccounts page functionality
import { Badge } from '@eds/components/Badge';
import { Button } from '@eds/components/Button';
import { Card } from '@eds/components/Card';
import { EmptyState } from '@eds/components/EmptyState';
import { Icon } from '@eds/components/Icon';
import { SectionHeader } from '@eds/components/SectionHeader';
import { SettingsLayout } from '@eds/components/SettingsLayout';
import { Spinner } from '@eds/components/Spinner';
import { Tabs } from '@eds/components/Tabs';
import { tokens } from '@eds/tokens';
import { gql } from '@eds/utils/api';
import { useEffect, useState } from 'react';

type ConnectedAccount = {
  id: string;
  handle: string;
  provider: 'GOOGLE' | 'MICROSOFT' | 'IMAP_SMTP';
  connectionStatus: 'VALID' | 'FAILING_REFRESH' | 'INVALID_CREDENTIALS' | 'ONGOING';
  messageChannels?: Array<{ id: string; handle: string; syncStatus: string }>;
  calendarChannels?: Array<{ id: string; handle: string; syncStatus: string }>;
};

const GET_CONNECTED_ACCOUNTS_QUERY = `
  query GetConnectedAccounts {
    connectedAccounts(orderBy: { createdAt: DescNullsLast }) {
      edges {
        node {
          id
          handle
          provider
          connectionStatus
          messageChannels {
            id
            handle
            syncStatus
          }
          calendarChannels {
            id
            handle
            syncStatus
          }
        }
      }
    }
  }
`;

const DISCONNECT_ACCOUNT_MUTATION = `
  mutation DeleteConnectedAccount($id: ID!) {
    deleteConnectedAccount(id: $id) {
      id
    }
  }
`;

const PROVIDER_LABELS: Record<string, string> = {
  GOOGLE: 'Google',
  MICROSOFT: 'Microsoft',
  IMAP_SMTP: 'IMAP / SMTP',
};

const PROVIDER_ICONS: Record<string, string> = {
  GOOGLE: '🔵',
  MICROSOFT: '🟣',
  IMAP_SMTP: '📧',
};

const CONNECTION_STATUS_BADGE: Record<string, { label: string; variant: 'success' | 'error' | 'warning' | 'info' | 'default' }> = {
  VALID: { label: 'Connected', variant: 'success' },
  ONGOING: { label: 'Connecting…', variant: 'info' },
  FAILING_REFRESH: { label: 'Token expired', variant: 'warning' },
  INVALID_CREDENTIALS: { label: 'Invalid credentials', variant: 'error' },
};

const SYNC_STATUS_BADGE: Record<string, { label: string; variant: 'success' | 'error' | 'warning' | 'info' | 'default' }> = {
  ACTIVE: { label: 'Active', variant: 'success' },
  PENDING: { label: 'Pending', variant: 'default' },
  FAILED: { label: 'Failed', variant: 'error' },
  NOT_SYNCED: { label: 'Not synced', variant: 'default' },
  PARTIAL: { label: 'Partial', variant: 'warning' },
};

type AccountCardProps = {
  account: ConnectedAccount;
  onDisconnect: (id: string) => void;
};

const AccountCard = ({ account, onDisconnect }: AccountCardProps) => {
  const connStatus = CONNECTION_STATUS_BADGE[account.connectionStatus] ?? { label: account.connectionStatus, variant: 'default' as const };

  return (
    <div
      style={{
        border: `1px solid ${tokens.color.borderDefault}`,
        borderRadius: tokens.radius.radiusMedium,
        padding: tokens.spacing.spacingMedium,
        backgroundColor: tokens.color.neutral0,
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacing.spacingSmall,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.spacingSmall }}>
        <span style={{ fontSize: 20 }}>{PROVIDER_ICONS[account.provider] ?? '📧'}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: tokens.typography.fontSizeMedium,
              fontWeight: tokens.typography.fontWeightMedium,
              color: tokens.color.textDefault,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {account.handle}
          </div>
          <div style={{ fontSize: tokens.typography.fontSizeSmall, color: tokens.color.textPlaceholder }}>
            {PROVIDER_LABELS[account.provider] ?? account.provider}
          </div>
        </div>
        <Badge label={connStatus.label} variant={connStatus.variant} />
        <button
          aria-label={`Disconnect ${account.handle}`}
          title="Disconnect account"
          onClick={() => onDisconnect(account.id)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 4,
            color: tokens.color.textPlaceholder,
            borderRadius: tokens.radius.radiusSmall,
          }}
        >
          <Icon name="x" size={16} />
        </button>
      </div>

      {/* Email channels */}
      {account.messageChannels && account.messageChannels.length > 0 && (
        <div style={{ paddingLeft: tokens.spacing.spacingLarge }}>
          <div
            style={{
              fontSize: tokens.typography.fontSizeSmall,
              fontWeight: tokens.typography.fontWeightMedium,
              color: tokens.color.textLabel,
              marginBottom: 4,
            }}
          >
            Email Channels
          </div>
          {account.messageChannels.map((ch) => {
            const st = SYNC_STATUS_BADGE[ch.syncStatus] ?? { label: ch.syncStatus, variant: 'default' as const };
            return (
              <div
                key={ch.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: tokens.typography.fontSizeSmall,
                  color: tokens.color.textDefault,
                  marginBottom: 2,
                }}
              >
                <span>{ch.handle}</span>
                <Badge label={st.label} variant={st.variant} />
              </div>
            );
          })}
        </div>
      )}

      {/* Calendar channels */}
      {account.calendarChannels && account.calendarChannels.length > 0 && (
        <div style={{ paddingLeft: tokens.spacing.spacingLarge }}>
          <div
            style={{
              fontSize: tokens.typography.fontSizeSmall,
              fontWeight: tokens.typography.fontWeightMedium,
              color: tokens.color.textLabel,
              marginBottom: 4,
            }}
          >
            Calendar Channels
          </div>
          {account.calendarChannels.map((ch) => {
            const st = SYNC_STATUS_BADGE[ch.syncStatus] ?? { label: ch.syncStatus, variant: 'default' as const };
            return (
              <div
                key={ch.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: tokens.typography.fontSizeSmall,
                  color: tokens.color.textDefault,
                  marginBottom: 2,
                }}
              >
                <span>{ch.handle}</span>
                <Badge label={st.label} variant={st.variant} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const SettingsAccountsPage = () => {
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [disconnecting, setDisconnecting] = useState<string | null>(null);

  const loadAccounts = () => {
    setLoading(true);
    setError(null);

    gql<{ connectedAccounts: { edges: Array<{ node: ConnectedAccount }> } }>(GET_CONNECTED_ACCOUNTS_QUERY)
      .then((result) => {
        if (result.errors) {
          setError(result.errors[0]?.message ?? 'Failed to load accounts');
          return;
        }
        setAccounts(result.data?.connectedAccounts?.edges?.map((e) => e.node) ?? []);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadAccounts(); }, []);

  const handleDisconnect = async (id: string) => {
    setDisconnecting(id);
    try {
      await gql(DISCONNECT_ACCOUNT_MUTATION, { id });
      loadAccounts();
    } catch {
      // Error is not critical here — silently refresh
      loadAccounts();
    } finally {
      setDisconnecting(null);
    }
  };

  const emailAccounts = accounts.filter((a) =>
    (a.messageChannels && a.messageChannels.length > 0) || a.provider === 'IMAP_SMTP',
  );
  const calendarAccounts = accounts.filter((a) =>
    a.calendarChannels && a.calendarChannels.length > 0,
  );
  const displayAccounts = activeTab === 'email' ? emailAccounts : activeTab === 'calendar' ? calendarAccounts : accounts;

  // Build OAuth connect URLs — Twenty uses its server-side OAuth flow
  const apiBase = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');
  const googleOauthUrl = `${apiBase}/auth/google?redirectBack=${encodeURIComponent(window.location.href)}`;
  const microsoftOauthUrl = `${apiBase}/auth/microsoft?redirectBack=${encodeURIComponent(window.location.href)}`;

  return (
    <SettingsLayout>
      <SectionHeader
        title="Connected Accounts"
        description="Connect your email and calendar accounts to sync data into Erencio."
        rightAction={
          <div style={{ display: 'flex', gap: tokens.spacing.spacingXSmall }}>
            <Button
              label="Connect Google"
              variant="neutral"
              iconLeft="plus"
              onClick={() => { window.location.href = googleOauthUrl; }}
            />
            <Button
              label="Connect Microsoft"
              variant="neutral"
              iconLeft="plus"
              onClick={() => { window.location.href = microsoftOauthUrl; }}
            />
          </div>
        }
      />

      <Tabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabs={[
          { id: 'all', label: `All (${accounts.length})` },
          { id: 'email', label: `Email (${emailAccounts.length})` },
          { id: 'calendar', label: `Calendar (${calendarAccounts.length})` },
        ]}
        style={{ marginBottom: tokens.spacing.spacingMedium }}
      />

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: tokens.spacing.spacingXLarge }}>
          <Spinner size="large" />
        </div>
      ) : error ? (
        <div
          role="alert"
          style={{
            padding: tokens.spacing.spacingMedium,
            backgroundColor: tokens.color.errorLight,
            borderRadius: tokens.radius.radiusMedium,
            color: tokens.color.error,
            fontSize: tokens.typography.fontSizeMedium,
          }}
        >
          {error}
        </div>
      ) : displayAccounts.length === 0 ? (
        <EmptyState
          title="No accounts connected"
          description="Connect your Google or Microsoft account to start syncing emails and calendar events."
          action={
            <Button
              label="Connect Google"
              variant="brand"
              iconLeft="plus"
              onClick={() => { window.location.href = googleOauthUrl; }}
            />
          }
        />
      ) : (
        <Card variant="default">
          <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.spacingSmall }}>
            {displayAccounts.map((account) => (
              <div key={account.id} style={{ opacity: disconnecting === account.id ? 0.5 : 1 }}>
                <AccountCard account={account} onDisconnect={handleDisconnect} />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Privacy notice */}
      <div
        style={{
          marginTop: tokens.spacing.spacingLarge,
          padding: tokens.spacing.spacingMedium,
          backgroundColor: tokens.color.infoLight,
          borderRadius: tokens.radius.radiusMedium,
          display: 'flex',
          gap: tokens.spacing.spacingSmall,
          alignItems: 'flex-start',
        }}
      >
        <Icon name="info" size={16} color={tokens.color.info} style={{ marginTop: 2, flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: tokens.typography.fontSizeMedium, fontWeight: tokens.typography.fontWeightMedium, color: tokens.color.textDefault, marginBottom: 2 }}>
            Privacy
          </div>
          <div style={{ fontSize: tokens.typography.fontSizeSmall, color: tokens.color.textLabel }}>
            Only emails and calendar events you have access to are synced. You can disconnect at any time and all synced data will be removed.
          </div>
        </div>
      </div>
    </SettingsLayout>
  );
};
