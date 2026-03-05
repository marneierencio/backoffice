import type { PropertyItem } from '@eds/components/PropertyBox';
import { PropertyBox } from '@eds/components/PropertyBox';
import { RecordHeader } from '@eds/components/RecordHeader';
import { RelationCard } from '@eds/components/RelationCard';
import { Spinner } from '@eds/components/Spinner';
import { Tabs } from '@eds/components/Tabs';
import type { TimelineEvent } from '@eds/components/Timeline';
import { Timeline } from '@eds/components/Timeline';
import { useRecordDetail } from '@eds/hooks/useRecordDetail';
import { useRecordUpdate } from '@eds/hooks/useRecordUpdate';
import { useToast } from '@eds/hooks/useToast';
import { tokens } from '@eds/tokens';
import { useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

type OpportunityRecord = {
  id: string;
  name: string;
  amount: {
    amountMicros: number;
    currency: { code: string; symbol: string };
  } | null;
  stage: string;
  closeDate: string | null;
  createdAt: string;
  updatedAt: string;
  company: { id: string; name: string } | null;
};

const FIELDS = `
  id
  name
  amount { amountMicros currency { code symbol } }
  stage
  closeDate
  createdAt
  updatedAt
  company { id name }
`;

const TABS = [
  { id: 'details', label: 'Details' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'notes', label: 'Notes' },
  { id: 'tasks', label: 'Tasks' },
];

// Stage options for the select dropdown
const STAGE_OPTIONS = [
  { value: 'QUALIFYING', label: 'Qualifying' },
  { value: 'MEETING', label: 'Meeting' },
  { value: 'PROPOSAL', label: 'Proposal' },
  { value: 'NEGOTIATION', label: 'Negotiation' },
  { value: 'CLOSED_WON', label: 'Closed Won' },
  { value: 'CLOSED_LOST', label: 'Closed Lost' },
];

export const DealDetailPage = () => {
  const { recordId } = useParams<{ recordId: string }>();
  const [activeTab, setActiveTab] = useState('details');
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { showSuccess, showError } = useToast();

  const { record, loading, error, refresh } = useRecordDetail<OpportunityRecord>({
    objectNameSingular: 'opportunity',
    objectNamePlural: 'opportunities',
    recordId: recordId ?? '',
    fields: FIELDS,
  });

  const { updateField } = useRecordUpdate({
    objectNameSingular: 'opportunity',
    objectNamePlural: 'opportunities',
  });

  const fieldPathMap: Record<string, string> = {
    name: 'name',
    amount: 'amount.amountMicros',
    stage: 'stage',
    closeDate: 'closeDate',
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
      { key: 'amount', label: 'Amount', value: record.amount?.amountMicros ?? null, fieldType: 'currency', currencyCode: record.amount?.currency?.code ?? 'USD' },
      {
        key: 'stage',
        label: 'Stage',
        value: record.stage ?? '',
        fieldType: 'select',
        options: STAGE_OPTIONS,
      },
      { key: 'closeDate', label: 'Close Date', value: record.closeDate ?? '', fieldType: 'date' },
      { key: 'createdAt', label: 'Created', value: record.createdAt ?? '', fieldType: 'date', readOnly: true },
    ];
  }, [record]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: tokens.spacing.spacingXXLarge }}>
        <Spinner size="large" label="Loading deal…" />
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
        {error ?? 'Deal not found'}
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

  const companyRelation = record.company
    ? [
        {
          id: record.company.id,
          name: record.company.name,
          avatar: { name: record.company.name },
        },
      ]
    : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.spacingMedium }}>
      <RecordHeader
        avatar={{ name: displayName, type: 'entity' }}
        recordName={displayName}
        objectLabel="Deal"
        breadcrumbs={[
          { label: 'Deals', href: '#/deals' },
          { label: displayName },
        ]}
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
    </div>
  );
};
