import React, { useEffect, useRef } from 'react';

// Extend Window interface for TypeScript
declare global {
  interface Window {
    UnicornStudio?: {
      isInitialized: boolean;
      init?: () => void;
    };
  }
}

/**
 * Unicorn Studio Orb Component
 * Embeds a Unicorn Studio WebGL scene
 */
interface UnicornStudioOrbProps {
  projectId: string;
  className?: string;
  style?: React.CSSProperties;
  width?: number;
  height?: number;
  lazyLoad?: boolean;
  production?: boolean;
}

const UnicornStudioOrb: React.FC<UnicornStudioOrbProps> = ({
  projectId,
  className = '',
  style = {},
  width = 1080,
  height = 1080,
  lazyLoad = false,
  production = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Set data attributes directly on the DOM element
    container.setAttribute('data-us-project', projectId);
    if (lazyLoad) {
      container.setAttribute('data-us-lazyload', 'true');
    } else {
      container.removeAttribute('data-us-lazyload');
    }
    if (production) {
      container.setAttribute('data-us-production', 'true');
    } else {
      container.removeAttribute('data-us-production');
    }

    // Function to initialize Unicorn Studio
    const initUnicornStudio = () => {
      // Wait a bit to ensure DOM is ready and div is rendered
      setTimeout(() => {
        if (window.UnicornStudio && window.UnicornStudio.init) {
          try {
            // Re-initialize to pick up new divs
            if (!window.UnicornStudio.isInitialized) {
              window.UnicornStudio.init();
              window.UnicornStudio.isInitialized = true;
            } else {
              // Force re-initialization to detect new elements
              // Some SDKs need this to scan for new data-us-project elements
              if (typeof (window as any).UnicornStudio?.scan === 'function') {
                (window as any).UnicornStudio.scan();
              } else {
                // Try calling init again - some SDKs handle re-initialization
                window.UnicornStudio.init();
              }
            }
          } catch (error) {
            console.error('Error initializing Unicorn Studio:', error);
          }
        }
      }, 200);
    };

    // Check if SDK is already available
    if (window.UnicornStudio && window.UnicornStudio.init) {
      initUnicornStudio();
    } else {
      // Wait for SDK to load (script is in index.html)
      const checkSDK = setInterval(() => {
        if (window.UnicornStudio && window.UnicornStudio.init) {
          initUnicornStudio();
          clearInterval(checkSDK);
        }
      }, 100);

      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkSDK);
        if (!window.UnicornStudio) {
          console.warn('Unicorn Studio SDK failed to load after 10 seconds');
        }
      }, 10000);

      return () => {
        clearInterval(checkSDK);
      };
    }
  }, [projectId, lazyLoad, production]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ 
        width: `${width}px`, 
        height: `${height}px`, 
        minWidth: `${width}px`,
        minHeight: `${height}px`,
        ...style 
      }}
    />
  );
};

export default UnicornStudioOrb;
