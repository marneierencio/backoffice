import { Button } from '@backoffice/components/Button';
import { Icon } from '@backoffice/components/Icon';
import { Spinner } from '@backoffice/components/Spinner';
import { tokens } from '@backoffice/tokens';
import React, { useCallback, useRef, useState } from 'react';

export type FileSelectorProps = {
  label?: string;
  accept?: string;
  multiple?: boolean;
  maxSizeMB?: number;
  disabled?: boolean;
  files: File[];
  uploading?: boolean;
  error?: string;
  onChange: (files: File[]) => void;
  onRemove?: (index: number) => void;
  'aria-label'?: string;
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const FileSelector = ({
  label,
  accept,
  multiple = false,
  maxSizeMB = 10,
  disabled = false,
  files,
  uploading = false,
  error,
  onChange,
  onRemove,
  'aria-label': ariaLabel,
}: FileSelectorProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [dragError, setDragError] = useState(false);

  const validateFiles = useCallback(
    (fileList: FileList | File[]): { valid: File[]; errors: string[] } => {
      const maxBytes = maxSizeMB * 1024 * 1024;
      const valid: File[] = [];
      const errors: string[] = [];

      const items = Array.from(fileList);
      for (const file of items) {
        if (file.size > maxBytes) {
          errors.push(`${file.name} exceeds ${maxSizeMB}MB limit`);
          continue;
        }
        if (accept) {
          const acceptedTypes = accept.split(',').map((t) => t.trim());
          const isAccepted = acceptedTypes.some((type) => {
            if (type.startsWith('.')) {
              return file.name.toLowerCase().endsWith(type.toLowerCase());
            }
            if (type.endsWith('/*')) {
              return file.type.startsWith(type.replace('/*', '/'));
            }
            return file.type === type;
          });
          if (!isAccepted) {
            errors.push(`${file.name} is not an accepted file type`);
            continue;
          }
        }
        valid.push(file);
      }

      return { valid, errors };
    },
    [accept, maxSizeMB],
  );

  const handleFiles = useCallback(
    (fileList: FileList | File[]) => {
      const { valid } = validateFiles(fileList);
      if (valid.length > 0) {
        onChange(multiple ? [...files, ...valid] : valid.slice(0, 1));
      }
    },
    [files, multiple, onChange, validateFiles],
  );

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      setDragOver(false);
      setDragError(false);

      if (disabled) return;

      handleFiles(event.dataTransfer.files);
    },
    [disabled, handleFiles],
  );

  const handleDragOver = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      if (disabled) return;

      setDragOver(true);

      // Check if dragged items match accept
      if (accept && event.dataTransfer.items.length > 0) {
        const items = Array.from(event.dataTransfer.items);
        const allValid = items.every((item) => {
          if (item.kind !== 'file') return false;
          const acceptedTypes = accept.split(',').map((t) => t.trim());
          return acceptedTypes.some((type) => {
            if (type.endsWith('/*')) return item.type.startsWith(type.replace('/*', '/'));
            return item.type === type;
          });
        });
        setDragError(!allValid);
      }
    },
    [accept, disabled],
  );

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setDragOver(false);
    setDragError(false);
  }, []);

  const handleClick = useCallback(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.click();
    }
  }, [disabled]);

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files) {
        handleFiles(event.target.files);
      }
      // Reset input so same file can be re-selected
      event.target.value = '';
    },
    [handleFiles],
  );

  const dropZoneStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacing.spacingSmall,
    padding: tokens.spacing.spacingLarge,
    border: `2px dashed ${
      dragError
        ? tokens.color.borderError
        : dragOver
          ? tokens.color.brandPrimary
          : tokens.color.borderDefault
    }`,
    borderRadius: tokens.radius.radiusMedium,
    backgroundColor: dragOver && !dragError
      ? 'rgba(1, 118, 211, 0.05)'
      : 'transparent',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: `border-color ${tokens.duration.durationPromptly}, background-color ${tokens.duration.durationPromptly}`,
  };

  const pillStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: tokens.spacing.spacingXXSmall,
    padding: `${tokens.spacing.spacingXXSmall} ${tokens.spacing.spacingSmall}`,
    backgroundColor: tokens.color.neutral1,
    borderRadius: tokens.radius.radiusPill,
    fontSize: tokens.typography.fontSizeSmall,
    color: tokens.color.textDefault,
    fontFamily: tokens.typography.fontFamilyBase,
  };

  const removeButtonStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'none',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
    color: tokens.color.textPlaceholder,
    borderRadius: tokens.radius.radiusCircle,
    width: 16,
    height: 16,
  };

  return (
    <div style={{ fontFamily: tokens.typography.fontFamilyBase }}>
      {label && (
        <div
          style={{
            marginBottom: tokens.spacing.spacingXXSmall,
            fontSize: tokens.typography.fontSizeMedium,
            fontWeight: tokens.typography.fontWeightMedium,
            color: tokens.color.textLabel,
          }}
        >
          {label}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={handleInputChange}
        aria-label={ariaLabel ?? label ?? 'Upload file'}
        style={{ display: 'none' }}
      />

      {/* Drop zone */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={ariaLabel ?? label ?? 'Click or drag files to upload'}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        style={dropZoneStyle}
      >
        {uploading ? (
          <Spinner size="medium" label="Uploading..." />
        ) : (
          <>
            <Icon
              name="upload"
              size={24}
              color={dragOver ? tokens.color.brandPrimary : tokens.color.textPlaceholder}
            />
            <Button
              label={multiple ? 'Upload Files' : 'Upload File'}
              variant="outline"
              size="small"
              disabled={disabled}
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}
            />
            <span
              style={{
                fontSize: tokens.typography.fontSizeSmall,
                color: tokens.color.textPlaceholder,
              }}
            >
              Or drag {multiple ? 'files' : 'a file'} here
            </span>
          </>
        )}
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: tokens.spacing.spacingXSmall,
            marginTop: tokens.spacing.spacingSmall,
          }}
        >
          {files.map((file, index) => (
            <span key={`${file.name}-${index}`} style={pillStyle}>
              <Icon name="attachment" size={12} color={tokens.color.textPlaceholder} />
              <span>{file.name}</span>
              <span style={{ color: tokens.color.textPlaceholder }}>
                ({formatFileSize(file.size)})
              </span>
              {onRemove && (
                <button
                  type="button"
                  aria-label={`Remove ${file.name}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(index);
                  }}
                  style={removeButtonStyle}
                >
                  <Icon name="close" size={10} />
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          role="alert"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing.spacingXXSmall,
            marginTop: tokens.spacing.spacingXXSmall,
            fontSize: tokens.typography.fontSizeSmall,
            color: tokens.color.error,
          }}
        >
          <Icon name="error-icon" size={12} color={tokens.color.error} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
