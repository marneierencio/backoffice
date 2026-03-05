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

type CompanyRecord = {
  id: string;
  name: string;
  domainName: { primaryLinkUrl: string };
  employees: number | null;
  address: { addressCity: string; addressState: string; addressCountry: string };
  createdAt: string;
  updatedAt: string;
  people: {
    edges: Array<{
      node: {
        id: string;
        name: { firstName: string; lastName: string };
        emails: { primaryEmail: string };
        avatarUrl: string | null;
      };
    }>;
  };
};

const FIELDS = `
  id
  name
  domainName { primaryLinkUrl }
  employees
  address { addressCity addressState addressCountry }
  createdAt
  updatedAt
  people {
    edges {
      node {
        id
        name { firstName lastName }
        emails { primaryEmail }
        avatarUrl
      }
    }
  }
`;

const TABS = [
  { id: 'details', label: 'Details' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'notes', label: 'Notes' },
  { id: 'tasks', label: 'Tasks' },
];

export const CompanyDetailPage = () => {
  const { recordId } = useParams<{ recordId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('details');
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { showSuccess, showError } = useToast();

  const { record, loading, error, refresh } = useRecordDetail<CompanyRecord>({
    objectNameSingular: 'company',
    objectNamePlural: 'companies',
    recordId: recordId ?? '',
    fields: FIELDS,
  });

  const { updateField } = useRecordUpdate({
    objectNameSingular: 'company',
    objectNamePlural: 'companies',
  });

  const { deleteRecord, loading: deleting } = useRecordDelete({
    objectNameSingular: 'company',
    objectNamePlural: 'companies',
  });

  const handleDelete = useCallback(async () => {
    if (!recordId) return;
    const result = await deleteRecord(recordId);
    if (result.success) {
      showSuccess('Company deleted', 'The company has been permanently removed.');
      navigate('/companies');
    } else {
      showError('Failed to delete company', result.error ?? 'An unknown error occurred.');
      setShowDeleteDialog(false);
    }
  }, [recordId, deleteRecord, showSuccess, showError, navigate]);

  const fieldPathMap: Record<string, string> = {
    name: 'name',
    domain: 'domainName.primaryLinkUrl',
    employees: 'employees',
    city: 'address.addressCity',
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
      { key: 'name', label: 'Name', value: record.name ?? '', fieldType: 'text' },
      { key: 'domain', label: 'Domain', value: record.domainName?.primaryLinkUrl ?? '', fieldType: 'url' },
      { key: 'employees', label: 'Employees', value: record.employees ?? null, fieldType: 'number' },
      { key: 'city', label: 'City', value: record.address?.addressCity ?? '', fieldType: 'text' },
      { key: 'createdAt', label: 'Created', value: record.createdAt ?? '', fieldType: 'date', readOnly: true },
    ];
  }, [record]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: tokens.spacing.spacingXXLarge }}>
        <Spinner size="large" label="Loading company…" />
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
        {error ?? 'Company not found'}
      </div>
    );
  }

  const displayName = record.name || 'Unnamed';

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

  const contactRecords = (record.people?.edges ?? []).map((edge) => {
    const fullName = `${edge.node.name.firstName ?? ''} ${edge.node.name.lastName ?? ''}`.trim() || 'Unnamed';
    return {
      id: edge.node.id,
      name: fullName,
      subtitle: edge.node.emails?.primaryEmail,
      avatar: { name: fullName, src: edge.node.avatarUrl ?? undefined },
    };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.spacingMedium }}>
      <RecordHeader
        avatar={{ name: displayName, type: 'entity' }}
        recordName={displayName}
        objectLabel="Company"
        breadcrumbs={[
          { label: 'Companies', href: '#/companies' },
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
              title="Contacts"
              relation="many"
              records={contactRecords}
              onRecordClick={(id) => {
                window.location.hash = `/contacts/${id}`;
              }}
              emptyMessage="No contacts linked"
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
        title="Delete Company"
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
