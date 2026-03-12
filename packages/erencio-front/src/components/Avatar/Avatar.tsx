import { Icon } from '@backoffice/components/Icon';
import { tokens } from '@backoffice/tokens';
import React, { useState } from 'react';

export type AvatarType = 'user' | 'entity';

export type AvatarSize = 'x-small' | 'small' | 'medium' | 'large';

export type AvatarProps = {
  name: string;
  src?: string;
  type?: AvatarType;
  size?: AvatarSize;
  className?: string;
  style?: React.CSSProperties;
};

const sizeMap: Record<AvatarSize, number> = {
  'x-small': 20,
  small: 24,
  medium: 32,
  large: 48,
};

const fontSizeMap: Record<AvatarSize, string> = {
  'x-small': '9px',
  small: '10px',
  medium: tokens.typography.fontSizeSmall,
  large: tokens.typography.fontSizeBase,
};

// Extract initials from a name
// User: "John Doe" → "JD", "Alice" → "A"
// Entity: "Acme Corp" → "AC", "Google" → "Go"
const getInitials = (name: string, type: AvatarType): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return '';

  if (type === 'user') {
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  }

  // Entity: single word → first two letters (first upper, second lower)
  if (parts.length === 1) {
    const word = parts[0];
    if (word.length >= 2) {
      return word[0].toUpperCase() + word[1].toLowerCase();
    }
    return word[0].toUpperCase();
  }

  return (parts[0][0] + parts[1][0]).toUpperCase();
};

export const Avatar = ({
  name,
  src,
  type = 'user',
  size = 'medium',
  className,
  style,
}: AvatarProps) => {
  const [imgError, setImgError] = useState(false);
  const px = sizeMap[size];
  const borderRadius = type === 'user' ? '50%' : tokens.radius.radiusMedium;
  const showImage = src && !imgError;

  const containerStyle: React.CSSProperties = {
    width: px,
    height: px,
    borderRadius,
    overflow: 'hidden',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    backgroundColor: showImage ? tokens.color.neutral2 : tokens.color.brandPrimary,
    color: tokens.color.textInverse,
    fontFamily: tokens.typography.fontFamilyBase,
    fontSize: fontSizeMap[size],
    fontWeight: tokens.typography.fontWeightBold,
    lineHeight: tokens.typography.lineHeightReset,
    userSelect: 'none',
    ...style,
  };

  if (showImage) {
    return (
      <div style={containerStyle} className={className} aria-hidden="true">
        <img
          src={src}
          alt={name}
          onError={() => setImgError(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      </div>
    );
  }

  const initials = getInitials(name, type);

  if (!initials) {
    // Fallback icon
    const iconName = type === 'user' ? 'user' : 'company';
    const iconSize = Math.round(px * 0.6);

    return (
      <div style={containerStyle} className={className} aria-hidden="true">
        <Icon name={iconName} size={iconSize} color={tokens.color.textInverse} aria-hidden />
      </div>
    );
  }

  return (
    <div style={containerStyle} className={className} role="img" aria-label={name}>
      {initials}
    </div>
  );
};
