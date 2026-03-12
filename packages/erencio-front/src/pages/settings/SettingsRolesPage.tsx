import { Badge } from '@backoffice/components/Badge';
import { EmptyState } from '@backoffice/components/EmptyState';
import { Icon } from '@backoffice/components/Icon';
import { SectionHeader } from '@backoffice/components/SectionHeader';
import { SettingsLayout } from '@backoffice/components/SettingsLayout';
import { Spinner } from '@backoffice/components/Spinner';
import { useRoles } from '@backoffice/hooks/useRoles';
import { tokens } from '@backoffice/tokens';

export const SettingsRolesPage = () => {
  const { roles, loading, error } = useRoles();

  const customRoles = roles.filter((r) => r.isEditable);
  const systemRoles = roles.filter((r) => !r.isEditable);

  if (loading) {
    return (
      <SettingsLayout title="Roles">
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: tokens.spacing.spacingXLarge }}>
          <Spinner size="medium" />
        </div>
      </SettingsLayout>
    );
  }

  if (error) {
    return (
      <SettingsLayout title="Roles">
        <p style={{ color: tokens.color.error }}>{error}</p>
      </SettingsLayout>
    );
  }

  const RolesTable = ({ items, label }: { items: typeof roles; label: string }) => (
    <div
      role="table"
      aria-label={label}
      style={{
        border: `1px solid ${tokens.color.borderDefault}`,
        borderRadius: tokens.radius.radiusLarge,
        overflow: 'hidden',
        fontFamily: tokens.typography.fontFamilyBase,
        marginBottom: tokens.spacing.spacingLarge,
      }}
    >
      <div
        role="row"
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 3fr 80px',
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
        <span role="columnheader">Description</span>
        <span role="columnheader">Members</span>
      </div>
      {items.map((role, idx) => (
        <div
          key={role.id}
          role="row"
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 3fr 80px',
            padding: `${tokens.spacing.spacingSmall} ${tokens.spacing.spacingMedium}`,
            borderBottom: idx < items.length - 1 ? `1px solid ${tokens.color.borderDefault}` : undefined,
            alignItems: 'center',
            gap: tokens.spacing.spacingMedium,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.spacingXSmall }}>
            <Icon name="shield" size={14} color={tokens.color.brandPrimary} aria-hidden />
            <span
              style={{
                fontWeight: tokens.typography.fontWeightMedium,
                fontSize: tokens.typography.fontSizeMedium,
                color: tokens.color.textDefault,
              }}
            >
              {role.name}
            </span>
            {!role.isEditable && <Badge label="System" variant="default" size="small" />}
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
            {role.description ?? '—'}
          </span>
          <span
            style={{
              fontSize: tokens.typography.fontSizeMedium,
              color: tokens.color.textDefault,
              textAlign: 'center',
            }}
          >
            {role.memberCount}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <SettingsLayout title="Roles">
      {/* System roles */}
      {systemRoles.length > 0 && (
        <section style={{ marginBottom: tokens.spacing.spacingXLarge }}>
          <SectionHeader
            title="System roles"
            description="Built-in roles provided by Twenty. Cannot be edited or deleted."
          />
          <RolesTable items={systemRoles} label="System roles" />
        </section>
      )}

      {/* Custom roles */}
      <section>
        <SectionHeader
          title="Custom roles"
          description="Roles created by your team for your workspace."
        />
        {customRoles.length === 0 ? (
          <EmptyState
            title="No custom roles"
            description="Custom roles let you define fine-grained permissions for your workspace members."
            icon="shield"
          />
        ) : (
          <RolesTable items={customRoles} label="Custom roles" />
        )}
      </section>
    </SettingsLayout>
  );
};
