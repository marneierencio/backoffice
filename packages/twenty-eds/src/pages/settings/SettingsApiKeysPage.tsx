import { Button } from '@eds/components/Button';
import { ConfirmDialog } from '@eds/components/ConfirmDialog';
import { CopyInput } from '@eds/components/CopyInput';
import { EmptyState } from '@eds/components/EmptyState';
import { FormElement } from '@eds/components/FormElement';
import { Icon } from '@eds/components/Icon';
import { Input } from '@eds/components/Input';
import { Modal } from '@eds/components/Modal';
import { SectionHeader } from '@eds/components/SectionHeader';
import { SettingsLayout } from '@eds/components/SettingsLayout';
import { Spinner } from '@eds/components/Spinner';
import { useApiKeys } from '@eds/hooks/useApiKeys';
import { useToast } from '@eds/hooks/useToast';
import { tokens } from '@eds/tokens';
import { useState } from 'react';

type ExpirationOption = { value: string; label: string };

const EXPIRATION_OPTIONS: ExpirationOption[] = [
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
  { value: '1y', label: '1 year' },
  { value: 'never', label: 'No expiration' },
];

const addDays = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
};

const resolveExpiry = (value: string): string | undefined => {
  if (value === 'never') return undefined;
  if (value === '30d') return addDays(30);
  if (value === '90d') return addDays(90);
  if (value === '1y') return addDays(365);
  return undefined;
};

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(iso));

