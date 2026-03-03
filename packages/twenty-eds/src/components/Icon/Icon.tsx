import React from 'react';

export type IconName =
  | 'search'
  | 'sort-ascending'
  | 'sort-descending'
  | 'chevron-left'
  | 'chevron-right'
  | 'chevron-down'
  | 'check'
  | 'minus'
  | 'close'
  | 'filter'
  | 'refresh'
  | 'chevron-first'
  | 'chevron-last';

export type IconProps = {
  name: IconName;
  size?: number;
  color?: string;
  'aria-hidden'?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

// SVG paths for each icon — 16×16 viewBox
const iconPaths: Record<IconName, string> = {
  search:
    'M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85zm-5.242.156a5 5 0 1 1 0-10 5 5 0 0 1 0 10z',
  'sort-ascending':
    'M8 3.5l4 5H4l4-5zM4 12.5h8',
  'sort-descending':
    'M8 12.5l4-5H4l4 5zM4 3.5h8',
  'chevron-left':
    'M10.354 3.146a.5.5 0 0 1 0 .708L6.207 8l4.147 4.146a.5.5 0 0 1-.708.708l-4.5-4.5a.5.5 0 0 1 0-.708l4.5-4.5a.5.5 0 0 1 .708 0z',
  'chevron-right':
    'M5.646 3.146a.5.5 0 0 0 0 .708L9.793 8l-4.147 4.146a.5.5 0 0 0 .708.708l4.5-4.5a.5.5 0 0 0 0-.708l-4.5-4.5a.5.5 0 0 0-.708 0z',
  'chevron-down':
    'M3.146 5.646a.5.5 0 0 1 .708 0L8 9.793l4.146-4.147a.5.5 0 0 1 .708.708l-4.5 4.5a.5.5 0 0 1-.708 0l-4.5-4.5a.5.5 0 0 1 0-.708z',
  check:
    'M13.854 3.646a.5.5 0 0 1 0 .708l-7.5 7.5a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6 10.793l7.146-7.147a.5.5 0 0 1 .708 0z',
  minus:
    'M2.5 8a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z',
  close:
    'M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z',
  filter:
    'M1.5 1.5h13l-5 6v5l-3 2v-7l-5-6z',
  refresh:
    'M14 8A6 6 0 1 1 8 2v1.5A4.5 4.5 0 1 0 12.5 8H14zm-6-6l3 3-3 3V2z',
  'chevron-first':
    'M3 3v10M6.646 3.146a.5.5 0 0 0 0 .708L10.793 8l-4.147 4.146a.5.5 0 0 0 .708.708l4.5-4.5a.5.5 0 0 0 0-.708l-4.5-4.5a.5.5 0 0 0-.708 0z',
  'chevron-last':
    'M13 3v10M9.354 3.146a.5.5 0 0 1 0 .708L5.207 8l4.147 4.146a.5.5 0 0 1-.708.708l-4.5-4.5a.5.5 0 0 1 0-.708l4.5-4.5a.5.5 0 0 1 .708 0z',
};

export const Icon = ({
  name,
  size = 16,
  color = 'currentColor',
  'aria-hidden': ariaHidden = true,
  className,
  style,
}: IconProps) => {
  const path = iconPaths[name];

  if (!path) {
    return null;
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      width={size}
      height={size}
      fill={color}
      aria-hidden={ariaHidden}
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
    >
      <path d={path} fillRule="evenodd" clipRule="evenodd" />
    </svg>
  );
};
