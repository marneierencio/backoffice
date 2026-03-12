import { Avatar } from '@backoffice/components/Avatar';
import { Badge } from '@backoffice/components/Badge';
import { Button } from '@backoffice/components/Button';
import { ConfirmDialog } from '@backoffice/components/ConfirmDialog';
import { Icon } from '@backoffice/components/Icon';
import { SectionHeader } from '@backoffice/components/SectionHeader';
import { SettingsLayout } from '@backoffice/components/SettingsLayout';
import { Spinner } from '@backoffice/components/Spinner';
import { useRoles } from '@backoffice/hooks/useRoles';
import { useToast } from '@backoffice/hooks/useToast';
import { useWorkspaceMembers } from '@backoffice/hooks/useWorkspaceMembers';
import { tokens } from '@backoffice/tokens';
import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

export const SettingsMemberDetailPage = () => {
  const { memberId = '' } = useParams<{ memberId: string }>();
  const { members, removeMember } = useWorkspaceMembers();
  const { roles, loading: rolesLoading } = useRoles();
  const { showToast } = useToast();

  const [removeOpen, setRemoveOpen] = useState(false);
  const [removing, setRemoving] = useState(false);

  const member = useMemo(
    () => members.find((m) => m.id === memberId),
    [members, memberId],
  );

  const handleRemove = async () => {
    if (!member) return;
    setRemoving(true);
    try {
      await removeMember(member.userId);
      showToast({ message: 'Member removed from workspace.', variant: 'success' });
      window.location.hash = '#/settings/members';
    } catch (e) {
      showToast({ message: (e as Error).message, variant: 'error' });
      setRemoving(false);
      setRemoveOpen(false);
    }
  };

  if (!member) {
    return (
      <SettingsLayout title="Member">
        {members.length === 0 ? (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: tokens.spacing.spacingXLarge }}>
            <Spinner size="medium" />
          </div>
        ) : (
          <p style={{ color: tokens.color.textPlaceholder }}>Member not found.</p>
        )}
      </SettingsLayout>
    );
  }

  const fullName = `${member.name.firstName} ${member.name.lastName}`.trim() || member.userEmail;

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  return (
    <SettingsLayout title="Member detail">
      {/* Back link */}
      <div style={{ marginBottom: tokens.spacing.spacingMedium }}>
        <a
          href="#/settings/members"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: tokens.spacing.spacingXXSmall,
            fontSize: tokens.typography.fontSizeSmall,
            color: tokens.color.textLink,
            textDecoration: 'none',
          }}
        >
          <Icon name="arrow-left" size={12} color="currentColor" aria-hidden />
          Back to members
        </a>
      </div>

      {/* Member header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing.spacingMedium,
          marginBottom: tokens.spacing.spacingXLarge,
          padding: tokens.spacing.spacingMedium,
          border: `1px solid ${tokens.color.borderDefault}`,
          borderRadius: tokens.radius.radiusLarge,
          backgroundColor: tokens.color.neutral0,
        }}
      >
        <Avatar
          name={fullName}
          src={member.avatarUrl ?? undefined}
          size="large"
          type="user"
        />
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: tokens.typography.fontSizeXLarge,
              fontWeight: tokens.typography.fontWeightMedium,
              color: tokens.color.textDefault,
            }}
          >
            {fullName}
          </h2>
          <p
            style={{
              margin: `${tokens.spacing.spacingXXSmall} 0 0`,
              fontSize: tokens.typography.fontSizeMedium,
              color: tokens.color.textPlaceholder,
            }}
          >
            {member.userEmail}
          </p>
          <p
            style={{
              margin: `${tokens.spacing.spacingXXSmall} 0 0`,
              fontSize: tokens.typography.fontSizeSmall,
              color: tokens.color.textPlaceholder,
            }}
          >
            Member since {formatDate(member.createdAt)}
          </p>
        </div>
      </div>

      {/* Roles */}
      <section style={{ marginBottom: tokens.spacing.spacingXLarge }}>
        <SectionHeader
          title="Roles & Permissions"
          description="Roles assigned to this workspace member."
        />
        {rolesLoading ? (
          <Spinner size="small" inline />
        ) : roles.length === 0 ? (
          <p style={{ color: tokens.color.textPlaceholder, fontSize: tokens.typography.fontSizeMedium }}>
            No roles assigned.
          </p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: tokens.spacing.spacingXSmall }}>
            {roles.map((role) => (
              <div
                key={role.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing.spacingXXSmall,
                  padding: `${tokens.spacing.spacingXXSmall} ${tokens.spacing.spacingSmall}`,
                  border: `1px solid ${tokens.color.borderDefault}`,
                  borderRadius: tokens.radius.radiusPill,
                  backgroundColor: tokens.color.neutral0,
                  fontSize: tokens.typography.fontSizeMedium,
                  color: tokens.color.textDefault,
                }}
              >
                <Icon name="shield" size={12} color={tokens.color.brandPrimary} aria-hidden />
                {role.name}
                {!role.isEditable && (
                  <Badge label="System" variant="default" size="small" />
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Danger zone */}
      <section>
        <SectionHeader
          title="Danger Zone"
          style={{ borderBottomColor: tokens.color.error }}
        />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: tokens.spacing.spacingMedium,
            border: `1px solid ${tokens.color.errorLight}`,
            borderRadius: tokens.radius.radiusLarge,
            backgroundColor: tokens.color.errorLight,
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
              Remove from workspace
            </p>
            <p
              style={{
                color: tokens.color.textPlaceholder,
                fontSize: tokens.typography.fontSizeSmall,
                margin: `${tokens.spacing.spacingXXSmall} 0 0`,
              }}
            >
              This will revoke their access to this workspace immediately.
            </p>
          </div>
          <Button
            label="Remove member"
            variant="destructive"
            size="small"
            onClick={() => setRemoveOpen(true)}
          />
        </div>
      </section>

      <ConfirmDialog
        open={removeOpen}
        variant="destructive"
        title="Remove member"
        message={`Remove ${fullName} from this workspace? They will lose access immediately.`}
        confirmLabel="Remove"
        loading={removing}
        onConfirm={handleRemove}
        onCancel={() => setRemoveOpen(false)}
      />
    </SettingsLayout>
  );
};
