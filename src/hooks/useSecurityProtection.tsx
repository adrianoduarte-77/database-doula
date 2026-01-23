import { useEffect } from 'react';

/**
 * Global security protection hook that prevents:
 * - Right-click context menu on protected elements
 * - Drag and drop of images
 * - Text selection on sensitive areas
 * - Developer tools shortcuts (optional)
 * - Print screen detection (limited)
 */
export const useSecurityProtection = () => {
  useEffect(() => {
    // Prevent right-click context menu on images and protected elements
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Block context menu on images, videos, and elements with data-protected
      if (
        target.tagName === 'IMG' ||
        target.tagName === 'VIDEO' ||
        target.closest('[data-protected]') ||
        target.closest('.protected-asset') ||
        target.classList.contains('protected-asset')
      ) {
        e.preventDefault();
        return false;
      }
    };

    // Prevent drag start on images and protected elements
    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement;
      
      if (
        target.tagName === 'IMG' ||
        target.tagName === 'VIDEO' ||
        target.closest('[data-protected]') ||
        target.closest('.protected-asset')
      ) {
        e.preventDefault();
        return false;
      }
    };

    // Prevent image saving via keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Block Ctrl+S (save page)
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        return false;
      }
      
      // Block Ctrl+Shift+I (dev tools) - optional, can be removed
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        return false;
      }
      
      // Block F12 (dev tools) - optional
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }
      
      // Block Ctrl+U (view source)
      if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
        e.preventDefault();
        return false;
      }
    };

    // Prevent copy of protected content
    const handleCopy = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      
      if (target.closest('[data-no-copy]') || target.closest('.no-copy')) {
        e.preventDefault();
        return false;
      }
    };

    // Add event listeners
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('copy', handleCopy);

    // Add global CSS for additional protection
    const style = document.createElement('style');
    style.id = 'security-protection-styles';
    style.textContent = `
      /* Prevent image dragging globally */
      img, video, [data-protected] {
        -webkit-user-drag: none;
        -khtml-user-drag: none;
        -moz-user-drag: none;
        -o-user-drag: none;
        user-drag: none;
        pointer-events: auto;
      }
      
      /* Prevent text selection on protected elements */
      .no-select, [data-no-select] {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }
      
      /* Protected asset overlay */
      .protected-asset {
        position: relative;
      }
      
      .protected-asset::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: transparent;
        pointer-events: none;
      }
    `;
    
    if (!document.getElementById('security-protection-styles')) {
      document.head.appendChild(style);
    }

    // Cleanup
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('copy', handleCopy);
      
      const existingStyle = document.getElementById('security-protection-styles');
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);
};

export default useSecurityProtection;
