import { Badge } from '@eds/components/Badge';
import { Card } from '@eds/components/Card';
import { EmptyState } from '@eds/components/EmptyState';
import { Icon } from '@eds/components/Icon';
import { SectionHeader } from '@eds/components/SectionHeader';
import { SettingsLayout } from '@eds/components/SettingsLayout';
import { Spinner } from '@eds/components/Spinner';
import { useToast } from '@eds/hooks/useToast';
import { tokens } from '@eds/tokens';
import { gql } from '@eds/utils/api';
import { useCallback, useEffect, useState } from 'react';

type BillingSubscriptionStatus =
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'unpaid'
  | 'paused';

type BillingSubscription = {
  id: string;
  status: BillingSubscriptionStatus;
  interval: 'month' | 'year';
  currentPeriodEnd: string | null;
  trialEnd: string | null;
};

const GET_BILLING_SUBSCRIPTION = `
  query GetBillingSubscription {
    currentBillingSubscription {
      id
      status
      interval
      currentPeriodEnd
      trialEnd
    }
  }
`;

const statusBadgeVariant = (
  status: BillingSubscriptionStatus,
): 'success' | 'info' | 'warning' | 'default' | 'brand' => {
  switch (status) {
    case 'active': return 'success';
    case 'trialing': return 'info';
    case 'past_due':
    case 'unpaid': return 'warning';
    case 'canceled':
    case 'incomplete_expired': return 'default';
    default: return 'default';
  }
};

const statusLabel = (status: BillingSubscriptionStatus): string => {
  const labels: Record<BillingSubscriptionStatus, string> = {
    active: 'Active',
    trialing: 'Trial',
    past_due: 'Past Due',
    canceled: 'Canceled',
    incomplete: 'Incomplete',
    incomplete_expired: 'Expired',
    unpaid: 'Unpaid',
    paused: 'Paused',
  };
  return labels[status] ?? status;
};

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(iso));

export const SettingsBillingPage = () => {
  const { showToast } = useToast();
  const [subscription, setSubscription] = useState<BillingSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await gql<{ currentBillingSubscription: BillingSubscription | null }>(
        GET_BILLING_SUBSCRIPTION,
      );
      setSubscription(result.data?.currentBillingSubscription ?? null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load billing information.';
      setError(message);
      showToast({ message, variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  if (loading) {
    return (
      <SettingsLayout title="Billing">
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: tokens.spacing.spacingXLarge }}>
          <Spinner size="medium" />
        </div>
      </SettingsLayout>
    );
  }

  if (error) {
    return (
      <SettingsLayout title="Billing">
        <p style={{ color: tokens.color.error }}>{error}</p>
      </SettingsLayout>
    );
  }

  if (!subscription) {
    return (
      <SettingsLayout title="Billing">
        <EmptyState
          title="No active subscription"
          description="Your workspace is on the free plan. Upgrade to unlock advanced features including API access, custom objects, and more workspace members."
          icon="credit-card"
        />
      </SettingsLayout>
    );
  }

  const isTrialing = subscription.status === 'trialing';
  const isPastDue = subscription.status === 'past_due' || subscription.status === 'unpaid';

  return (
    <SettingsLayout title="Billing">
      {/* Subscription overview */}
      <section style={{ marginBottom: tokens.spacing.spacingXLarge }}>
        <SectionHeader title="Subscription" description="Your current workspace plan and billing status." />

        <Card>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: tokens.spacing.spacingLarge,
            }}
          >
            {/* Status */}
            <div>
              <div
                style={{
                  fontSize: tokens.typography.fontSizeSmall,
                  fontWeight: tokens.typography.fontWeightMedium,
                  color: tokens.color.textPlaceholder,
                  marginBottom: tokens.spacing.spacingXSmall,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Status
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.spacingXSmall }}>
                <Badge
                  label={statusLabel(subscription.status)}
                  variant={statusBadgeVariant(subscription.status)}
                />
              </div>
            </div>

            {/* Billing interval */}
            <div>
              <div
                style={{
                  fontSize: tokens.typography.fontSizeSmall,
                  fontWeight: tokens.typography.fontWeightMedium,
                  color: tokens.color.textPlaceholder,
                  marginBottom: tokens.spacing.spacingXSmall,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Billing Cycle
              </div>
              <div style={{ fontSize: tokens.typography.fontSizeMedium, color: tokens.color.textDefault }}>
                {subscription.interval === 'month' ? 'Monthly' : 'Annual'}
              </div>
            </div>

            {/* Current period end */}
            {subscription.currentPeriodEnd && (
              <div>
                <div
                  style={{
                    fontSize: tokens.typography.fontSizeSmall,
                    fontWeight: tokens.typography.fontWeightMedium,
                    color: tokens.color.textPlaceholder,
                    marginBottom: tokens.spacing.spacingXSmall,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {subscription.status === 'canceled' ? 'Access until' : 'Next renewal'}
                </div>
                <div style={{ fontSize: tokens.typography.fontSizeMedium, color: tokens.color.textDefault }}>
                  {formatDate(subscription.currentPeriodEnd)}
                </div>
              </div>
            )}

            {/* Trial end */}
            {isTrialing && subscription.trialEnd && (
              <div>
                <div
                  style={{
                    fontSize: tokens.typography.fontSizeSmall,
                    fontWeight: tokens.typography.fontWeightMedium,
                    color: tokens.color.textPlaceholder,
                    marginBottom: tokens.spacing.spacingXSmall,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Trial ends
                </div>
                <div style={{ fontSize: tokens.typography.fontSizeMedium, color: tokens.color.brandPrimary }}>
                  {formatDate(subscription.trialEnd)}
                </div>
              </div>
            )}
          </div>
        </Card>
      </section>

      {/* Alerts */}
      {isPastDue && (
        <section style={{ marginBottom: tokens.spacing.spacingXLarge }}>
          <div
            role="alert"
            style={{
              display: 'flex',
              gap: tokens.spacing.spacingSmall,
              padding: tokens.spacing.spacingMedium,
              backgroundColor: tokens.color.warningLight,
              border: `1px solid ${tokens.color.borderWarning}`,
              borderRadius: tokens.radius.radiusMedium,
              fontSize: tokens.typography.fontSizeMedium,
              color: tokens.color.warning,
            }}
          >
            <Icon name="shield" size={16} color={tokens.color.warning} aria-hidden />
            <div>
              <strong>Payment issue detected.</strong> Please update your payment method to avoid interruption of service.
            </div>
          </div>
        </section>
      )}

      {/* Manage billing */}
      <section>
        <SectionHeader
          title="Manage billing"
          description="Update your payment method, download invoices, or change your plan through the billing portal."
        />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing.spacingSmall,
            padding: tokens.spacing.spacingMedium,
            backgroundColor: tokens.color.neutral1,
            borderRadius: tokens.radius.radiusMedium,
            fontSize: tokens.typography.fontSizeSmall,
            color: tokens.color.textPlaceholder,
          }}
        >
          <Icon name="credit-card" size={14} color={tokens.color.textPlaceholder} aria-hidden />
          <span>Billing is managed through Twenty&apos;s secure Stripe portal. Contact your account manager for plan changes.</span>
        </div>
      </section>
    </SettingsLayout>
  );
};
