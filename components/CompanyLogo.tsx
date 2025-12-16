import React, { useState, useEffect, useRef } from 'react';

interface CompanyLogoProps {
  companyName: string;
  className?: string;
  style?: React.CSSProperties;
}

const CompanyLogo: React.FC<CompanyLogoProps> = ({ companyName, className = '', style }) => {
  const [processedSvg, setProcessedSvg] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const originalSvgRef = useRef<string>('');

  // Map company names to SVG file paths
  const getSvgPath = (company: string): string => {
    const logoMap: { [key: string]: string } = {
      'Jio': '/experience/jio.svg',
      'Compass': '/experience/COMP 1.svg',
      'Hiver': '/experience/hiver.svg',
      'iB Hubs': '/experience/ib.svg'
    };
    return logoMap[company] || '';
  };

  // Process SVG content to replace hardcoded colors with CSS variables
  const processSvg = (svgContent: string): string => {
    if (!svgContent) return '';

    let processed = svgContent;

    // Replace fill="black" with fill="rgb(var(--color-ink))"
    processed = processed.replace(/fill="black"/gi, 'fill="rgb(var(--color-ink))"');
    
    // Replace fill="white" with fill="rgb(var(--color-page))"
    processed = processed.replace(/fill="white"/gi, 'fill="rgb(var(--color-page))"');
    
    // Handle fill='black' and fill='white' (single quotes)
    processed = processed.replace(/fill='black'/gi, 'fill="rgb(var(--color-ink))"');
    processed = processed.replace(/fill='white'/gi, 'fill="rgb(var(--color-page))"');
    
    // Handle fill:black and fill:white in style attributes
    processed = processed.replace(/fill:\s*black/gi, 'fill: rgb(var(--color-ink))');
    processed = processed.replace(/fill:\s*white/gi, 'fill: rgb(var(--color-page))');
    
    // Handle #000000 and #000 (black hex)
    processed = processed.replace(/fill="#000000"/gi, 'fill="rgb(var(--color-ink))"');
    processed = processed.replace(/fill="#000"/gi, 'fill="rgb(var(--color-ink))"');
    processed = processed.replace(/fill='#000000'/gi, 'fill="rgb(var(--color-ink))"');
    processed = processed.replace(/fill='#000'/gi, 'fill="rgb(var(--color-ink))"');
    
    // Handle #FFFFFF and #FFF (white hex)
    processed = processed.replace(/fill="#FFFFFF"/gi, 'fill="rgb(var(--color-page))"');
    processed = processed.replace(/fill="#FFF"/gi, 'fill="rgb(var(--color-page))"');
    processed = processed.replace(/fill="#fff"/gi, 'fill="rgb(var(--color-page))"');
    processed = processed.replace(/fill='#FFFFFF'/gi, 'fill="rgb(var(--color-page))"');
    processed = processed.replace(/fill='#FFF'/gi, 'fill="rgb(var(--color-page))"');
    processed = processed.replace(/fill='#fff'/gi, 'fill="rgb(var(--color-page))"');
    
    // Handle gray/muted colors - map to theme's muted color
    // Common gray hex values (like #9C9C9C, #808080, #999999, etc.)
    // Match any 3 or 6 digit hex that represents a gray color (where R=G=B or close grays)
    processed = processed.replace(/fill="#9C9C9C"/gi, 'fill="rgb(var(--color-muted))"');
    processed = processed.replace(/fill="#9c9c9c"/gi, 'fill="rgb(var(--color-muted))"');
    processed = processed.replace(/fill='#9C9C9C'/gi, 'fill="rgb(var(--color-muted))"');
    processed = processed.replace(/fill='#9c9c9c'/gi, 'fill="rgb(var(--color-muted))"');
    // Also handle other common gray shades
    processed = processed.replace(/fill="#808080"/gi, 'fill="rgb(var(--color-muted))"');
    processed = processed.replace(/fill="#999999"/gi, 'fill="rgb(var(--color-muted))"');
    processed = processed.replace(/fill="#CCCCCC"/gi, 'fill="rgb(var(--color-muted))"');
    processed = processed.replace(/fill="#D9D9D9"/gi, 'fill="rgb(var(--color-muted))"');

    // Ensure SVG scales properly by removing fixed width/height and adding width/height="100%"
    // This allows the SVG to scale to the container size (18px)
    processed = processed.replace(/<svg([^>]*)\s+width="[^"]*"/gi, '<svg$1 width="100%"');
    processed = processed.replace(/<svg([^>]*)\s+height="[^"]*"/gi, '<svg$1 height="100%"');
    
    // If width/height weren't in the original, add them
    if (!processed.includes('width=')) {
      processed = processed.replace(/<svg([^>]*)>/i, '<svg$1 width="100%" height="100%">');
    } else if (!processed.includes('height=')) {
      processed = processed.replace(/<svg([^>]*)>/i, '<svg$1 height="100%">');
    }

    return processed;
  };

  // Load and process SVG
  const loadSvg = async (svgPath: string) => {
    if (!svgPath) {
      setError(true);
      setIsLoading(false);
      return;
    }

    try {
      // If we already have the original SVG cached, just re-process it
      if (originalSvgRef.current) {
        const processed = processSvg(originalSvgRef.current);
        setProcessedSvg(processed);
        setIsLoading(false);
        return;
      }

      // Fetch the SVG file
      const response = await fetch(svgPath);
      if (!response.ok) {
        throw new Error(`Failed to load SVG: ${response.statusText}`);
      }

      const svgContent = await response.text();
      
      // Cache the original SVG
      originalSvgRef.current = svgContent;
      
      // Process and set the SVG
      const processed = processSvg(svgContent);
      setProcessedSvg(processed);
      setIsLoading(false);
      setError(false);
    } catch (err) {
      console.warn(`Failed to load logo for ${companyName}:`, err);
      setError(true);
      setIsLoading(false);
    }
  };

  // Re-process SVG when theme changes
  const handleThemeChange = () => {
    if (originalSvgRef.current) {
      const processed = processSvg(originalSvgRef.current);
      setProcessedSvg(processed);
    }
  };

  // Initial load and theme change listener
  useEffect(() => {
    const svgPath = getSvgPath(companyName);
    loadSvg(svgPath);

    // Listen for theme changes
    const themeChangeHandler = () => {
      handleThemeChange();
    };

    window.addEventListener('theme-change', themeChangeHandler as EventListener);
    
    // Also watch for class changes on documentElement (theme class changes)
    const observer = new MutationObserver(() => {
      handleThemeChange();
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => {
      window.removeEventListener('theme-change', themeChangeHandler as EventListener);
      observer.disconnect();
    };
  }, [companyName]);

  if (error) {
    return (
      <div 
        className={className}
        style={{ width: '18px', height: '18px', ...style }}
        aria-label={`${companyName} logo`}
      />
    );
  }

  if (isLoading) {
    return (
      <div 
        className={className}
        style={{ width: '18px', height: '18px', ...style }}
        aria-label={`${companyName} logo`}
      />
    );
  }

  return (
    <div
      className={`${className} flex items-center justify-center`}
      style={{ width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', ...style }}
      aria-label={`${companyName} logo`}
    >
      <div
        style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        dangerouslySetInnerHTML={{ __html: processedSvg }}
      />
    </div>
  );
};

export default CompanyLogo;
