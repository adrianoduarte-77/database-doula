import React, { useEffect } from 'react';
import { useSecurityProtection } from '@/hooks/useSecurityProtection';

interface SecurityProviderProps {
  children: React.ReactNode;
}

/**
 * Security Provider that wraps the entire application
 * Provides global security protections including:
 * - XSS prevention
 * - Content Security Policy enforcement
 * - Anti-scraping measures
 * - Asset protection
 */
export const SecurityProvider: React.FC<SecurityProviderProps> = ({ children }) => {
  // Enable global security protections
  useSecurityProtection();

  useEffect(() => {
    // Add security-related meta tags dynamically
    const addSecurityMeta = () => {
      // Referrer policy
      let referrerMeta = document.querySelector('meta[name="referrer"]');
      if (!referrerMeta) {
        referrerMeta = document.createElement('meta');
        referrerMeta.setAttribute('name', 'referrer');
        referrerMeta.setAttribute('content', 'strict-origin-when-cross-origin');
        document.head.appendChild(referrerMeta);
      }

      // X-Content-Type-Options equivalent hint
      let contentTypeMeta = document.querySelector('meta[http-equiv="X-Content-Type-Options"]');
      if (!contentTypeMeta) {
        contentTypeMeta = document.createElement('meta');
        contentTypeMeta.setAttribute('http-equiv', 'X-Content-Type-Options');
        contentTypeMeta.setAttribute('content', 'nosniff');
        document.head.appendChild(contentTypeMeta);
      }
    };

    addSecurityMeta();

    // Detect and warn about potential devtools opening (informational only)
    let devtoolsOpen = false;
    const threshold = 160;
    
    const checkDevTools = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      
      if (widthThreshold || heightThreshold) {
        if (!devtoolsOpen) {
          devtoolsOpen = true;
          console.log('%c⚠️ Ambiente de Desenvolvimento Detectado', 
            'color: #ff6b6b; font-size: 20px; font-weight: bold;');
          console.log('%cEsta plataforma é protegida. Tentativas de extração de dados são monitoradas.', 
            'color: #ffa500; font-size: 14px;');
        }
      } else {
        devtoolsOpen = false;
      }
    };

    // Check periodically (every 1 second)
    const interval = setInterval(checkDevTools, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return <>{children}</>;
};

export default SecurityProvider;
