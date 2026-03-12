// ActivitiesPage — Tasks / Activities management
// SLDS 2 reference: https://www.lightningdesignsystem.com/components/activity-timeline/
// and https://www.lightningdesignsystem.com/components/path/
import { Badge } from '@backoffice/components/Badge';
import { Button } from '@backoffice/components/Button';
import { ConfirmDialog } from '@backoffice/components/ConfirmDialog';
import { EmptyState } from '@backoffice/components/EmptyState';
import { FormElement } from '@backoffice/components/FormElement';
import { Icon } from '@backoffice/components/Icon';
import { Input } from '@backoffice/components/Input';
import { Modal } from '@backoffice/components/Modal';
import { PageHeader } from '@backoffice/components/PageHeader';
import { Select } from '@backoffice/components/Select';
import { Spinner } from '@backoffice/components/Spinner';
import { Tabs } from '@backoffice/components/Tabs';
import { type Activity, type ActivityStatus, useActivities } from '@backoffice/hooks/useActivities';
import { useToast } from '@backoffice/hooks/useToast';
import { tokens } from '@backoffice/tokens';
import { useState } from 'react';

const STATUS_LABELS: Record<ActivityStatus, string> = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
};

const STATUS_BADGE_VARIANTS: Record<ActivityStatus, 'default' | 'info' | 'success' | 'warning' | 'error'> = {
  TODO: 'default',
  IN_PROGRESS: 'info',
  DONE: 'success',
};

const STATUS_TABS = [
  { id: 'all', label: 'All' },
  { id: 'TODO', label: 'To Do' },
  { id: 'IN_PROGRESS', label: 'In Progress' },
  { id: 'DONE', label: 'Done' },
];

const formatDueDate = (iso: string | null): string => {
  if (!iso) return '';
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(iso));
};

const isDue = (iso: string | null): boolean => {
  if (!iso) return false;
  return new Date(iso) < new Date();
};

type ActivityRowProps = {
  activity: Activity;
  onStatusChange: (id: string, status: ActivityStatus) => void;
  onDelete: (id: string) => void;
  onEdit: (activity: Activity) => void;
};

