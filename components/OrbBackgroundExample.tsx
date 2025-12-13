import React from 'react';
import OrbBackground from './OrbBackground';
import { useThemeColors } from '../hooks/useThemeColors';

/**
 * Example usage of OrbBackground component
 * Shows how to use it as a reusable motion primitive
 * 
 * The OrbBackground component creates a shader-based animated orb with:
 * - Organic distortion using Simplex noise
 * - Soft volumetric gradient
 * - Slow morphing motion
 * - Theme-aware colors
 */

// Example 1: Hero Background with theme colors
export const HeroOrbBackground: React.FC = () => {
  // Get colors from theme (reactively updates on theme change)
  const themeColors = useThemeColors();

  return (
    <div className="absolute inset-0 overflow-hidden">
      <OrbBackground
        primaryColor={themeColors.accent}
        secondaryColor={themeColors.muted}
        backgroundColor={themeColors.page}
        size={0.6}
        speed={0.05}
        noiseScale={2.5}
        noiseAmount={0.1}
        center={[0.3, 0.4]}
        className="absolute"
      />
      {/* Multiple orbs for depth */}
      <OrbBackground
        primaryColor={[
          themeColors.muted[0] * 0.8,
          themeColors.muted[1] * 0.8,
          themeColors.muted[2] * 0.8,
        ]}
        secondaryColor={themeColors.accent}
        backgroundColor={themeColors.page}
        size={0.4}
        speed={0.03}
        noiseScale={3.0}
        noiseAmount={0.12}
        center={[0.7, 0.6]}
        className="absolute opacity-60"
      />
    </div>
  );
};

// Example 2: Loading State Orb
export const LoadingOrb: React.FC<{ isLoading: boolean }> = ({ isLoading }) => {
  return (
    <div className="relative w-32 h-32">
      <OrbBackground
        primaryColor={[0.22, 0.74, 0.97]} // Sky blue
        secondaryColor={[0.96, 0.45, 0.71]} // Pink
        backgroundColor={[0.02, 0.05, 0.15]} // Deep indigo
        size={0.5}
        intensity={isLoading ? 0.8 : 0.0}
        speed={isLoading ? 0.15 : 0.05}
        noiseScale={3.0}
        noiseAmount={0.08}
        center={[0.5, 0.5]}
        className="w-full h-full"
      />
    </div>
  );
};

// Example 3: Brand Motif (small decorative orb)
export const BrandOrb: React.FC = () => {
  const themeColors = useThemeColors();

  return (
    <div className="relative w-16 h-16">
      <OrbBackground
        primaryColor={themeColors.accent}
        secondaryColor={[
          themeColors.accent[0] * 0.7,
          themeColors.accent[1] * 0.7,
          themeColors.accent[2] * 0.7,
        ]}
        backgroundColor={themeColors.page}
        size={0.45}
        speed={0.08}
        noiseScale={4.0}
        noiseAmount={0.06}
        center={[0.5, 0.5]}
        className="w-full h-full"
      />
    </div>
  );
};

// Example 4: Full-screen ambient background
export const AmbientOrbBackground: React.FC = () => {
  const themeColors = useThemeColors();

  return (
    <div className="fixed inset-0 pointer-events-none -z-10">
      <OrbBackground
        primaryColor={themeColors.accent}
        secondaryColor={themeColors.muted}
        backgroundColor={themeColors.page}
        size={0.8}
        speed={0.02}
        noiseScale={2.0}
        noiseAmount={0.15}
        center={[0.5, 0.5]}
        className="w-full h-full opacity-30"
      />
    </div>
  );
};
