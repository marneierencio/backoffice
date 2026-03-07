// Settings > Developers — Webhooks and API management
// SLDS 2 reference: https://www.lightningdesignsystem.com/components/data-tables/
// Mirrors Twenty's SettingsDevelopers / Webhooks page
import { Badge } from '@eds/components/Badge';
import { Button } from '@eds/components/Button';
import { Checkbox } from '@eds/components/Checkbox';
import { ConfirmDialog } from '@eds/components/ConfirmDialog';
import { EmptyState } from '@eds/components/EmptyState';
import { FormElement } from '@eds/components/FormElement';
import { Icon } from '@eds/components/Icon';
import { Input } from '@eds/components/Input';
import { Modal } from '@eds/components/Modal';
import { SectionHeader } from '@eds/components/SectionHeader';
import { SettingsLayout } from '@eds/components/SettingsLayout';
import { Spinner } from '@eds/components/Spinner';
import { useToast } from '@eds/hooks/useToast';
import { type Webhook, type WebhookOperation, useWebhooks } from '@eds/hooks/useWebhooks';
import { tokens } from '@eds/tokens';
import { useState } from 'react';

const ALL_OPERATIONS: Array<{ value: WebhookOperation; label: string; description: string }> = [
  { value: '*', label: 'All events', description: 'Receive every event' },
  { value: 'create', label: 'Record created', description: 'Triggered when a record is created' },
  { value: 'update', label: 'Record updated', description: 'Triggered when a record is updated' },
  { value: 'delete', label: 'Record deleted', description: 'Triggered when a record is deleted' },
];

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(iso));

type WebhookRowProps = {
  webhook: Webhook;
  onDelete: (id: string, url: string) => void;
};

