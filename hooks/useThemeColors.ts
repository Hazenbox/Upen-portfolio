import { useState, useEffect } from 'react';
import { getCssVarAsRgb } from '../utils/colorUtils';

/**
 * React hook to get theme colors as RGB arrays (0-1 range)
 * Automatically updates when theme changes
 */
export function useThemeColors() {
  const [colors, setColors] = useState({
    page: [0.5, 0.5, 0.5] as [number, number, number],
    panel: [0.5, 0.5, 0.5] as [number, number, number],
    ink: [0.5, 0.5, 0.5] as [number, number, number],
    muted: [0.5, 0.5, 0.5] as [number, number, number],
    line: [0.5, 0.5, 0.5] as [number, number, number],
    accent: [0.5, 0.5, 0.5] as [number, number, number],
  });

  useEffect(() => {
    const updateColors = () => {
      setColors({
        page: getCssVarAsRgb('--color-page'),
        panel: getCssVarAsRgb('--color-panel'),
        ink: getCssVarAsRgb('--color-ink'),
        muted: getCssVarAsRgb('--color-muted'),
        line: getCssVarAsRgb('--color-line'),
        accent: getCssVarAsRgb('--color-accent'),
      });
    };

    // Initial update
    updateColors();

    // Watch for theme changes (you can use MutationObserver for more precise detection)
    const observer = new MutationObserver(updateColors);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    // Also listen for theme changes via custom events if your theme switcher emits them
    window.addEventListener('themechange', updateColors);

    return () => {
      observer.disconnect();
      window.removeEventListener('themechange', updateColors);
    };
  }, []);

  return colors;
}
