# OrbBackground Component

A premium, shader-based animated orb component that creates organic, morphing gradients using WebGL fragment shaders. Perfect for hero backgrounds, loading states, and brand motifs.

## Features

- **Organic Distortion**: Uses Simplex noise for natural, non-mechanical morphing
- **Soft Volumetric Gradient**: Smooth falloff with configurable intensity
- **Theme-Aware**: Integrates with your design system's color tokens
- **Performance**: Hardware-accelerated via WebGL
- **Configurable**: Size, speed, intensity, noise parameters, and colors

## Basic Usage

```tsx
import OrbBackground from './components/OrbBackground';

<OrbBackground
  primaryColor={[0.22, 0.74, 0.97]}    // Sky blue (RGB 0-1)
  secondaryColor={[0.96, 0.45, 0.71]}  // Pink (RGB 0-1)
  backgroundColor={[0.02, 0.05, 0.15]}  // Deep indigo (RGB 0-1)
  size={0.5}                            // Orb size (0-1)
  speed={0.1}                           // Animation speed
/>
```

## With Theme Colors

```tsx
import OrbBackground from './components/OrbBackground';
import { useThemeColors } from '../hooks/useThemeColors';

function MyComponent() {
  const colors = useThemeColors();
  
  return (
    <OrbBackground
      primaryColor={colors.accent}
      secondaryColor={colors.muted}
      backgroundColor={colors.page}
      size={0.6}
      speed={0.05}
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `primaryColor` | `[number, number, number]` | `[0.22, 0.74, 0.97]` | Primary orb color (RGB 0-1) |
| `secondaryColor` | `[number, number, number]` | `[0.96, 0.45, 0.71]` | Secondary gradient color (RGB 0-1) |
| `backgroundColor` | `[number, number, number]` | `[0.02, 0.05, 0.15]` | Background color (RGB 0-1) |
| `size` | `number` | `0.4` | Orb size relative to canvas (0-1) |
| `intensity` | `number` | `0.0` | Pulsing intensity (0-1) |
| `speed` | `number` | `0.1` | Animation speed multiplier |
| `noiseScale` | `number` | `3.0` | Noise frequency (higher = finer detail) |
| `noiseAmount` | `number` | `0.08` | Distortion amount (higher = more organic) |
| `center` | `[number, number]` | `[0.5, 0.5]` | Orb center position (0-1) |
| `className` | `string` | `''` | CSS class for container |
| `style` | `React.CSSProperties` | `{}` | Inline styles |

## Use Cases

### Hero Background
```tsx
<div className="relative h-screen">
  <OrbBackground
    primaryColor={colors.accent}
    secondaryColor={colors.muted}
    backgroundColor={colors.page}
    size={0.8}
    speed={0.02}
    noiseScale={2.0}
    noiseAmount={0.15}
    className="absolute inset-0 opacity-30"
  />
  <div className="relative z-10">
    {/* Your content */}
  </div>
</div>
```

### Loading State
```tsx
<OrbBackground
  primaryColor={colors.accent}
  secondaryColor={colors.muted}
  backgroundColor={colors.page}
  size={0.5}
  intensity={isLoading ? 0.8 : 0.0}
  speed={isLoading ? 0.15 : 0.05}
  className="w-32 h-32"
/>
```

### Brand Motif
```tsx
<OrbBackground
  primaryColor={colors.accent}
  secondaryColor={[colors.accent[0] * 0.7, colors.accent[1] * 0.7, colors.accent[2] * 0.7]}
  backgroundColor={colors.page}
  size={0.45}
  speed={0.08}
  noiseScale={4.0}
  noiseAmount={0.06}
  className="w-16 h-16"
/>
```

## Color Utilities

The component includes utilities for working with theme colors:

```tsx
import { getCssVarAsRgb, hexToRgb } from '../utils/colorUtils';

// Get CSS variable as RGB array
const accentColor = getCssVarAsRgb('--color-accent');

// Convert hex to RGB
const pink = hexToRgb('#f472b6'); // [0.96, 0.45, 0.71]
```

## Theme Hook

Use the `useThemeColors` hook for reactive theme color access:

```tsx
import { useThemeColors } from '../hooks/useThemeColors';

function ThemedOrb() {
  const colors = useThemeColors(); // Automatically updates on theme change
  
  return (
    <OrbBackground
      primaryColor={colors.accent}
      secondaryColor={colors.muted}
      backgroundColor={colors.page}
    />
  );
}
```

## Performance Notes

- The component uses WebGL for hardware acceleration
- Shaders are compiled once per color change (not per frame)
- Suitable for multiple instances on the same page
- Automatically handles high-DPI displays

## Browser Support

Requires WebGL support (all modern browsers). Falls back gracefully if WebGL is unavailable.
