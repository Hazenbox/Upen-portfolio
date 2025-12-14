import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Theme } from '../types';

interface ThemeSwitcherProps {
  orientation?: 'horizontal' | 'vertical';
}

interface ThemeOption {
  id: Theme;
  label: string;
  color: string;
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ orientation = 'horizontal' }) => {
  // Initialize from localStorage immediately to avoid flash of wrong theme
  const getInitialTheme = (): Theme => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme') as Theme;
      return saved || 'light';
    }
    return 'light';
  };

  const [activeTheme, setActiveTheme] = useState<Theme>(getInitialTheme);
  const [mounted, setMounted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isContainerHovered, setIsContainerHovered] = useState(false);
  const activeThemeRef = useRef<Theme>(activeTheme);
  const sliderRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Keep ref in sync with state
  useEffect(() => {
    activeThemeRef.current = activeTheme;
  }, [activeTheme]);

  // Ordered scale from Light to Dark
  const themes: ThemeOption[] = [
    { id: 'light', label: 'Light', color: '#FFFFFF' },
    { id: 'soft', label: 'Soft', color: '#FFF5F6' },
    { id: 'retro', label: 'Retro', color: '#F2EEE6' },
    { id: 'organic', label: 'Organic', color: '#F0F4F0' },
    { id: 'breeze', label: 'Breeze', color: '#F0F7FF' },
    { id: 'dusk', label: 'Dusk', color: '#1E1B2E' },
    { id: 'ember', label: 'Ember', color: '#221510' },
    { id: 'void', label: 'Void', color: '#0B0F19' },
    { id: 'dark', label: 'Dark', color: '#040404' },
  ];

  // Initialize and set up event listener (only once on mount)
  useEffect(() => {
    setMounted(true);
    
    // Sync with localStorage on mount
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme && savedTheme !== activeTheme) {
      setActiveTheme(savedTheme);
      activeThemeRef.current = savedTheme;
    }

    // Event listener with ref to avoid stale closure
    const handleExternalChange = (e: CustomEvent) => {
      const newTheme = e.detail?.theme;
      if (newTheme && newTheme !== activeThemeRef.current) {
        setActiveTheme(newTheme);
        activeThemeRef.current = newTheme;
      }
    };
    
    window.addEventListener('theme-change', handleExternalChange as EventListener);
    return () => window.removeEventListener('theme-change', handleExternalChange as EventListener);
  }, []); // Empty dependency array - only run on mount

  useEffect(() => {
    if (!mounted) return;
    const timer = setTimeout(() => {
      localStorage.setItem('theme', activeTheme);
    }, 500);
    return () => clearTimeout(timer);
  }, [activeTheme, mounted]);

  const updateTheme = useCallback((t: Theme) => {
    setActiveTheme(t);
    window.dispatchEvent(new CustomEvent('theme-change', { detail: { theme: t } }));
  }, []);

  // Calculate active theme index
  const activeIndex = themes.findIndex(t => t.id === activeTheme);
  const safeActiveIndex = activeIndex >= 0 ? activeIndex : 0;

  // Calculate slider position (0-100%) - centered between divider lines
  const getSliderPosition = () => {
    const segmentCount = themes.length;
    // Position knob at the center between two divider lines
    // Divider lines are at: 1/segmentCount, 2/segmentCount, ..., (segmentCount-1)/segmentCount
    // For index i, position at center between divider i/segmentCount and (i+1)/segmentCount
    // Formula: (i + 0.5) / segmentCount * 100
    return ((safeActiveIndex + 0.5) / segmentCount) * 100;
  };

  // Get theme at a given position (0-100%)
  const getThemeAtPosition = (position: number): Theme => {
    const segmentCount = themes.length;
    // Find which knob position (center between dividers) the click is closest to
    // Knob positions are at: (i + 0.5) / segmentCount for i = 0 to segmentCount-1
    let closestIndex = 0;
    let minDistance = Infinity;
    
    // Check all knob positions (centers between dividers)
    for (let i = 0; i < segmentCount; i++) {
      const knobPosition = ((i + 0.5) / segmentCount) * 100;
      const distance = Math.abs(position - knobPosition);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = i;
      }
    }
    
    return themes[closestIndex].id;
  };

  // Handle slider interaction
  const handleSliderInteraction = useCallback((clientX: number, clientY: number) => {
    if (!sliderRef.current) return;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const isVertical = orientation === 'vertical';
    const position = isVertical
      ? ((clientY - rect.top) / rect.height) * 100
      : ((clientX - rect.left) / rect.width) * 100;
    
    const clampedPosition = Math.max(0, Math.min(100, position));
    const newTheme = getThemeAtPosition(clampedPosition);
    
    if (newTheme !== activeThemeRef.current) {
      updateTheme(newTheme);
    }
  }, [orientation, updateTheme]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleSliderInteraction(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      handleSliderInteraction(e.clientX, e.clientY);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setIsDragging(false);
  };

  const handleMouseMoveOnSlider = (e: React.MouseEvent) => {
    if (isHovering || isDragging) {
      handleSliderInteraction(e.clientX, e.clientY);
    }
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove]);

  if (!mounted) return null;

  const isVertical = orientation === 'vertical';
  const sliderPosition = getSliderPosition();

  const handleContainerMouseEnter = () => {
    setIsContainerHovered(true);
  };

  const handleContainerMouseLeave = () => {
    setIsContainerHovered(false);
  };

  return (
    <div 
      ref={containerRef}
      className="relative z-50"
      onMouseEnter={handleContainerMouseEnter}
      onMouseLeave={handleContainerMouseLeave}
    >
      <AnimatePresence mode="wait">
        {!isContainerHovered ? (
          <motion.button
            key="collapsed"
            className="flex items-center justify-center px-2.5 py-2.5 rounded-full bg-panel theme-switcher-container text-ink/60 hover:text-ink transition-colors min-w-[36px] min-h-[36px]"
            onClick={() => setIsContainerHovered(true)}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </motion.button>
        ) : (
          <motion.div
            key="expanded"
            initial={{ width: 36 }}
            animate={{ width: 280 }}
            exit={{ width: 36 }}
            transition={{ 
              duration: 0.15,
              ease: [0.4, 0, 0.2, 1]
            }}
            style={{ overflow: 'hidden' }}
            className="flex items-center gap-3 px-2.5 py-2.5 rounded-full bg-panel theme-switcher-container min-w-[36px] min-h-[36px]"
          >
              {/* Light Mode Icon */}
              <div className="flex-shrink-0 text-ink/60">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>

              {/* Slider Component */}
              <div
                ref={sliderRef}
                className={`
                  relative cursor-pointer rounded-full overflow-hidden
                  ${isVertical ? 'w-12 h-64' : 'h-5 w-52'}
                  bg-panel/90 theme-switcher-container theme-switcher-slider
                `}
                onMouseDown={handleMouseDown}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onMouseMove={handleMouseMoveOnSlider}
              >
        {/* Divider Lines */}
        <div className={`absolute inset-0 flex ${isVertical ? 'flex-col' : 'flex-row'}`}>
          {themes.map((theme, index) => (
            <div
              key={theme.id}
              className="flex-1 relative"
            >
              {/* Vertical divider lines (for horizontal slider) */}
              {!isVertical && index < themes.length - 1 && (
                <div className="absolute right-0 top-0 bottom-0 w-[1px] theme-switcher-segment-line z-10" />
              )}
              {/* Horizontal divider lines (for vertical slider) */}
              {isVertical && index < themes.length - 1 && (
                <div className="absolute bottom-0 left-0 right-0 h-[1px] theme-switcher-segment-line z-10" />
              )}
            </div>
          ))}
        </div>
        
        {/* Slider Thumb/Knob - Centered on track */}
        <motion.div
          className={`
            absolute z-20 rounded-full bg-page
            shadow-lg pointer-events-none
            w-2 h-2
            flex items-center justify-center
          `}
          style={{
            ...(isVertical 
              ? {
                  // Center horizontally: position left edge at 50% then shift left by half knob width (4px = 0.25rem)
                  left: 'calc(50% - 0.25rem)',
                  // Center vertically: position top edge at sliderPosition% then shift up by half knob height
                  top: `calc(${sliderPosition}% - 0.25rem)`,
                }
              : {
                  // Center vertically: position top edge at 50% then shift up by half knob height
                  top: 'calc(50% - 0.25rem)',
                  // Center horizontally: position left edge at sliderPosition% then shift left by half knob width
                  left: `calc(${sliderPosition}% - 0.25rem)`,
                }
            ),
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30
          }}
          animate={{
            scale: isDragging ? 1.1 : 1,
          }}
        >
          {/* Inner indicator */}
          <div 
            className="absolute inset-0 rounded-full"
            style={{ backgroundColor: themes[safeActiveIndex].color }}
          />
        </motion.div>
              </div>

              {/* Dark Mode Icon */}
              <div className="flex-shrink-0 text-ink/60">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
    </div>
  );
};

export default ThemeSwitcher;
