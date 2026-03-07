// Settings > Security — SSO, 2FA, and security configuration
// SLDS 2 reference: https://www.lightningdesignsystem.com/components/form-element/
// Mirrors Twenty's SettingsSecurity page
import { Badge } from '@eds/components/Badge';
import { Button } from '@eds/components/Button';
import { Card } from '@eds/components/Card';
import { ConfirmDialog } from '@eds/components/ConfirmDialog';
import { FormElement } from '@eds/components/FormElement';
import { Icon } from '@eds/components/Icon';
import { Input } from '@eds/components/Input';
import { Modal } from '@eds/components/Modal';
import { SectionHeader } from '@eds/components/SectionHeader';
import { Select } from '@eds/components/Select';
import { SettingsLayout } from '@eds/components/SettingsLayout';
import { Spinner } from '@eds/components/Spinner';
import { Switch } from '@eds/components/Switch';
import { tokens } from '@eds/tokens';
import { gql } from '@eds/utils/api';
import { useEffect, useState } from 'react';

type SsoProvider = {
  id: string;
  name: string;
  type: 'SAML' | 'OIDC';
  issuer: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ERROR';
  createdAt: string;
};

const GET_SSO_PROVIDERS_QUERY = `
  query GetSsoIdentityProviders {
    getSSOIdentityProviders {
      id
      name
      type
      issuer
      status
      createdAt
    }
  }
`;

const ADD_SAML_MUTATION = `
  mutation CreateSamlIdentityProvider($input: SetupSSOInput!) {
    createSAMLIdentityProvider(input: $input) {
      id
      name
      type
      issuer
      status
      createdAt
    }
  }
`;

const ADD_OIDC_MUTATION = `
  mutation CreateOidcIdentityProvider($input: SetupSSOInput!) {
    createOIDCIdentityProvider(input: $input) {
      id
      name
      type
      issuer
      status
      createdAt
    }
  }
`;

const DELETE_SSO_MUTATION = `
  mutation DeleteSsoIdentityProvider($id: String!) {
    deleteSSOIdentityProvider(input: { id: $id }) {
      id
    }
  }
`;

const STATUS_BADGE: Record<string, { label: string; variant: 'success' | 'error' | 'warning' | 'default' }> = {
  ACTIVE: { label: 'Active', variant: 'success' },
  INACTIVE: { label: 'Inactive', variant: 'default' },
  ERROR: { label: 'Error', variant: 'error' },
};

const SSO_TYPE_OPTIONS = [
  { value: 'SAML', label: 'SAML 2.0' },
  { value: 'OIDC', label: 'OpenID Connect (OIDC)' },
];

type SsoFormData = {
  name: string;
  type: 'SAML' | 'OIDC';
  // SAML
  metadataXml: string;
  // OIDC
  clientId: string;
  clientSecret: string;
  discoveryEndpoint: string;
};

const EMPTY_SSO_FORM: SsoFormData = {
  name: '',
  type: 'SAML',
  metadataXml: '',
  clientId: '',
  clientSecret: '',
  discoveryEndpoint: '',
};

