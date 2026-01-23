import React from 'react';
import { cn } from '@/lib/utils';

interface ProtectedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
}

/**
 * Protected image component that prevents:
 * - Right-click save
 * - Drag and drop
 * - Direct URL access (via overlay)
 */
export const ProtectedImage: React.FC<ProtectedImageProps> = ({
  src,
  alt,
  className,
  containerClassName,
  ...props
}) => {
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    return false;
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.preventDefault();
    return false;
  };

  return (
    <div 
      className={cn("relative inline-block protected-asset", containerClassName)}
      data-protected="true"
    >
      <img
        src={src}
        alt={alt}
        className={cn(
          "select-none pointer-events-none",
          className
        )}
        onContextMenu={handleContextMenu}
        onDragStart={handleDragStart}
        draggable={false}
        loading="lazy"
        {...props}
        style={{
          ...props.style,
          WebkitUserDrag: 'none',
          userSelect: 'none',
        } as React.CSSProperties}
      />
      {/* Invisible overlay to prevent direct image interaction */}
      <div 
        className="absolute inset-0 bg-transparent z-10"
        onContextMenu={handleContextMenu}
        onDragStart={handleDragStart}
        aria-hidden="true"
      />
    </div>
  );
};

export default ProtectedImage;
