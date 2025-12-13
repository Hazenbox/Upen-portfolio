/**
 * Convert hex color to RGB array (0-1 range)
 */
export function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    throw new Error(`Invalid hex color: ${hex}`);
  }
  return [
    parseInt(result[1], 16) / 255,
    parseInt(result[2], 16) / 255,
    parseInt(result[3], 16) / 255,
  ];
}

/**
 * Convert CSS RGB string (e.g., "rgb(255, 128, 64)") to RGB array (0-1 range)
 */
export function cssRgbToRgb(cssRgb: string): [number, number, number] {
  const match = cssRgb.match(/\d+/g);
  if (!match || match.length !== 3) {
    throw new Error(`Invalid CSS RGB: ${cssRgb}`);
  }
  return [
    parseInt(match[0], 10) / 255,
    parseInt(match[1], 10) / 255,
    parseInt(match[2], 10) / 255,
  ];
}

/**
 * Get CSS variable value as RGB array (0-1 range)
 * Handles space-separated RGB format (e.g., "255 128 64") used by Tailwind
 */
export function getCssVarAsRgb(
  varName: string,
  element: HTMLElement = document.documentElement
): [number, number, number] {
  if (typeof window === 'undefined') {
    // SSR fallback
    return [0.5, 0.5, 0.5];
  }

  const value = getComputedStyle(element).getPropertyValue(varName).trim();
  
  if (!value) {
    console.warn(`CSS variable ${varName} not found`);
    return [0.5, 0.5, 0.5];
  }
  
  if (value.startsWith('#')) {
    return hexToRgb(value);
  }
  
  // Handle space-separated RGB format (e.g., "255 128 64")
  const parts = value.split(/\s+/).filter(p => p.length > 0);
  if (parts.length >= 3) {
    return [
      parseInt(parts[0], 10) / 255,
      parseInt(parts[1], 10) / 255,
      parseInt(parts[2], 10) / 255,
    ];
  }
  
  // Handle rgb(r g b) format
  const rgbMatch = value.match(/(\d+)\s+(\d+)\s+(\d+)/);
  if (rgbMatch) {
    return [
      parseInt(rgbMatch[1], 10) / 255,
      parseInt(rgbMatch[2], 10) / 255,
      parseInt(rgbMatch[3], 10) / 255,
    ];
  }
  
  // Fallback to default
  console.warn(`Could not parse CSS variable ${varName}: ${value}`);
  return [0.5, 0.5, 0.5];
}