export const SettingsSecurityPage = () => {
  const [providers, setProviders] = useState<SsoProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState<SsoFormData>(EMPTY_SSO_FORM);

  // Password policy flags (UI-only — actual enforcement is server-side)
  const [require2fa, setRequire2fa] = useState(false);
  const [passwordMinLength, setPasswordMinLength] = useState('8');

  const loadProviders = () => {
    setLoading(true);
    setError(null);
    gql<{ getSSOIdentityProviders: SsoProvider[] }>(GET_SSO_PROVIDERS_QUERY)
      .then((result) => {
        if (result.errors) {
          setError(result.errors[0]?.message ?? 'Failed to load SSO providers');
          return;
        }
        setProviders(result.data?.getSSOIdentityProviders ?? []);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadProviders(); }, []);

  const handleAddProvider = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const mutation = form.type === 'SAML' ? ADD_SAML_MUTATION : ADD_OIDC_MUTATION;
      const input = form.type === 'SAML'
        ? { name: form.name, samlMetadataXML: form.metadataXml }
        : { name: form.name, clientId: form.clientId, clientSecret: form.clientSecret, discoveryEndpoint: form.discoveryEndpoint };

      const result = await gql(mutation, { input });
      if (result.errors) throw new Error(result.errors[0]?.message ?? 'Failed to add provider');

      setAddOpen(false);
      setForm(EMPTY_SSO_FORM);
      loadProviders();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProvider = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const result = await gql(DELETE_SSO_MUTATION, { id: deleteTarget.id });
      if (result.errors) throw new Error(result.errors[0]?.message ?? 'Failed to delete provider');
      setDeleteTarget(null);
      loadProviders();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setDeleting(false);
    }
  };

  const samlFormValid = form.name.trim().length > 0 && form.metadataXml.trim().length > 0;
  const oidcFormValid = form.name.trim().length > 0 && form.clientId.trim().length > 0 && form.discoveryEndpoint.trim().length > 0;
  const formValid = form.type === 'SAML' ? samlFormValid : oidcFormValid;

  return (
    <SettingsLayout>
      {/* == Single Sign-On == */}
      <SectionHeader
        title="Single Sign-On (SSO)"
        description="Configure SAML 2.0 or OIDC identity providers to allow your team to sign in with existing corporate credentials."
        rightAction={
          <Button
            label="Add Identity Provider"
            variant="brand"
            iconLeft="plus"
            onClick={() => setAddOpen(true)}
          />
        }
      />

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: tokens.spacing.spacingLarge }}>
          <Spinner size="medium" />
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
            marginBottom: tokens.spacing.spacingMedium,
          }}
        >
          {error}
        </div>
      ) : providers.length === 0 ? (
        <div
          style={{
            padding: tokens.spacing.spacingLarge,
            textAlign: 'center',
            border: `1px dashed ${tokens.color.borderDefault}`,
            borderRadius: tokens.radius.radiusMedium,
            color: tokens.color.textPlaceholder,
            fontSize: tokens.typography.fontSizeMedium,
            marginBottom: tokens.spacing.spacingLarge,
          }}
        >
          No identity providers configured. Add a SAML or OIDC provider to enable SSO.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.spacingSmall, marginBottom: tokens.spacing.spacingLarge }}>
          {providers.map((provider) => {
            const st = STATUS_BADGE[provider.status] ?? { label: provider.status, variant: 'default' as const };
            return (
              <div
                key={provider.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing.spacingSmall,
                  padding: tokens.spacing.spacingMedium,
                  border: `1px solid ${tokens.color.borderDefault}`,
                  borderRadius: tokens.radius.radiusMedium,
                  backgroundColor: tokens.color.neutral0,
                }}
              >
                <Icon name="shield" size={18} color={tokens.color.brandPrimary} style={{ flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: tokens.typography.fontSizeMedium, fontWeight: tokens.typography.fontWeightMedium, color: tokens.color.textDefault }}>
                    {provider.name}
                  </div>
                  <div style={{ fontSize: tokens.typography.fontSizeSmall, color: tokens.color.textPlaceholder }}>
                    {provider.type} · {provider.issuer}
                  </div>
                </div>
                <Badge label={st.label} variant={st.variant} />
                <button
                  aria-label={`Remove ${provider.name}`}
                  title="Remove provider"
                  onClick={() => setDeleteTarget({ id: provider.id, name: provider.name })}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 4,
                    color: tokens.color.error,
                    borderRadius: tokens.radius.radiusSmall,
                  }}
                >
                  <Icon name="trash-2" size={16} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* == Password Policy == */}
      <SectionHeader
        title="Password Policy"
        description="Define minimum security requirements for user passwords in this workspace."
        style={{ marginTop: tokens.spacing.spacingXLarge }}
      />

      <Card variant="default">
        <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.spacingMedium }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: tokens.typography.fontSizeMedium, fontWeight: tokens.typography.fontWeightMedium, color: tokens.color.textDefault }}>
                Require Two-Factor Authentication
              </div>
              <div style={{ fontSize: tokens.typography.fontSizeSmall, color: tokens.color.textPlaceholder, marginTop: 2 }}>
                All workspace members must enable 2FA to sign in
              </div>
            </div>
            <Switch
              checked={require2fa}
              onChange={setRequire2fa}
              aria-label="Require two-factor authentication"
            />
          </div>

          <div
            style={{
              borderTop: `1px solid ${tokens.color.borderDefault}`,
              paddingTop: tokens.spacing.spacingMedium,
            }}
          >
            <FormElement
              label="Minimum password length"
              hint="Passwords shorter than this value will be rejected"
            >
              <Input
                id="password-min-length"
                type="number"
                value={passwordMinLength}
                placeholder="8"
                onChange={(e) => setPasswordMinLength(e.target.value)}
                style={{ maxWidth: 120 }}
              />
            </FormElement>
          </div>
        </div>
      </Card>

      {/* Note: password policy is informational in EDS — enforcement happens in the Twenty server */}
      <div
        style={{
          marginTop: tokens.spacing.spacingMedium,
          padding: tokens.spacing.spacingSmall,
          borderRadius: tokens.radius.radiusMedium,
          backgroundColor: tokens.color.warningLight,
          display: 'flex',
          gap: tokens.spacing.spacingXSmall,
          alignItems: 'flex-start',
          fontSize: tokens.typography.fontSizeSmall,
          color: tokens.color.textLabel,
        }}
      >
        <Icon name="alert-triangle" size={14} color={tokens.color.warning} style={{ marginTop: 2, flexShrink: 0 }} />
        Password policy and 2FA enforcement are applied server-side. These UI settings reflect the current workspace policy but enforcement is configured in your Twenty server environment variables.
      </div>

      {/* == SP Metadata (for SAML) == */}
      {providers.some((p) => p.type === 'SAML') && (
        <>
          <SectionHeader
            title="Service Provider Metadata"
            description="Provide this information to your Identity Provider when configuring the SAML integration."
            style={{ marginTop: tokens.spacing.spacingXLarge }}
          />

          <Card variant="default">
            <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.spacingSmall }}>
              <LabelValue
                label="Entity ID (SP)"
                value={`${(import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')}/auth/saml/metadata`}
              />
              <LabelValue
                label="ACS URL (Assertion Consumer Service)"
                value={`${(import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')}/auth/saml/callback`}
              />
            </div>
          </Card>
        </>
      )}

      {/* Add SSO Provider modal */}
      <Modal
        isOpen={addOpen}
        onClose={() => { setAddOpen(false); setForm(EMPTY_SSO_FORM); }}
        title="Add Identity Provider"
        footer={
          <>
            <Button label="Cancel" variant="neutral" onClick={() => { setAddOpen(false); setForm(EMPTY_SSO_FORM); }} disabled={saving} />
            <Button label="Add Provider" variant="brand" onClick={handleAddProvider} loading={saving} disabled={!formValid} />
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.spacingMedium }}>
          <FormElement label="Display Name" required>
            <Input
              id="sso-name"
              value={form.name}
              placeholder="e.g., Company Okta"
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </FormElement>

          <FormElement label="Protocol" required>
            <Select
              id="sso-type"
              value={form.type}
              options={SSO_TYPE_OPTIONS}
              onChange={(v) => setForm((f) => ({ ...f, type: v as 'SAML' | 'OIDC' }))}
            />
          </FormElement>

          {form.type === 'SAML' ? (
            <FormElement
              label="SAML Metadata XML"
              required
              hint="Paste the XML metadata from your identity provider"
            >
              <textarea
                id="sso-metadata-xml"
                value={form.metadataXml}
                placeholder="<?xml version=&quot;1.0&quot;?><EntityDescriptor …"
                rows={6}
                onChange={(e) => setForm((f) => ({ ...f, metadataXml: e.target.value }))}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: `${tokens.spacing.spacingXSmall} ${tokens.spacing.spacingSmall}`,
                  border: `1px solid ${tokens.color.borderInput}`,
                  borderRadius: tokens.radius.radiusMedium,
                  fontSize: tokens.typography.fontSizeSmall,
                  fontFamily: 'monospace',
                  resize: 'vertical',
                  outline: 'none',
                }}
              />
            </FormElement>
          ) : (
            <>
              <FormElement label="Discovery Endpoint" required hint="OIDC /.well-known/openid-configuration URL">
                <Input
                  id="sso-discovery"
                  type="url"
                  value={form.discoveryEndpoint}
                  placeholder="https://accounts.example.com/.well-known/openid-configuration"
                  onChange={(e) => setForm((f) => ({ ...f, discoveryEndpoint: e.target.value }))}
                />
              </FormElement>
              <FormElement label="Client ID" required>
                <Input
                  id="sso-client-id"
                  value={form.clientId}
                  placeholder="your-client-id"
                  onChange={(e) => setForm((f) => ({ ...f, clientId: e.target.value }))}
                />
              </FormElement>
              <FormElement label="Client Secret" required>
                <Input
                  id="sso-client-secret"
                  type="password"
                  value={form.clientSecret}
                  placeholder="••••••••"
                  onChange={(e) => setForm((f) => ({ ...f, clientSecret: e.target.value }))}
                />
              </FormElement>
            </>
          )}
        </div>
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title="Remove Identity Provider"
        message={`Are you sure you want to remove "${deleteTarget?.name ?? ''}"? Users currently relying on this SSO provider will no longer be able to sign in with it.`}
        confirmLabel="Remove"
        variant="destructive"
        loading={deleting}
        onConfirm={handleDeleteProvider}
        onCancel={() => setDeleteTarget(null)}
      />
    </SettingsLayout>
  );
};

// Local helper: label + value pair (like SLDS Reading Form)
const LabelValue = ({ label, value }: { label: string; value: string }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
    <span style={{ fontSize: tokens.typography.fontSizeSmall, fontWeight: tokens.typography.fontWeightMedium, color: tokens.color.textLabel }}>
      {label}
    </span>
    <code
      style={{
        fontSize: tokens.typography.fontSizeSmall,
        backgroundColor: tokens.color.neutral1,
        padding: `${tokens.spacing.spacingXXXSmall} ${tokens.spacing.spacingXSmall}`,
        borderRadius: tokens.radius.radiusSmall,
        color: tokens.color.textDefault,
        wordBreak: 'break-all',
      }}
    >
      {value}
    </code>
  </div>
);