const ActivityRow = ({ activity, onStatusChange, onDelete, onEdit }: ActivityRowProps) => {
  const due = isDue(activity.dueAt) && activity.status !== 'DONE';

  return (
    <div
      role="row"
      style={{
        display: 'flex',
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
      {/* Completion checkbox area */}
      <button
        aria-label={activity.status === 'DONE' ? 'Mark as not done' : 'Mark as done'}
        title={activity.status === 'DONE' ? 'Mark as not done' : 'Mark as done'}
        onClick={() => onStatusChange(activity.id, activity.status === 'DONE' ? 'TODO' : 'DONE')}
        style={{
          width: 20,
          height: 20,
          borderRadius: '50%',
          border: `2px solid ${activity.status === 'DONE' ? tokens.color.success : tokens.color.borderInput}`,
          backgroundColor: activity.status === 'DONE' ? tokens.color.success : 'transparent',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          padding: 0,
          outline: 'none',
        }}
      >
        {activity.status === 'DONE' && (
          <Icon name="check" size={12} color={tokens.color.textInverse} />
        )}
      </button>

      {/* Title + meta */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <span
          style={{
            fontSize: tokens.typography.fontSizeMedium,
            fontWeight: tokens.typography.fontWeightMedium,
            color: activity.status === 'DONE' ? tokens.color.textPlaceholder : tokens.color.textDefault,
            textDecoration: activity.status === 'DONE' ? 'line-through' : 'none',
            display: 'block',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {activity.title}
        </span>
        {activity.dueAt && (
          <span
            style={{
              fontSize: tokens.typography.fontSizeSmall,
              color: due ? tokens.color.error : tokens.color.textPlaceholder,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              marginTop: 2,
            }}
          >
            {due && <Icon name="alert-circle" size={12} color={tokens.color.error} />}
            Due {formatDueDate(activity.dueAt)}
          </span>
        )}
      </div>

      {/* Status badge */}
      <Badge
        label={STATUS_LABELS[activity.status]}
        variant={STATUS_BADGE_VARIANTS[activity.status]}
      />

      {/* Assignee */}
      {activity.assignee && (
        <span
          title={`${activity.assignee.name.firstName} ${activity.assignee.name.lastName}`}
          style={{
            fontSize: tokens.typography.fontSizeSmall,
            color: tokens.color.textPlaceholder,
            whiteSpace: 'nowrap',
          }}
        >
          {activity.assignee.name.firstName[0]}{activity.assignee.name.lastName[0]}
        </span>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
        <button
          aria-label="Edit task"
          title="Edit"
          onClick={() => onEdit(activity)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 4,
            color: tokens.color.textPlaceholder,
            borderRadius: tokens.radius.radiusSmall,
          }}
        >
          <Icon name="edit-2" size={14} />
        </button>
        <button
          aria-label="Delete task"
          title="Delete"
          onClick={() => onDelete(activity.id)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 4,
            color: tokens.color.textPlaceholder,
            borderRadius: tokens.radius.radiusSmall,
          }}
        >
          <Icon name="trash-2" size={14} />
        </button>
      </div>
    </div>
  );
};

type TaskFormData = {
  title: string;
  body: string;
  status: ActivityStatus;
  dueAt: string;
};

const EMPTY_FORM: TaskFormData = { title: '', body: '', status: 'TODO', dueAt: '' };

const STATUS_OPTIONS = [
  { value: 'TODO', label: 'To Do' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'DONE', label: 'Done' },
];

export const ActivitiesPage = () => {
  const { activities, loading, error, createActivity, updateActivity, deleteActivity, refresh } = useActivities();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Activity | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState<TaskFormData>(EMPTY_FORM);

  const filteredActivities = activities.filter((a) => {
    if (activeTab === 'all') return true;
    return a.status === activeTab;
  });

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditTarget(null);
    setCreateOpen(true);
  };

  const openEdit = (activity: Activity) => {
    setForm({
      title: activity.title,
      body: activity.body ?? '',
      status: activity.status,
      dueAt: activity.dueAt ? activity.dueAt.slice(0, 10) : '',
    });
    setEditTarget(activity);
    setCreateOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      if (editTarget) {
        await updateActivity(editTarget.id, {
          title: form.title.trim(),
          body: form.body || undefined,
          status: form.status,
          dueAt: form.dueAt ? new Date(form.dueAt).toISOString() : undefined,
        });
        showToast({ message: 'Task updated.', variant: 'success' });
      } else {
        await createActivity({
          title: form.title.trim(),
          body: form.body || undefined,
          status: form.status,
          dueAt: form.dueAt ? new Date(form.dueAt).toISOString() : undefined,
        });
        showToast({ message: 'Task created.', variant: 'success' });
      }
      setCreateOpen(false);
      setEditTarget(null);
      refresh();
    } catch (e) {
      showToast({ message: (e as Error).message, variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (id: string, status: ActivityStatus) => {
    try {
      await updateActivity(id, { status });
      refresh();
    } catch (e) {
      showToast({ message: (e as Error).message, variant: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteActivity(deleteTarget);
      showToast({ message: 'Task deleted.', variant: 'success' });
      setDeleteTarget(null);
      refresh();
    } catch (e) {
      showToast({ message: (e as Error).message, variant: 'error' });
    } finally {
      setDeleting(false);
    }
  };

  const counts = {
    all: activities.length,
    TODO: activities.filter((a) => a.status === 'TODO').length,
    IN_PROGRESS: activities.filter((a) => a.status === 'IN_PROGRESS').length,
    DONE: activities.filter((a) => a.status === 'DONE').length,
  };

  return (
    <>
      <PageHeader
        title="Activities"
        description="Manage your tasks and action items"
        actions={
          <Button label="New Task" variant="brand" iconLeft="plus" onClick={openCreate} />
        }
      />

      <div
        style={{
          padding: `0 ${tokens.spacing.spacingLarge} ${tokens.spacing.spacingLarge}`,
          fontFamily: tokens.typography.fontFamilyBase,
        }}
      >
        {/* Status tabs with counts */}
        <Tabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tabs={STATUS_TABS.map((t) => ({
            ...t,
            label: `${t.label} (${counts[t.id as keyof typeof counts] ?? 0})`,
          }))}
          style={{ marginBottom: tokens.spacing.spacingMedium }}
        />

        {/* Content */}
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
        ) : filteredActivities.length === 0 ? (
          <EmptyState
            title="No tasks found"
            description={
              activeTab === 'all'
                ? "You're all caught up! Create a new task to get started."
                : `No tasks with status "${STATUS_LABELS[activeTab as ActivityStatus] ?? activeTab}".`
            }
            action={
              <Button label="Create Task" variant="brand" iconLeft="plus" onClick={openCreate} />
            }
          />
        ) : (
          <div
            role="table"
            aria-label="Activities list"
            style={{
              border: `1px solid ${tokens.color.borderDefault}`,
              borderRadius: tokens.radius.radiusMedium,
              overflow: 'hidden',
            }}
          >
            {/* Table header */}
            <div
              role="rowheader"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing.spacingSmall,
                padding: `${tokens.spacing.spacingXSmall} ${tokens.spacing.spacingMedium}`,
                backgroundColor: tokens.color.neutral1,
                borderBottom: `1px solid ${tokens.color.borderDefault}`,
              }}
            >
              <div style={{ width: 20, flexShrink: 0 }} />
              <span
                style={{
                  flex: 1,
                  fontSize: tokens.typography.fontSizeSmall,
                  fontWeight: tokens.typography.fontWeightMedium,
                  color: tokens.color.textLabel,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Task
              </span>
              <span
                style={{
                  width: 100,
                  fontSize: tokens.typography.fontSizeSmall,
                  fontWeight: tokens.typography.fontWeightMedium,
                  color: tokens.color.textLabel,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  textAlign: 'center',
                }}
              >
                Status
              </span>
              <div style={{ width: 60 }} />
            </div>

            {/* Rows */}
            {filteredActivities.map((activity) => (
              <ActivityRow
                key={activity.id}
                activity={activity}
                onStatusChange={handleStatusChange}
                onDelete={(id) => setDeleteTarget(id)}
                onEdit={openEdit}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit modal */}
      <Modal
        isOpen={createOpen}
        onClose={() => { setCreateOpen(false); setEditTarget(null); }}
        title={editTarget ? 'Edit Task' : 'New Task'}
        footer={
          <>
            <Button
              label="Cancel"
              variant="neutral"
              onClick={() => { setCreateOpen(false); setEditTarget(null); }}
              disabled={saving}
            />
            <Button
              label={editTarget ? 'Save Changes' : 'Create Task'}
              variant="brand"
              onClick={handleSave}
              loading={saving}
              disabled={!form.title.trim()}
            />
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.spacingMedium }}>
          <FormElement label="Title" required>
            <Input
              id="task-title"
              value={form.title}
              placeholder="Enter task title"
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
            />
          </FormElement>

          <FormElement label="Status">
            <Select
              id="task-status"
              value={form.status}
              options={STATUS_OPTIONS}
              onChange={(v) => setForm((f) => ({ ...f, status: v as ActivityStatus }))}
            />
          </FormElement>

          <FormElement label="Due Date">
            <Input
              id="task-due"
              type="date"
              value={form.dueAt}
              onChange={(e) => setForm((f) => ({ ...f, dueAt: e.target.value }))}
            />
          </FormElement>

          <FormElement label="Notes">
            <textarea
              id="task-body"
              value={form.body}
              placeholder="Optional notes…"
              rows={3}
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: `${tokens.spacing.spacingXSmall} ${tokens.spacing.spacingSmall}`,
                border: `1px solid ${tokens.color.borderInput}`,
                borderRadius: tokens.radius.radiusMedium,
                fontSize: tokens.typography.fontSizeMedium,
                fontFamily: tokens.typography.fontFamilyBase,
                color: tokens.color.textDefault,
                resize: 'vertical',
                outline: 'none',
                lineHeight: '1.5',
              }}
            />
          </FormElement>
        </div>
      </Modal>

      {/* Delete confirm dialog */}
      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
};
