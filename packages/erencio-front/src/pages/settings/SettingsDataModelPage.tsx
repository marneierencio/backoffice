import { Badge } from '@backoffice/components/Badge';
import { EmptyState } from '@backoffice/components/EmptyState';
import { Icon } from '@backoffice/components/Icon';
import { SectionHeader } from '@backoffice/components/SectionHeader';
import { SettingsLayout } from '@backoffice/components/SettingsLayout';
import { Spinner } from '@backoffice/components/Spinner';
import { useDataModel } from '@backoffice/hooks/useDataModel';
import { tokens } from '@backoffice/tokens';

export const SettingsDataModelPage = () => {
  const { objects, loading, error } = useDataModel();

  if (loading) {
    return (
      <SettingsLayout title="Data Model">
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: tokens.spacing.spacingXLarge }}>
          <Spinner size="medium" />
        </div>
      </SettingsLayout>
    );
  }

  if (error) {
    return (
      <SettingsLayout title="Data Model">
        <p style={{ color: tokens.color.error }}>{error}</p>
      </SettingsLayout>
    );
  }

  const standardObjects = objects.filter((o) => !o.isCustom);
  const customObjects = objects.filter((o) => o.isCustom);

  const ObjectsTable = ({ items, label }: { items: typeof objects; label: string }) => (
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
          gridTemplateColumns: '2fr 1fr 1fr 80px',
          padding: `${tokens.spacing.spacingXSmall} ${tokens.spacing.spacingMedium}`,
          backgroundColor: tokens.color.neutral1,
          borderBottom: `1px solid ${tokens.color.borderDefault}`,
          fontSize: tokens.typography.fontSizeSmall,
          fontWeight: tokens.typography.fontWeightMedium,
          color: tokens.color.textPlaceholder,
          gap: tokens.spacing.spacingMedium,
        }}
      >
        <span role="columnheader">Object</span>
        <span role="columnheader">Type</span>
        <span role="columnheader">Fields</span>
        <span role="columnheader">Status</span>
      </div>
      {items.map((obj, idx) => (
        <div
          key={obj.id}
          role="row"
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 80px',
            padding: `${tokens.spacing.spacingSmall} ${tokens.spacing.spacingMedium}`,
            borderBottom: idx < items.length - 1 ? `1px solid ${tokens.color.borderDefault}` : undefined,
            alignItems: 'center',
            gap: tokens.spacing.spacingMedium,
          }}
        >
          <div>
            <div
              style={{
                fontWeight: tokens.typography.fontWeightMedium,
                fontSize: tokens.typography.fontSizeMedium,
                color: tokens.color.textDefault,
              }}
            >
              {obj.labelSingular}
            </div>
            <div
              style={{
                fontSize: tokens.typography.fontSizeSmall,
                color: tokens.color.textPlaceholder,
                fontFamily: 'monospace',
              }}
            >
              {obj.nameSingular}
            </div>
          </div>
          <Badge
            label={obj.isCustom ? 'Custom' : 'Standard'}
            variant={obj.isCustom ? 'brand' : 'default'}
            size="small"
          />
          <span style={{ fontSize: tokens.typography.fontSizeMedium, color: tokens.color.textDefault }}>
            {obj.fieldsCount}
          </span>
          <Badge
            label={obj.isActive ? 'Active' : 'Inactive'}
            variant={obj.isActive ? 'success' : 'warning'}
            size="small"
          />
        </div>
      ))}
    </div>
  );

  return (
    <SettingsLayout title="Data Model">
      {/* Standard objects */}
      <section style={{ marginBottom: tokens.spacing.spacingXLarge }}>
        <SectionHeader
          title="Standard objects"
          description="Built-in objects included with every Twenty workspace."
        />
        {standardObjects.length === 0 ? (
          <EmptyState
            title="No standard objects"
            description="Standard objects will appear here."
            icon="database"
          />
        ) : (
          <ObjectsTable items={standardObjects} label="Standard objects table" />
        )}
      </section>

      {/* Custom objects */}
      <section>
        <SectionHeader
          title="Custom objects"
          description="Objects created specifically for your workspace."
        />
        {customObjects.length === 0 ? (
          <EmptyState
            title="No custom objects"
            description="Custom objects let you extend the data model for your team's needs."
            icon="database"
          />
        ) : (
          <ObjectsTable items={customObjects} label="Custom objects table" />
        )}
      </section>

      {/* Summary */}
      <div
        style={{
          display: 'flex',
          gap: tokens.spacing.spacingMedium,
          padding: tokens.spacing.spacingMedium,
          backgroundColor: tokens.color.neutral1,
          borderRadius: tokens.radius.radiusMedium,
          fontSize: tokens.typography.fontSizeSmall,
          color: tokens.color.textPlaceholder,
        }}
      >
        <Icon name="database" size={14} color={tokens.color.textPlaceholder} aria-hidden />
        <span>
          {objects.length} object{objects.length !== 1 ? 's' : ''} total &mdash; {standardObjects.length} standard, {customObjects.length} custom
        </span>
      </div>
    </SettingsLayout>
  );
};
