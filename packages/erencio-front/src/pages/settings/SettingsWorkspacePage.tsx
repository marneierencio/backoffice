import { Button } from '@backoffice/components/Button';
import { ConfirmDialog } from '@backoffice/components/ConfirmDialog';
import { FormElement } from '@backoffice/components/FormElement';
import { Input } from '@backoffice/components/Input';
import { SectionHeader } from '@backoffice/components/SectionHeader';
import { Select } from '@backoffice/components/Select';
import { SettingsLayout } from '@backoffice/components/SettingsLayout';
import { Spinner } from '@backoffice/components/Spinner';
import { useToast } from '@backoffice/hooks/useToast';
import { type WorkspaceSettings, useWorkspaceSettings } from '@backoffice/hooks/useWorkspaceSettings';
import { tokens } from '@backoffice/tokens';
import { useEffect, useState } from 'react';

const frontendPolicyOptions: Array<{
  value: WorkspaceSettings['frontendPolicy'];
  label: string;
}> = [
  { value: 'ALLOW_USER_CHOICE', label: 'Allow user choice (default)' },
  { value: 'FORCE_TWENTY', label: 'Force standard interface (Twenty)' },
  { value: 'FORCE_BACKOFFICE', label: 'Force Erencio.com Backoffice interface (Erencio)' },
];

export const SettingsWorkspacePage = () => {
  const { settings, loading, error, updateName, updateFrontendPolicy, deleteWorkspace } =
    useWorkspaceSettings();
  const { showToast } = useToast();

  const [nameValue, setNameValue] = useState('');
  const [nameSaving, setNameSaving] = useState(false);
  const [policyValue, setPolicyValue] = useState<WorkspaceSettings['frontendPolicy']>(
    'ALLOW_USER_CHOICE',
  );
  const [policySaving, setPolicySaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (settings) {
      setNameValue(settings.displayName);
      setPolicyValue(settings.frontendPolicy);
    }
  }, [settings]);

  const handleSaveName = async () => {
    if (!nameValue.trim()) return;
    setNameSaving(true);
    try {
      await updateName(nameValue.trim());
      showToast({ message: 'Workspace name updated.', variant: 'success' });
    } catch (e) {
      showToast({ message: (e as Error).message, variant: 'error' });
    } finally {
      setNameSaving(false);
    }
  };

  const handleSavePolicy = async (policy: string) => {
    const typed = policy as WorkspaceSettings['frontendPolicy'];
    setPolicyValue(typed);
    setPolicySaving(true);
    try {
      await updateFrontendPolicy(typed);
      showToast({ message: 'Frontend policy updated.', variant: 'success' });
    } catch (e) {
      showToast({ message: (e as Error).message, variant: 'error' });
    } finally {
      setPolicySaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteWorkspace();
      window.location.href = '/';
    } catch (e) {
      showToast({ message: (e as Error).message, variant: 'error' });
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  if (loading) {
    return (
      <SettingsLayout title="Workspace Settings">
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: tokens.spacing.spacingXLarge }}>
          <Spinner size="medium" />
        </div>
      </SettingsLayout>
    );
  }

  if (error) {
    return (
      <SettingsLayout title="Workspace Settings">
        <p style={{ color: tokens.color.error }}>{error}</p>
      </SettingsLayout>
    );
  }

  return (
    <SettingsLayout title="Workspace Settings">
      {/* Name */}
      <section style={{ marginBottom: tokens.spacing.spacingXLarge }}>
        <SectionHeader
          title="Name"
          description="The name of your workspace, visible to all members."
        />
        <div style={{ display: 'flex', gap: tokens.spacing.spacingSmall, alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <FormElement id="workspace-name" label="Workspace name">
              <Input
                id="workspace-name"
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                placeholder="My Workspace"
              />
            </FormElement>
          </div>
          <Button
            label="Save"
            variant="brand"
            size="small"
            loading={nameSaving}
            onClick={handleSaveName}
            disabled={!nameValue.trim() || nameValue === settings?.displayName}
          />
        </div>
      </section>

      {/* Frontend policy */}
      <section style={{ marginBottom: tokens.spacing.spacingXLarge }}>
        <SectionHeader
          title="Frontend Interface Policy"
          description="Control which interface workspace members must use."
        />
        <div style={{ maxWidth: '360px', position: 'relative' }}>
          <FormElement id="frontend-policy" label="Interface policy">
            <Select
              id="frontend-policy"
              value={policyValue}
              options={frontendPolicyOptions}
              onChange={handleSavePolicy}
              disabled={policySaving}
            />
          </FormElement>
          {policySaving && (
            <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }}>
              <Spinner size="x-small" inline />
            </div>
          )}
        </div>
      </section>

      {/* Danger zone */}
      <section>
        <SectionHeader
          title="Danger Zone"
          description="Irreversible and destructive actions."
          style={{ borderBottomColor: tokens.color.error }}
        />
        <div
          style={{
            padding: tokens.spacing.spacingMedium,
            border: `1px solid ${tokens.color.errorLight}`,
            borderRadius: tokens.radius.radiusLarge,
            backgroundColor: tokens.color.errorLight,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: tokens.spacing.spacingMedium,
          }}
        >
          <div>
            <p
              style={{
                fontWeight: tokens.typography.fontWeightMedium,
                color: tokens.color.textDefault,
                margin: 0,
                fontSize: tokens.typography.fontSizeMedium,
              }}
            >
              Delete this workspace
            </p>
            <p
              style={{
                color: tokens.color.textPlaceholder,
                fontSize: tokens.typography.fontSizeSmall,
                margin: `${tokens.spacing.spacingXXSmall} 0 0`,
              }}
            >
              This will permanently delete the workspace and all its data.
            </p>
          </div>
          <Button
            label="Delete workspace"
            variant="destructive"
            size="small"
            onClick={() => setDeleteOpen(true)}
          />
        </div>
      </section>

      <ConfirmDialog
        open={deleteOpen}
        variant="destructive"
        title="Delete workspace"
        message="This action cannot be undone. All data in this workspace will be permanently deleted."
        confirmLabel="Delete workspace"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </SettingsLayout>
  );
};
