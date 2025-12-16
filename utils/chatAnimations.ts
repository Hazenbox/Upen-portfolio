/**
 * Centralized motion constants for AI Chatbot morphing interaction
 * All animation timings, easings, and scale values are defined here
 */

export const MOTION = {
  duration: {
    orb: 400,      // ms - orb movement animation (reduced for quicker, cleaner motion)
    panel: 500,    // ms - panel scale/fade animation
    content: 300,  // ms - content stagger animation
  },
  easing: {
    // Framer Motion expects arrays for cubic-bezier: [x1, y1, x2, y2]
    movement: [0.4, 0, 0.2, 1] as [number, number, number, number], // ease-out for orb movement
    panel: [0.4, 0, 0.2, 1] as [number, number, number, number],     // ease-out for panel
    content: [0.4, 0, 0.2, 1] as [number, number, number, number],   // ease-in for content
  },
  scale: {
    orbDocked: 0.91,  // 64/70 - orb scale when docked in panel
    panelInitial: 0.95, // panel initial scale
  },
} as const;

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

