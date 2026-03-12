import { Avatar } from '@backoffice/components/Avatar';
import { Card } from '@backoffice/components/Card';
import { Icon } from '@backoffice/components/Icon';
import { Spinner } from '@backoffice/components/Spinner';
import { tokens } from '@backoffice/tokens';
import React, { useState } from 'react';

export type RelationRecord = {
  id: string;
  name: string;
  avatar?: { name: string; src?: string };
  subtitle?: string;
};

export type RelationCardProps = {
  title: string;
  relation: 'one' | 'many';
  records: RelationRecord[];
  loading?: boolean;
  onRecordClick?: (id: string) => void;
  emptyMessage?: string;
  maxVisible?: number;
  showMoreLabel?: string;
  defaultExpanded?: boolean;
};

export const RelationCard = ({
  title,
  relation,
  records,
  loading = false,
  onRecordClick,
  emptyMessage = 'No related records',
  maxVisible = 5,
  showMoreLabel = 'Show all',
  defaultExpanded = true,
}: RelationCardProps) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [showAll, setShowAll] = useState(false);

  const visibleRecords =
    relation === 'many' && !showAll ? records.slice(0, maxVisible) : records;
  const hasMore = relation === 'many' && records.length > maxVisible && !showAll;

  const headerRight = (
    <button
      onClick={() => setExpanded((prev) => !prev)}
      aria-label={expanded ? `Collapse ${title}` : `Expand ${title}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 28,
        height: 28,
        border: 'none',
        borderRadius: tokens.radius.radiusMedium,
        backgroundColor: 'transparent',
        color: tokens.color.textPlaceholder,
        cursor: 'pointer',
      }}
    >
      <Icon name={expanded ? 'chevron-up' : 'chevron-down'} size={16} />
    </button>
  );

  const titleWithCount =
    relation === 'many' ? `${title} (${records.length})` : title;

  const recordItemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.spacingSmall,
    padding: `${tokens.spacing.spacingXSmall} ${tokens.spacing.spacingMedium}`,
    cursor: onRecordClick ? 'pointer' : 'default',
    borderRadius: tokens.radius.radiusMedium,
    transition: `background-color ${tokens.duration.durationQuickly}`,
  };

  return (
    <Card
      title={titleWithCount}
      headerRight={headerRight}
      variant="default"
      style={{ marginTop: tokens.spacing.spacingMedium }}
    >
      {expanded && (
        <div>
          {loading ? (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                padding: tokens.spacing.spacingMedium,
              }}
            >
              <Spinner size="small" label="Loading" inline />
            </div>
          ) : records.length === 0 ? (
            <div
              style={{
                padding: tokens.spacing.spacingMedium,
                textAlign: 'center',
                color: tokens.color.textPlaceholder,
                fontSize: tokens.typography.fontSizeMedium,
              }}
            >
              {emptyMessage}
            </div>
          ) : (
            <>
              {visibleRecords.map((record) => (
                <div
                  key={record.id}
                  style={recordItemStyle}
                  onClick={() => onRecordClick?.(record.id)}
                  onKeyDown={(e) => {
                    if (onRecordClick && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      onRecordClick(record.id);
                    }
                  }}
                  role={onRecordClick ? 'button' : undefined}
                  tabIndex={onRecordClick ? 0 : undefined}
                  onMouseEnter={(e) => {
                    if (onRecordClick) {
                      e.currentTarget.style.backgroundColor = tokens.color.neutral1;
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <Avatar
                    name={record.avatar?.name ?? record.name}
                    src={record.avatar?.src}
                    type={relation === 'one' ? 'entity' : 'user'}
                    size="small"
                  />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        fontSize: tokens.typography.fontSizeMedium,
                        fontWeight: tokens.typography.fontWeightMedium,
                        color: onRecordClick
                          ? tokens.color.textLink
                          : tokens.color.textDefault,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {record.name}
                    </div>
                    {record.subtitle && (
                      <div
                        style={{
                          fontSize: tokens.typography.fontSizeSmall,
                          color: tokens.color.textPlaceholder,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {record.subtitle}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {hasMore && (
                <button
                  onClick={() => setShowAll(true)}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: `${tokens.spacing.spacingXSmall} ${tokens.spacing.spacingMedium}`,
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: tokens.color.textLink,
                    fontSize: tokens.typography.fontSizeSmall,
                    fontFamily: tokens.typography.fontFamilyBase,
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                >
                  {showMoreLabel}
                </button>
              )}
            </>
          )}
        </div>
      )}
    </Card>
  );
};
