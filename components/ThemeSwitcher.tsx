import React, { useState, useEffect, useCallback } from 'react';
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
  const [activeTheme, setActiveTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

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

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) setActiveTheme(savedTheme);

    const handleExternalChange = (e: CustomEvent) => {
      if (e.detail?.theme && e.detail.theme !== activeTheme) {
        setActiveTheme(e.detail.theme);
      }
    };
    
    window.addEventListener('theme-change', handleExternalChange as EventListener);
    return () => window.removeEventListener('theme-change', handleExternalChange as EventListener);
  }, [activeTheme]);

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

  if (!mounted) return null;

  const isVertical = orientation === 'vertical';

  // --- Animation Variants ---
  const containerVariants = {
    collapsed: { 
      width: '36px', 
      height: '36px', 
      borderRadius: '18px',
      padding: '0px'
    },
    expanded: { 
      width: isVertical ? '44px' : '230px', 
      height: isVertical ? '230px' : '36px',
      borderRadius: '18px',
      padding: '0 8px'
    }
  };

  const contentVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.02, delayChildren: 0.05 } 
    },
    exit: { opacity: 0, transition: { duration: 0.1 } }
  };

  const tickVariants = {
    inactive: {
      height: isVertical ? '2px' : '8px', 
      width: isVertical ? '8px' : '2px',
      opacity: 0.3,
      transition: { type: "spring", stiffness: 300, damping: 20 }
    },
    active: {
      height: isVertical ? '2px' : '16px', 
      width: isVertical ? '16px' : '2px',
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 20 }
    },
    hover: {
      height: isVertical ? '2px' : '24px', 
      width: isVertical ? '24px' : '2px',
      opacity: 1,
      transition: { type: "spring", stiffness: 400, damping: 15 }
    }
  };

  return (
    <motion.div 
      layout
      initial="collapsed"
      animate={isExpanded ? "expanded" : "collapsed"}
      variants={containerVariants}
      transition={{ type: "spring", stiffness: 400, damping: 32 }}
      className="relative z-50 flex items-center justify-center bg-panel/80 backdrop-blur-md shadow-sm shadow-black/5 overflow-hidden"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      onClick={() => !isExpanded && setIsExpanded(true)}
    >
      <AnimatePresence mode="popLayout">
        
        {/* === COLLAPSED STATE === */}
        {!isExpanded ? (
          <motion.div
            key="collapsed-icon"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
             <span className="material-symbols-rounded text-[18px] text-ink">
               {['light', 'soft', 'retro', 'organic', 'breeze'].includes(activeTheme) ? 'light_mode' : 'dark_mode'}
             </span>
          </motion.div>
        ) : (
          
          /* === EXPANDED STATE === */
          <motion.div
            key="expanded-content"
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`flex items-center w-full h-full ${isVertical ? 'flex-col py-3' : 'flex-row'}`}
          >
             {/* Start Icon (Light) */}
             <motion.span 
               initial={{ opacity: 0, scale: 0.5 }}
               animate={{ opacity: 1, scale: 1 }}
               className={`material-symbols-rounded text-[14px] text-muted select-none flex-shrink-0 ${isVertical ? 'mb-2' : 'ml-1 mr-2'}`}
               style={{ fontVariationSettings: "'FILL' 1" }}
             >
               wb_sunny
             </motion.span>
             
             {/* The Scale (Tick Marks) */}
             <div className={`flex items-center justify-between flex-1 ${isVertical ? 'flex-col w-full h-full' : 'flex-row h-full'}`}>
                {themes.map((t, index) => {
                    const isActive = activeTheme === t.id;
                    
                    return (
                        <React.Fragment key={t.id}>
                            <motion.div 
                               className={`relative z-10 group flex items-center justify-center cursor-pointer flex-1 ${isVertical ? 'w-full' : 'h-full'}`}
                               onMouseEnter={() => updateTheme(t.id)}
                               initial="inactive"
                               whileHover="hover"
                            >
                                {/* Hit Area */}
                                <div className="absolute inset-0 z-0 bg-transparent" />

                                {/* The Big Line / Tick */}
                                <motion.div
                                    variants={tickVariants}
                                    animate={isActive ? "active" : "inactive"}
                                    className="rounded-full origin-center pointer-events-none bg-ink"
                                />

                                {/* Floating Label (Tooltip) */}
                                <div className={`
                                    absolute pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200
                                    text-[9px] font-bold uppercase tracking-widest whitespace-nowrap z-50
                                    ${isVertical ? 'right-full mr-3 text-ink' : '-bottom-6 text-ink'}
                                `}>
                                    {t.label}
                                </div>
                            </motion.div>

                            {/* Small decorative line between items */}
                            {index < themes.length - 1 && (
                                <div className={`flex items-center justify-center pointer-events-none ${isVertical ? 'h-2 w-full' : 'w-2 h-full'}`}>
                                    <div className={`bg-ink/20 rounded-full ${isVertical ? 'h-[1px] w-[3px]' : 'w-[1px] h-[3px]'}`} />
                                </div>
                            )}
                        </React.Fragment>
                    )
                })}
             </div>

             {/* End Icon (Dark) */}
             <motion.span 
               initial={{ opacity: 0, scale: 0.5 }}
               animate={{ opacity: 1, scale: 1 }}
               className={`material-symbols-rounded text-[14px] text-muted select-none flex-shrink-0 ${isVertical ? 'mt-2' : 'mr-1 ml-2'}`}
               style={{ fontVariationSettings: "'FILL' 1" }}
             >
               bedtime
             </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ThemeSwitcher;