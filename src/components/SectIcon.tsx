import React from 'react';

interface SectIconProps {
  icon?: string;
  name?: string;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const sizeMap = {
  xs: { img: 'w-3.5 h-3.5', text: 'text-xs' },
  sm: { img: 'w-4 h-4', text: 'text-sm' },
  md: { img: 'w-5 h-5', text: 'text-base' },
  lg: { img: 'w-6 h-6', text: 'text-lg' },
  xl: { img: 'w-8 h-8', text: 'text-2xl' },
};

export const SectIcon: React.FC<SectIconProps> = ({
  icon = '⚔️',
  name = 'Lưu Phái',
  className = '',
  size = 'md',
}) => {
  const isImage =
    typeof icon === 'string' &&
    (icon.startsWith('/') ||
      icon.startsWith('http') ||
      icon.startsWith('data:') ||
      icon.includes('.webp') ||
      icon.includes('.png') ||
      icon.includes('.jpg') ||
      icon.includes('.svg'));

  const sizeInfo = sizeMap[size] || sizeMap.md;

  if (isImage) {
    return (
      <img
        src={icon}
        alt={name}
        className={`${sizeInfo.img} object-contain drop-shadow shrink-0 inline-block align-middle ${className}`}
        loading="lazy"
      />
    );
  }

  return (
    <span
      className={`inline-flex items-center justify-center leading-none shrink-0 ${sizeInfo.text} ${className}`}
    >
      {icon}
    </span>
  );
};
