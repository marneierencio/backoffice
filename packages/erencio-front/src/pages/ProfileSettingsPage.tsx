import { Badge } from '@backoffice/components/Badge';
import { Button } from '@backoffice/components/Button';
import { Card } from '@backoffice/components/Card';
import { Select } from '@backoffice/components/Select';
import { useAuth } from '@backoffice/hooks/useAuth';
import { tokens } from '@backoffice/tokens';
import { useState } from 'react';

const LOCALE_OPTIONS = [
  { value: 'af-ZA', label: 'Afrikaans' },
  { value: 'ar-SA', label: 'Arabic' },
  { value: 'ca-ES', label: 'Catalan' },
  { value: 'zh-CN', label: 'Chinese — Simplified' },
  { value: 'zh-TW', label: 'Chinese — Traditional' },
  { value: 'cs-CZ', label: 'Czech' },
  { value: 'da-DK', label: 'Danish' },
  { value: 'nl-NL', label: 'Dutch' },
  { value: 'en', label: 'English' },
  { value: 'fi-FI', label: 'Finnish' },
  { value: 'fr-FR', label: 'French' },
  { value: 'de-DE', label: 'German' },
  { value: 'el-GR', label: 'Greek' },
  { value: 'he-IL', label: 'Hebrew' },
  { value: 'hu-HU', label: 'Hungarian' },
  { value: 'it-IT', label: 'Italian' },
  { value: 'ja-JP', label: 'Japanese' },
  { value: 'ko-KR', label: 'Korean' },
  { value: 'no-NO', label: 'Norwegian' },
  { value: 'pl-PL', label: 'Polish' },
  { value: 'pt-PT', label: 'Portuguese — Portugal' },
  { value: 'pt-BR', label: 'Portuguese — Brazil' },
  { value: 'ro-RO', label: 'Romanian' },
  { value: 'ru-RU', label: 'Russian' },
  { value: 'sr-Cyrl', label: 'Serbian (Cyrillic)' },
  { value: 'es-ES', label: 'Spanish' },
  { value: 'sv-SE', label: 'Swedish' },
  { value: 'tr-TR', label: 'Turkish' },
  { value: 'uk-UA', label: 'Ukrainian' },
  { value: 'vi-VN', label: 'Vietnamese' },
].sort((a, b) => a.label.localeCompare(b.label));

export const ProfileSettingsPage = () => {
  const { user, updateFrontendPreference, updateLocale, logout } = useAuth();
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [localeUpdating, setLocaleUpdating] = useState(false);
  const [localeMessage, setLocaleMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

  const handleLocaleChange = async (value: string) => {
    setLocaleUpdating(true);
    setLocaleMessage(null);

    try {
      await updateLocale(value);
      setLocaleMessage({ type: 'success', text: 'Language updated successfully.' });
    } catch {
      setLocaleMessage({ type: 'error', text: 'Failed to update language. Please try again.' });
    } finally {
      setLocaleUpdating(false);
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

      <Card title="Experience" description="Customize language and interface preferences">
        <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.spacingMedium }}>
          <div>
            <div
              style={{
                fontSize: tokens.typography.fontSizeSmall,
                fontWeight: tokens.typography.fontWeightBold,
                color: tokens.color.textLabel,
                marginBottom: tokens.spacing.spacingXSmall,
              }}
            >
              Language
            </div>
            <div
              style={{
                fontSize: tokens.typography.fontSizeSmall,
                color: tokens.color.textPlaceholder,
                marginBottom: tokens.spacing.spacingSmall,
              }}
            >
              Select your preferred language
            </div>
            <Select
              value={user.locale ?? 'en'}
              options={LOCALE_OPTIONS}
              onChange={localeUpdating ? undefined : handleLocaleChange}
              disabled={localeUpdating}
              aria-label="Language"
            />
            {localeMessage && (
              <div
                style={{
                  marginTop: tokens.spacing.spacingXSmall,
                  padding: tokens.spacing.spacingXSmall,
                  borderRadius: tokens.radius.radiusMedium,
                  backgroundColor: localeMessage.type === 'success' ? tokens.color.successLight : tokens.color.errorLight,
                  color: localeMessage.type === 'success' ? tokens.color.success : tokens.color.error,
                  fontSize: tokens.typography.fontSizeSmall,
                }}
              >
                {localeMessage.text}
              </div>
            )}
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
                <strong>Erencio.com Backoffice</strong>
                <Badge label="Current" variant="brand" size="small" />
              </div>
              <p style={{ fontSize: tokens.typography.fontSizeSmall, color: tokens.color.textPlaceholder }}>
                Erencio.com Backoffice interface
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
