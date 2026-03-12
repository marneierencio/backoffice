import { Avatar } from '@backoffice/components/Avatar';
import { Badge } from '@backoffice/components/Badge';
import { Button } from '@backoffice/components/Button';
import { ConfirmDialog } from '@backoffice/components/ConfirmDialog';
import { CopyInput } from '@backoffice/components/CopyInput';
import { EmptyState } from '@backoffice/components/EmptyState';
import { FormElement } from '@backoffice/components/FormElement';
import { Input } from '@backoffice/components/Input';
import { SectionHeader } from '@backoffice/components/SectionHeader';
import { SettingsLayout } from '@backoffice/components/SettingsLayout';
import { Spinner } from '@backoffice/components/Spinner';
import { useToast } from '@backoffice/hooks/useToast';
import { type WorkspaceMember, useWorkspaceMembers } from '@backoffice/hooks/useWorkspaceMembers';
import { tokens } from '@backoffice/tokens';
import { useState } from 'react';

export const SettingsMembersPage = () => {
  const {
    members,
    invitations,
    inviteLink,
    loading,
    error,
    sendInvitation,
    removeMember,
    generateInviteLink,
  } = useWorkspaceMembers();
  const { showToast } = useToast();

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [generatingLink, setGeneratingLink] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<WorkspaceMember | null>(null);
  const [removing, setRemoving] = useState(false);

  const handleInvite = async () => {
    const emails = inviteEmail
      .split(',')
      .map((e) => e.trim())
      .filter(Boolean);
    if (!emails.length) return;
    setInviting(true);
    try {
      await sendInvitation(emails);
      setInviteEmail('');
      showToast({ message: `Invitation${emails.length > 1 ? 's' : ''} sent!`, variant: 'success' });
    } catch (e) {
      showToast({ message: (e as Error).message, variant: 'error' });
    } finally {
      setInviting(false);
    }
  };

  const handleGenerateLink = async () => {
    setGeneratingLink(true);
    try {
      await generateInviteLink();
    } catch (e) {
      showToast({ message: (e as Error).message, variant: 'error' });
    } finally {
      setGeneratingLink(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;
    setRemoving(true);
    try {
      await removeMember(memberToRemove.userId);
      showToast({ message: 'Member removed.', variant: 'success' });
    } catch (e) {
      showToast({ message: (e as Error).message, variant: 'error' });
    } finally {
      setRemoving(false);
      setMemberToRemove(null);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

  if (loading) {
    return (
      <SettingsLayout title="Members">
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: tokens.spacing.spacingXLarge }}>
          <Spinner size="medium" />
        </div>
      </SettingsLayout>
    );
  }

  return (
    <SettingsLayout title="Members">
      {/* Invite by email */}
      <section style={{ marginBottom: tokens.spacing.spacingXLarge }}>
        <SectionHeader
          title="Invite members"
          description="Send invitations by email. Separate multiple addresses with commas."
        />
        <div style={{ display: 'flex', gap: tokens.spacing.spacingSmall, alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <FormElement id="invite-email" label="Email address(es)">
              <Input
                id="invite-email"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="name@example.com, other@example.com"
              />
            </FormElement>
          </div>
          <Button
            label="Send invite"
            variant="brand"
            size="small"
            loading={inviting}
            onClick={handleInvite}
            disabled={!inviteEmail.trim()}
          />
        </div>
      </section>

      {/* Invite link */}
      <section style={{ marginBottom: tokens.spacing.spacingXLarge }}>
        <SectionHeader
          title="Invite link"
          description="Share this link to let anyone join this workspace."
          rightAction={
            <Button
              label={inviteLink ? 'Regenerate' : 'Generate link'}
              variant="neutral"
              size="small"
              loading={generatingLink}
              onClick={handleGenerateLink}
            />
          }
        />
        {inviteLink && (
          <CopyInput value={inviteLink} label="Invite link" />
        )}
      </section>

      {/* Active members */}
      <section style={{ marginBottom: tokens.spacing.spacingXLarge }}>
        <SectionHeader
          title="Active members"
          description={`${members.length} member${members.length !== 1 ? 's' : ''} in this workspace.`}
        />
        {error && (
          <p style={{ color: tokens.color.error, fontSize: tokens.typography.fontSizeSmall }}>{error}</p>
        )}
        {!error && members.length === 0 && (
          <EmptyState
            title="No members yet"
            description="Invite people to collaborate in this workspace."
            icon="members"
          />
        )}
        {members.length > 0 && (
          <div
            role="table"
            aria-label="Workspace members"
            style={{
              border: `1px solid ${tokens.color.borderDefault}`,
              borderRadius: tokens.radius.radiusLarge,
              overflow: 'hidden',
              fontFamily: tokens.typography.fontFamilyBase,
            }}
          >
            {/* Header */}
            <div
              role="row"
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 2fr 1fr auto',
                padding: `${tokens.spacing.spacingXSmall} ${tokens.spacing.spacingMedium}`,
                backgroundColor: tokens.color.neutral1,
                borderBottom: `1px solid ${tokens.color.borderDefault}`,
                fontSize: tokens.typography.fontSizeSmall,
                fontWeight: tokens.typography.fontWeightMedium,
                color: tokens.color.textPlaceholder,
                gap: tokens.spacing.spacingMedium,
              }}
            >
              <span role="columnheader">Member</span>
              <span role="columnheader">Email</span>
              <span role="columnheader">Joined</span>
              <span role="columnheader" style={{ width: '80px' }} />
            </div>
            {/* Rows */}
            {members.map((member, idx) => (
              <div
                key={member.id}
                role="row"
                onClick={() => { window.location.hash = `#/settings/members/${member.id}`; }}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 2fr 1fr auto',
                  padding: `${tokens.spacing.spacingSmall} ${tokens.spacing.spacingMedium}`,
                  borderBottom: idx < members.length - 1 ? `1px solid ${tokens.color.borderDefault}` : undefined,
                  alignItems: 'center',
                  gap: tokens.spacing.spacingMedium,
                  cursor: 'pointer',
                  transition: 'background-color 0.1s ease',
                  backgroundColor: 'transparent',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = tokens.color.neutral1)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.spacingXSmall }}>
                  <Avatar
                    name={`${member.name.firstName} ${member.name.lastName}`}
                    src={member.avatarUrl ?? undefined}
                    size="small"
                    type="user"
                  />
                  <span style={{ fontSize: tokens.typography.fontSizeMedium, color: tokens.color.textDefault }}>
                    {member.name.firstName} {member.name.lastName}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: tokens.typography.fontSizeMedium,
                    color: tokens.color.textPlaceholder,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {member.userEmail}
                </span>
                <span style={{ fontSize: tokens.typography.fontSizeSmall, color: tokens.color.textPlaceholder }}>
                  {formatDate(member.createdAt)}
                </span>
                <Button
                  label="Remove"
                  variant="ghost"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMemberToRemove(member);
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Pending invitations */}
      {invitations.length > 0 && (
        <section>
          <SectionHeader
            title="Pending invitations"
            description="People who have been invited but haven't joined yet."
          />
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: tokens.spacing.spacingXSmall,
            }}
          >
            {invitations.map((inv) => (
              <div
                key={inv.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: `${tokens.spacing.spacingXSmall} ${tokens.spacing.spacingMedium}`,
                  border: `1px solid ${tokens.color.borderDefault}`,
                  borderRadius: tokens.radius.radiusMedium,
                  backgroundColor: tokens.color.neutral0,
                }}
              >
                <span style={{ fontSize: tokens.typography.fontSizeMedium }}>{inv.email}</span>
                <Badge label="Pending" variant="default" size="small" />
              </div>
            ))}
          </div>
        </section>
      )}

      <ConfirmDialog
        open={memberToRemove !== null}
        variant="destructive"
        title="Remove member"
        message={`Are you sure you want to remove ${memberToRemove ? `${memberToRemove.name.firstName} ${memberToRemove.name.lastName}` : 'this member'} from the workspace?`}
        confirmLabel="Remove"
        loading={removing}
        onConfirm={handleRemoveMember}
        onCancel={() => setMemberToRemove(null)}
      />
    </SettingsLayout>
  );
};