export const SettingsApiKeysPage = () => {
  const { apiKeys, loading, error, createApiKey, revokeApiKey, refresh } = useApiKeys();
  const { showToast } = useToast();

  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyExpiry, setNewKeyExpiry] = useState<string>('1y');
  const [creating, setCreating] = useState(false);

  // New key modal
  const [issuedToken, setIssuedToken] = useState<string | null>(null);
  const [issuedKeyName, setIssuedKeyName] = useState('');

  // Revoke confirm dialog
  const [revokeTarget, setRevokeTarget] = useState<{ id: string; name: string } | null>(null);
  const [revoking, setRevoking] = useState(false);

  const handleCreate = async () => {
    const trimmed = newKeyName.trim();
    if (!trimmed) return;
    setCreating(true);
    try {
      const result = await createApiKey(trimmed, resolveExpiry(newKeyExpiry));
      setIssuedToken(result.token);
      setIssuedKeyName(trimmed);
      setNewKeyName('');
      setNewKeyExpiry('1y');
      refresh();
    } catch {
      showToast({ message: 'Failed to create API key.', variant: 'error' });
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async () => {
    if (!revokeTarget) return;
    setRevoking(true);
    try {
      await revokeApiKey(revokeTarget.id);
      showToast({ message: `API key "${revokeTarget.name}" revoked.`, variant: 'success' });
      setRevokeTarget(null);
      refresh();
    } catch {
      showToast({ message: 'Failed to revoke API key.', variant: 'error' });
    } finally {
      setRevoking(false);
    }
  };

  return (
    <SettingsLayout title="API Keys">
      {/* Create new key */}
      <section style={{ marginBottom: tokens.spacing.spacingXLarge }}>
        <SectionHeader
          title="New API key"
          description="API keys allow external services and integrations to connect to your workspace."
        />
        <div
          style={{
            padding: tokens.spacing.spacingLarge,
            border: `1px solid ${tokens.color.borderDefault}`,
            borderRadius: tokens.radius.radiusLarge,
            display: 'flex',
            flexDirection: 'column',
            gap: tokens.spacing.spacingMedium,
          }}
        >
          <div style={{ display: 'flex', gap: tokens.spacing.spacingMedium, alignItems: 'flex-end' }}>
            <FormElement
              label="Key name"
              id="api-key-name"
              style={{ flex: 1 }}
            >
              <Input
                id="api-key-name"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="e.g. Zapier Integration"
              />
            </FormElement>

            <FormElement
              label="Expiration"
              id="api-key-expiry"
              style={{ width: 160 }}
            >
              <select
                id="api-key-expiry"
                value={newKeyExpiry}
                onChange={(e) => setNewKeyExpiry(e.target.value)}
                style={{
                  width: '100%',
                  height: 36,
                  borderRadius: tokens.radius.radiusMedium,
                  border: `1px solid ${tokens.color.borderDefault}`,
                  padding: `0 ${tokens.spacing.spacingSmall}`,
                  fontSize: tokens.typography.fontSizeMedium,
                  fontFamily: tokens.typography.fontFamilyBase,
                  color: tokens.color.textDefault,
                  backgroundColor: tokens.color.neutral0,
                  cursor: 'pointer',
                }}
              >
                {EXPIRATION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </FormElement>

            <Button
              label="Generate"
              variant="brand"
              onClick={handleCreate}
              disabled={!newKeyName.trim() || creating}
              iconLeft={creating ? undefined : <Icon name="key" size={14} color="currentColor" aria-hidden />}
              loading={creating}
            />
          </div>
        </div>
      </section>

      {/* Existing keys */}
      <section>
        <SectionHeader
          title="Active keys"
          description="These keys currently have access to your workspace."
        />
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: tokens.spacing.spacingXLarge }}>
            <Spinner size="medium" />
          </div>
        ) : error ? (
          <p style={{ color: tokens.color.error }}>{error}</p>
        ) : apiKeys.length === 0 ? (
          <EmptyState
            title="No active API keys"
            description="Generate a key above to start connecting external services."
            icon="key"
          />
        ) : (
          <div
            role="table"
            aria-label="Active API keys"
            style={{
              border: `1px solid ${tokens.color.borderDefault}`,
              borderRadius: tokens.radius.radiusLarge,
              overflow: 'hidden',
              fontFamily: tokens.typography.fontFamilyBase,
            }}
          >
            <div
              role="row"
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr auto',
                padding: `${tokens.spacing.spacingXSmall} ${tokens.spacing.spacingMedium}`,
                backgroundColor: tokens.color.neutral1,
                borderBottom: `1px solid ${tokens.color.borderDefault}`,
                fontSize: tokens.typography.fontSizeSmall,
                fontWeight: tokens.typography.fontWeightMedium,
                color: tokens.color.textPlaceholder,
                gap: tokens.spacing.spacingMedium,
              }}
            >
              <span role="columnheader">Name</span>
              <span role="columnheader">Created</span>
              <span role="columnheader">Expires</span>
              <span role="columnheader">
                <span className="sr-only">Actions</span>
              </span>
            </div>
            {apiKeys.map((key, idx) => (
              <div
                key={key.id}
                role="row"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr auto',
                  padding: `${tokens.spacing.spacingSmall} ${tokens.spacing.spacingMedium}`,
                  borderBottom: idx < apiKeys.length - 1 ? `1px solid ${tokens.color.borderDefault}` : undefined,
                  alignItems: 'center',
                  gap: tokens.spacing.spacingMedium,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.spacingXSmall }}>
                  <Icon name="key" size={14} color={tokens.color.textPlaceholder} aria-hidden />
                  <span
                    style={{
                      fontWeight: tokens.typography.fontWeightMedium,
                      fontSize: tokens.typography.fontSizeMedium,
                      color: tokens.color.textDefault,
                    }}
                  >
                    {key.name}
                  </span>
                </div>
                <span style={{ fontSize: tokens.typography.fontSizeMedium, color: tokens.color.textPlaceholder }}>
                  {formatDate(key.createdAt)}
                </span>
                <span style={{ fontSize: tokens.typography.fontSizeMedium, color: tokens.color.textPlaceholder }}>
                  {key.expiresAt ? formatDate(key.expiresAt) : 'Never'}
                </span>
                <Button
                  label="Revoke"
                  variant="destructive"
                  size="small"
                  onClick={() => setRevokeTarget({ id: key.id, name: key.name })}
                  aria-label={`Revoke API key ${key.name}`}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* New key token modal */}
      {issuedToken && (
        <Modal
          open={true}
          title="API Key Created"
          onClose={() => setIssuedToken(null)}
          footer={
            <Button
              label="Done"
              variant="brand"
              onClick={() => setIssuedToken(null)}
            />
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.spacingMedium }}>
            <div
              style={{
                display: 'flex',
                gap: tokens.spacing.spacingSmall,
                padding: tokens.spacing.spacingMedium,
                backgroundColor: tokens.color.warningLight,
                borderRadius: tokens.radius.radiusMedium,
                fontSize: tokens.typography.fontSizeSmall,
                color: tokens.color.warning,
              }}
            >
              <Icon name="shield" size={14} color={tokens.color.warning} aria-hidden />
              <span>
                <strong>Copy and store this token now.</strong> It will not be shown again after you close this dialog.
              </span>
            </div>
            <FormElement label={`Token for "${issuedKeyName}"`} id="new-api-key-token">
              <CopyInput
                id="new-api-key-token"
                value={issuedToken}
                masked
                successMessage="Token copied!"
              />
            </FormElement>
          </div>
        </Modal>
      )}

      {/* Revoke confirm dialog */}
      {revokeTarget && (
        <ConfirmDialog
          open
          title="Revoke API Key"
          message={`Are you sure you want to revoke the key "${revokeTarget.name}"? Any integrations using this key will immediately lose access.`}
          confirmLabel="Revoke"
          variant="destructive"
          loading={revoking}
          onConfirm={handleRevoke}
          onCancel={() => setRevokeTarget(null)}
        />
      )}
    </SettingsLayout>
  );
};
