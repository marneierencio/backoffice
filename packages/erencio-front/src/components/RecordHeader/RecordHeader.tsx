import type { AvatarType } from '@backoffice/components/Avatar';
import { Avatar } from '@backoffice/components/Avatar';
import { tokens } from '@backoffice/tokens';
import React from 'react';

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export type RecordHeaderProps = {
  objectIcon?: React.ReactNode;
  objectLabel: string;
  recordName: string;
  avatar?: {
    name: string;
    src?: string;
    type?: AvatarType;
  };
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  children?: React.ReactNode;
};

export const RecordHeader = ({
  objectLabel,
  recordName,
  avatar,
  breadcrumbs,
  actions,
  children,
}: RecordHeaderProps) => {
  const containerStyle: React.CSSProperties = {
    padding: tokens.spacing.spacingLarge,
    borderBottom: `1px solid ${tokens.color.borderDefault}`,
    backgroundColor: tokens.color.neutral0,
    fontFamily: tokens.typography.fontFamilyBase,
  };

  return (
    <div style={containerStyle}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" style={{ marginBottom: tokens.spacing.spacingSmall }}>
          <ol
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing.spacingXXSmall,
              listStyle: 'none',
              margin: 0,
              padding: 0,
              fontSize: tokens.typography.fontSizeSmall,
            }}
          >
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return (
                <li
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing.spacingXXSmall,
                  }}
                >
                  {index > 0 && (
                    <span
                      style={{ color: tokens.color.textPlaceholder }}
                      aria-hidden="true"
                    >
                      ›
                    </span>
                  )}
                  {isLast ? (
                    <span
                      style={{ color: tokens.color.textDefault }}
                      aria-current="page"
                    >
                      {crumb.label}
                    </span>
                  ) : crumb.href ? (
                    <a
                      href={crumb.href}
                      style={{
                        color: tokens.color.textLink,
                        textDecoration: 'none',
                      }}
                    >
                      {crumb.label}
                    </a>
                  ) : (
                    <span style={{ color: tokens.color.textPlaceholder }}>
                      {crumb.label}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      )}

      {/* Main header row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: tokens.spacing.spacingMedium,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing.spacingMedium,
          }}
        >
          {avatar && (
            <Avatar
              name={avatar.name}
              src={avatar.src}
              type={avatar.type ?? 'user'}
              size="large"
            />
          )}
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: tokens.typography.fontSizeXXLarge,
                fontWeight: tokens.typography.fontWeightBold,
                color: tokens.color.textDefault,
                lineHeight: tokens.typography.lineHeightHeading,
              }}
            >
              {recordName}
            </h1>
            <div
              style={{
                fontSize: tokens.typography.fontSizeSmall,
                color: tokens.color.textPlaceholder,
                marginTop: tokens.spacing.spacingXXSmall,
              }}
            >
              {objectLabel}
            </div>
            {children && (
              <div style={{ marginTop: tokens.spacing.spacingXSmall }}>
                {children}
              </div>
            )}
          </div>
        </div>

        {actions && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing.spacingXSmall,
              flexShrink: 0,
            }}
          >
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};