const WebhookRow = ({ webhook, onDelete }: WebhookRowProps) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: '1fr 160px 120px 80px',
      alignItems: 'center',
      gap: tokens.spacing.spacingSmall,
      padding: `${tokens.spacing.spacingSmall} ${tokens.spacing.spacingMedium}`,
      borderBottom: `1px solid ${tokens.color.borderDefault}`,
      backgroundColor: tokens.color.neutral0,
      transition: 'background-color 0.1s',
    }}
    onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.backgroundColor = tokens.color.neutral1; }}
    onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.backgroundColor = tokens.color.neutral0; }}
  >
    <div style={{ minWidth: 0 }}>
      <div
        style={{
          fontSize: tokens.typography.fontSizeMedium,
          color: tokens.color.textDefault,
          fontFamily: 'monospace',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
        title={webhook.targetUrl}
      >
        {webhook.targetUrl}
      </div>
      {webhook.description && (
        <div style={{ fontSize: tokens.typography.fontSizeSmall, color: tokens.color.textPlaceholder, marginTop: 2 }}>
          {webhook.description}
        </div>
      )}
    </div>

    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
      {webhook.operations.includes('*') ? (
        <Badge label="All events" variant="info" />
      ) : (
        webhook.operations.map((op) => (
          <Badge key={op} label={op} variant="default" />
        ))
      )}
    </div>

    <div style={{ fontSize: tokens.typography.fontSizeSmall, color: tokens.color.textPlaceholder }}>
      {formatDate(webhook.createdAt)}
    </div>

    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <button
        aria-label={`Delete webhook ${webhook.targetUrl}`}
        title="Delete"
        onClick={() => onDelete(webhook.id, webhook.targetUrl)}
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
  </div>
);

type NewWebhookForm = {
  targetUrl: string;
  description: string;
  operations: Set<WebhookOperation>;
};

export const SettingsDevelopersPage = () => {
  const { webhooks, loading, error, createWebhook, deleteWebhook, refresh } = useWebhooks();
  const { showToast } = useToast();

  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; url: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState<NewWebhookForm>({
    targetUrl: '',
    description: '',
    operations: new Set(['*']),
  });

  const formValid = form.targetUrl.trim().startsWith('http') && form.operations.size > 0;

  const toggleOperation = (op: WebhookOperation) => {
    setForm((prev) => {
      const next = new Set(prev.operations);
      if (op === '*') {
        // Toggle "all" — clear specifics
        if (next.has('*')) {
          next.delete('*');
        } else {
          next.clear();
          next.add('*');
        }
      } else {
        // Toggle specific op — remove "all" if it was selected
        next.delete('*');
        if (next.has(op)) next.delete(op);
        else next.add(op);
      }
      return { ...prev, operations: next };
    });
  };

  const handleCreate = async () => {
    if (!formValid) return;
    setSaving(true);
    try {
      await createWebhook({
        targetUrl: form.targetUrl.trim(),
        operations: Array.from(form.operations),
        description: form.description.trim() || undefined,
      });
      showToast({ message: 'Webhook created.', variant: 'success' });
      setCreateOpen(false);
      setForm({ targetUrl: '', description: '', operations: new Set(['*']) });
      refresh();
    } catch (e) {
      showToast({ message: (e as Error).message, variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteWebhook(deleteTarget.id);
      showToast({ message: 'Webhook deleted.', variant: 'success' });
      setDeleteTarget(null);
      refresh();
    } catch (e) {
      showToast({ message: (e as Error).message, variant: 'error' });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <SettingsLayout>
      <SectionHeader
        title="Webhooks"
        description="Receive real-time event notifications in your own systems when records change in Erencio."
        rightAction={
          <Button
            label="Add Webhook"
            variant="brand"
            iconLeft="plus"
            onClick={() => setCreateOpen(true)}
          />
        }
      />

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: tokens.spacing.spacingXLarge }}>
          <Spinner size="large" />
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
          }}
        >
          {error}
        </div>
      ) : webhooks.length === 0 ? (
        <EmptyState
          title="No webhooks configured"
          description="Add a webhook endpoint to receive real-time notifications when records are created, updated, or deleted."
          action={
            <Button label="Add Webhook" variant="brand" iconLeft="plus" onClick={() => setCreateOpen(true)} />
          }
        />
      ) : (
        <div
          style={{
            border: `1px solid ${tokens.color.borderDefault}`,
            borderRadius: tokens.radius.radiusMedium,
            overflow: 'hidden',
          }}
        >
          {/* Table header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 160px 120px 80px',
              gap: tokens.spacing.spacingSmall,
              padding: `${tokens.spacing.spacingXSmall} ${tokens.spacing.spacingMedium}`,
              backgroundColor: tokens.color.neutral1,
              borderBottom: `1px solid ${tokens.color.borderDefault}`,
            }}
          >
            {['Endpoint URL', 'Events', 'Created', ''].map((col) => (
              <span
                key={col}
                style={{
                  fontSize: tokens.typography.fontSizeSmall,
                  fontWeight: tokens.typography.fontWeightMedium,
                  color: tokens.color.textLabel,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {col}
              </span>
            ))}
          </div>

          {webhooks.map((wh) => (
            <WebhookRow
              key={wh.id}
              webhook={wh}
              onDelete={(id, url) => setDeleteTarget({ id, url })}
            />
          ))}
        </div>
      )}

      {/* Information notice */}
      <div
        style={{
          marginTop: tokens.spacing.spacingLarge,
          padding: tokens.spacing.spacingMedium,
          backgroundColor: tokens.color.neutral1,
          borderRadius: tokens.radius.radiusMedium,
          fontSize: tokens.typography.fontSizeSmall,
          color: tokens.color.textLabel,
          lineHeight: '1.5',
        }}
      >
        <strong style={{ color: tokens.color.textDefault }}>Payload format:</strong> Each webhook delivers a JSON POST request to your endpoint with a{' '}
        <code
          style={{
            backgroundColor: tokens.color.neutral2,
            padding: '1px 4px',
            borderRadius: 3,
            fontFamily: 'monospace',
          }}
        >
          X-Twenty-Webhook-Signature
        </code>{' '}
        header for verification. Delivery retries occur automatically on failure (up to 3 attempts).
      </div>

      {/* Create webhook modal */}
      <Modal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Add Webhook"
        footer={
          <>
            <Button label="Cancel" variant="neutral" onClick={() => setCreateOpen(false)} disabled={saving} />
            <Button label="Add Webhook" variant="brand" onClick={handleCreate} loading={saving} disabled={!formValid} />
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.spacingMedium }}>
          <FormElement label="Endpoint URL" required hint="Must start with https://">
            <Input
              id="webhook-url"
              type="url"
              value={form.targetUrl}
              placeholder="https://your-server.com/webhook"
              onChange={(e) => setForm((f) => ({ ...f, targetUrl: e.target.value }))}
              required
            />
          </FormElement>

          <FormElement label="Description">
            <Input
              id="webhook-desc"
              value={form.description}
              placeholder="What is this webhook for?"
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </FormElement>

          <FormElement label="Events to receive" required>
            <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.spacingXSmall }}>
              {ALL_OPERATIONS.map((op) => (
                <div
                  key={op.value}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: tokens.spacing.spacingSmall,
                    padding: tokens.spacing.spacingXSmall,
                    border: `1px solid ${form.operations.has(op.value) ? tokens.color.brandPrimary : tokens.color.borderDefault}`,
                    borderRadius: tokens.radius.radiusMedium,
                    backgroundColor: form.operations.has(op.value) ? tokens.color.brandPrimaryLight : 'transparent',
                    cursor: 'pointer',
                  }}
                  onClick={() => toggleOperation(op.value)}
                >
                  <Checkbox
                    checked={form.operations.has(op.value)}
                    onChange={() => toggleOperation(op.value)}
                    aria-label={op.label}
                  />
                  <div>
                    <div style={{ fontSize: tokens.typography.fontSizeMedium, fontWeight: tokens.typography.fontWeightMedium, color: tokens.color.textDefault }}>
                      {op.label}
                    </div>
                    <div style={{ fontSize: tokens.typography.fontSizeSmall, color: tokens.color.textPlaceholder }}>
                      {op.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </FormElement>
        </div>
      </Modal>

      {/* Delete confirm dialog */}
      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title="Delete Webhook"
        message={`Are you sure you want to delete the webhook for "${deleteTarget?.url ?? ''}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </SettingsLayout>
  );
};
