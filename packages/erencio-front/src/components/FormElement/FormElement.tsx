import { Icon } from '@backoffice/components/Icon';
import { tokens } from '@backoffice/tokens';
import React, { useId, useState } from 'react';

export type FormElementLayout = 'stacked' | 'horizontal';

export type FormElementProps = {
  id?: string;
  label: string;
  required?: boolean;
  helpText?: string;
  error?: string;
  layout?: FormElementLayout;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

export const FormElement = ({
  id,
  label,
  required = false,
  helpText,
  error,
  layout = 'stacked',
  children,
  className,
  style,
}: FormElementProps) => {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const errorId = error ? `${fieldId}-error` : undefined;
  const helpId = helpText ? `${fieldId}-help` : undefined;
  const [showHelp, setShowHelp] = useState(false);

  const isHorizontal = layout === 'horizontal';

  const containerStyle: React.CSSProperties = {
    display: isHorizontal ? 'flex' : 'block',
    alignItems: isHorizontal ? 'flex-start' : undefined,
    gap: isHorizontal ? tokens.spacing.spacingMedium : undefined,
    marginBottom: tokens.spacing.spacingMedium,
    fontFamily: tokens.typography.fontFamilyBase,
    ...style,
  };

  const labelContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.spacingXXSmall,
    marginBottom: isHorizontal ? '0' : tokens.spacing.spacingXXSmall,
    width: isHorizontal ? '33%' : undefined,
    flexShrink: isHorizontal ? 0 : undefined,
    paddingTop: isHorizontal ? tokens.spacing.spacingXSmall : undefined,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: tokens.typography.fontSizeMedium,
    fontWeight: tokens.typography.fontWeightMedium,
    color: tokens.color.textLabel,
    lineHeight: tokens.typography.lineHeightText,
  };

  const controlContainerStyle: React.CSSProperties = {
    flex: isHorizontal ? 1 : undefined,
  };

  const errorStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.spacingXXSmall,
    marginTop: tokens.spacing.spacingXXSmall,
    fontSize: tokens.typography.fontSizeSmall,
    color: tokens.color.error,
    lineHeight: tokens.typography.lineHeightText,
  };

  const helpTooltipStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    marginBottom: tokens.spacing.spacingXXSmall,
    padding: `${tokens.spacing.spacingXXSmall} ${tokens.spacing.spacingXSmall}`,
    backgroundColor: tokens.color.neutral9,
    color: tokens.color.textInverse,
    fontSize: tokens.typography.fontSizeSmall,
    borderRadius: tokens.radius.radiusMedium,
    whiteSpace: 'nowrap',
    zIndex: tokens.zIndex.zIndexDropdown,
    boxShadow: tokens.elevation.elevationDropdown,
    pointerEvents: 'none',
  };

  // Clone children to inject aria attributes
  const enhancedChildren = React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) return child;

    const ariaProps: Record<string, unknown> = {};
    if (errorId) {
      ariaProps['aria-describedby'] = errorId;
      ariaProps['aria-invalid'] = true;
    }
    if (helpId) {
      const existing = (child.props as Record<string, unknown>)['aria-describedby'];
      ariaProps['aria-describedby'] = existing
        ? `${existing} ${helpId}`
        : (errorId ? `${errorId} ${helpId}` : helpId);
    }
    if (required) {
      ariaProps['aria-required'] = true;
    }

    return React.cloneElement(child, ariaProps);
  });

  return (
    <div className={className} style={containerStyle}>
      {/* Label row */}
      <div style={labelContainerStyle}>
        {required && (
          <span
            aria-hidden="true"
            style={{ color: tokens.color.error, fontWeight: tokens.typography.fontWeightBold }}
          >
            *
          </span>
        )}
        <label htmlFor={fieldId} style={labelStyle}>
          {label}
        </label>
        {helpText && (
          <span
            style={{ position: 'relative', display: 'inline-flex' }}
            onMouseEnter={() => setShowHelp(true)}
            onMouseLeave={() => setShowHelp(false)}
            onFocus={() => setShowHelp(true)}
            onBlur={() => setShowHelp(false)}
          >
            <button
              type="button"
              aria-label={`Help for ${label}`}
              aria-describedby={helpId}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              <Icon name="info" size={14} color={tokens.color.textPlaceholder} />
            </button>
            {showHelp && (
              <div id={helpId} role="tooltip" style={helpTooltipStyle}>
                {helpText}
              </div>
            )}
          </span>
        )}
      </div>

      {/* Control */}
      <div style={controlContainerStyle}>
        {enhancedChildren}

        {/* Error message */}
        {error && (
          <div id={errorId} role="alert" aria-live="assertive" style={errorStyle}>
            <Icon name="error-icon" size={12} color={tokens.color.error} />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};
