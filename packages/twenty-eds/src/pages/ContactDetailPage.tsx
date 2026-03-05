import { Button } from '@eds/components/Button';
import { ConfirmDialog } from '@eds/components/ConfirmDialog';
import { Icon } from '@eds/components/Icon';
import type { PropertyItem } from '@eds/components/PropertyBox';
import { PropertyBox } from '@eds/components/PropertyBox';
import { RecordHeader } from '@eds/components/RecordHeader';
import { RelationCard } from '@eds/components/RelationCard';
import { Spinner } from '@eds/components/Spinner';
import { Tabs } from '@eds/components/Tabs';
import type { TimelineEvent } from '@eds/components/Timeline';
import { Timeline } from '@eds/components/Timeline';
import { useRecordDelete } from '@eds/hooks/useRecordDelete';
import { useRecordDetail } from '@eds/hooks/useRecordDetail';
import { useRecordUpdate } from '@eds/hooks/useRecordUpdate';
import { useToast } from '@eds/hooks/useToast';
import { tokens } from '@eds/tokens';
import { useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

type PersonRecord = {
  id: string;
  name: { firstName: string; lastName: string };
  emails: { primaryEmail: string };
  phones: { primaryPhoneNumber: string };
  company: { id: string; name: string; domainName: { primaryLinkUrl: string } } | null;
  city: string;
  jobTitle: string;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

const FIELDS = `
  id
  name { firstName lastName }
  emails { primaryEmail }
  phones { primaryPhoneNumber }
  company { id name domainName { primaryLinkUrl } }
  city
  jobTitle
  avatarUrl
  createdAt
  updatedAt
`;

const TABS = [
  { id: 'details', label: 'Details' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'notes', label: 'Notes' },
  { id: 'tasks', label: 'Tasks' },
];

export const ContactDetailPage = () => {
  const { recordId } = useParams<{ recordId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('details');
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { showSuccess, showError } = useToast();

  const { record, loading, error, refresh } = useRecordDetail<PersonRecord>({
    objectNameSingular: 'person',
    objectNamePlural: 'people',
    recordId: recordId ?? '',
    fields: FIELDS,
  });

  const { updateField } = useRecordUpdate({
    objectNameSingular: 'person',
    objectNamePlural: 'people',
  });

  const { deleteRecord, loading: deleting } = useRecordDelete({
    objectNameSingular: 'person',
    objectNamePlural: 'people',
  });

  const handleDelete = useCallback(async () => {
    if (!recordId) return;
    const result = await deleteRecord(recordId);
    if (result.success) {
      showSuccess('Contact deleted', 'The contact has been permanently removed.');
      navigate('/contacts');
    } else {
      showError('Failed to delete contact', result.error ?? 'An unknown error occurred.');
      setShowDeleteDialog(false);
    }
  }, [recordId, deleteRecord, showSuccess, showError, navigate]);

  // Maps field keys back to GraphQL mutation field paths
  const fieldPathMap: Record<string, string> = {
    firstName: 'name.firstName',
    lastName: 'name.lastName',
    email: 'emails.primaryEmail',
    phone: 'phones.primaryPhoneNumber',
    city: 'city',
    jobTitle: 'jobTitle',
  };

  const handleFieldSave = useCallback(
    async (fieldKey: string, value: string | number | boolean | null) => {
      if (!recordId) return;
      const fieldPath = fieldPathMap[fieldKey] ?? fieldKey;

      setSaving((prev) => ({ ...prev, [fieldKey]: true }));
      setErrors((prev) => {
        const next = { ...prev };
        delete next[fieldKey];
        return next;
      });

      const result = await updateField(recordId, fieldPath, value);
      setSaving((prev) => ({ ...prev, [fieldKey]: false }));

      if (result.success) {
        showSuccess('Field updated');
        refresh();
      } else {
        const errorMsg = result.error ?? 'Update failed';
        setErrors((prev) => ({ ...prev, [fieldKey]: errorMsg }));
        showError(errorMsg);
      }
    },
    [recordId, updateField, refresh, showSuccess, showError],
  );

  const fieldItems: PropertyItem[] = useMemo(() => {
    if (!record) return [];
    return [
      { key: 'firstName', label: 'First Name', value: record.name.firstName ?? '', fieldType: 'text' },
      { key: 'lastName', label: 'Last Name', value: record.name.lastName ?? '', fieldType: 'text' },
      { key: 'email', label: 'Email', value: record.emails?.primaryEmail ?? '', fieldType: 'email' },
      { key: 'phone', label: 'Phone', value: record.phones?.primaryPhoneNumber ?? '', fieldType: 'phone' },
      { key: 'city', label: 'City', value: record.city ?? '', fieldType: 'text' },
      { key: 'jobTitle', label: 'Job Title', value: record.jobTitle ?? '', fieldType: 'text' },
      { key: 'createdAt', label: 'Created', value: record.createdAt ?? '', fieldType: 'date', readOnly: true },
    ];
  }, [record]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: tokens.spacing.spacingXXLarge }}>
        <Spinner size="large" label="Loading contact…" />
      </div>
    );
  }

  if (error || !record) {
    return (
      <div
        style={{
          padding: tokens.spacing.spacingLarge,
          color: tokens.color.error,
          fontFamily: tokens.typography.fontFamilyBase,
        }}
        role="alert"
      >
        {error ?? 'Contact not found'}
      </div>
    );
  }

  const displayName = `${record.name.firstName ?? ''} ${record.name.lastName ?? ''}`.trim() || 'Unnamed';

  const timelineEvents: TimelineEvent[] = [
    {
      id: 'created',
      type: 'created',
      title: `${displayName} was created`,
      timestamp: record.createdAt,
    },
    ...(record.updatedAt !== record.createdAt
      ? [
          {
            id: 'updated',
            type: 'updated' as const,
            title: `${displayName} was updated`,
            timestamp: record.updatedAt,
          },
        ]
      : []),
  ];

  const companyRelation = record.company
    ? [
        {
          id: record.company.id,
          name: record.company.name,
          subtitle: record.company.domainName?.primaryLinkUrl,
          avatar: { name: record.company.name },
        },
      ]
    : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.spacingMedium }}>
      <RecordHeader
        avatar={{
          name: displayName,
          src: record.avatarUrl ?? undefined,
          type: 'user',
        }}
        recordName={displayName}
        objectLabel="Contact"
        breadcrumbs={[
          { label: 'Contacts', href: '#/contacts' },
          { label: displayName },
        ]}
        actions={
          <Button
            label="Delete"
            variant="destructive"
            size="small"
            iconLeft={<Icon name="trash" size={14} />}
            onClick={() => setShowDeleteDialog(true)}
          />
        }
      />

      <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

      <div style={{ padding: `0 ${tokens.spacing.spacingXSmall}` }}>
        {activeTab === 'details' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.spacingLarge }}>
            <PropertyBox
              fields={fieldItems}
              onFieldSave={handleFieldSave}
              saving={saving}
              errors={errors}
            />
            <RelationCard
              title="Company"
              relation="one"
              records={companyRelation}
              onRecordClick={(id) => {
                window.location.hash = `/companies/${id}`;
              }}
              emptyMessage="No company linked"
            />
          </div>
        )}

        {activeTab === 'timeline' && (
          <Timeline events={timelineEvents} />
        )}

        {activeTab === 'notes' && (
          <div
            style={{
              padding: tokens.spacing.spacingLarge,
              color: tokens.color.textPlaceholder,
              fontFamily: tokens.typography.fontFamilyBase,
              textAlign: 'center',
            }}
          >
            Notes will be available in Phase 3.
          </div>
        )}

        {activeTab === 'tasks' && (
          <div
            style={{
              padding: tokens.spacing.spacingLarge,
              color: tokens.color.textPlaceholder,
              fontFamily: tokens.typography.fontFamilyBase,
              textAlign: 'center',
            }}
          >
            Tasks will be available in Phase 3.
          </div>
        )}
      </div>

      <ConfirmDialog
        open={showDeleteDialog}
        title="Delete Contact"
        message={`Are you sure you want to delete "${displayName}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </div>
  );
};
