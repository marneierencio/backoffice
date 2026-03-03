import { Badge } from '@eds/components/Badge';
import { Button } from '@eds/components/Button';
import { Card } from '@eds/components/Card';
import { useAuth } from '@eds/hooks/useAuth';
import { tokens } from '@eds/tokens';
import { useState } from 'react';

export const ProfileSettingsPage = () => {
  const { user, updateFrontendPreference, logout } = useAuth();
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSwitchToTwenty = async () => {
    setUpdating(true);
    setMessage(null);

    try {
      await updateFrontendPreference('TWENTY');
      setMessage({ type: 'success', text: 'Preference saved. Redirecting to the standard interface…' });
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    } catch {
      setMessage({ type: 'error', text: 'Failed to update preference. Please try again.' });
    } finally {
      setUpdating(false);
    }
  };

  if (!user) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.spacingXLarge }}>
      <h1
        style={{
          fontSize: tokens.typography.fontSizeXXLarge,
          fontWeight: tokens.typography.fontWeightBold,
        }}
      >
        Profile Settings
      </h1>

      <Card title="Account" description="Your account information">
        <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.spacingSmall }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: tokens.color.textLabel }}>Name</span>
            <span style={{ fontWeight: tokens.typography.fontWeightBold }}>
              {user.firstName} {user.lastName}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: tokens.color.textLabel }}>Email</span>
            <span style={{ fontWeight: tokens.typography.fontWeightBold }}>{user.email}</span>
          </div>
        </div>
      </Card>

      <Card
        title="Frontend Interface"
        description="Choose which interface you want to use"
        variant="highlight"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.spacingMedium }}>
          {message && (
            <div
              style={{
                padding: tokens.spacing.spacingSmall,
                borderRadius: tokens.radius.radiusMedium,
                backgroundColor: message.type === 'success' ? tokens.color.successLight : tokens.color.errorLight,
                color: message.type === 'success' ? tokens.color.success : tokens.color.error,
                fontSize: tokens.typography.fontSizeSmall,
              }}
            >
              {message.text}
            </div>
          )}

          <div
            style={{
              display: 'flex',
              gap: tokens.spacing.spacingMedium,
              flexWrap: 'wrap',
            }}
          >
            <div
              style={{
                flex: 1,
                minWidth: '200px',
                padding: tokens.spacing.spacingMedium,
                border: `2px solid ${tokens.color.borderDefault}`,
                borderRadius: tokens.radius.radiusLarge,
                backgroundColor: tokens.color.neutral1,
                display: 'flex',
                flexDirection: 'column',
                gap: tokens.spacing.spacingXSmall,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong>Standard (Twenty)</strong>
                <Button
                  label="Switch"
                  variant="neutral"
                  size="small"
                  loading={updating}
                  onClick={handleSwitchToTwenty}
                />
              </div>
              <p style={{ fontSize: tokens.typography.fontSizeSmall, color: tokens.color.textPlaceholder }}>
                The original Twenty CRM interface
              </p>
            </div>

            <div
              style={{
                flex: 1,
                minWidth: '200px',
                padding: tokens.spacing.spacingMedium,
                border: `2px solid ${tokens.color.brandPrimary}`,
                borderRadius: tokens.radius.radiusLarge,
                backgroundColor: tokens.color.brandPrimaryLight,
                display: 'flex',
                flexDirection: 'column',
                gap: tokens.spacing.spacingXSmall,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong>EDS</strong>
                <Badge label="Current" variant="brand" size="small" />
              </div>
              <p style={{ fontSize: tokens.typography.fontSizeSmall, color: tokens.color.textPlaceholder }}>
                Erencio Design System (EDS) interface
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card title="Session">
        <Button
          label="Sign out"
          variant="outline"
          onClick={logout}
        />
      </Card>
    </div>
  );
};
