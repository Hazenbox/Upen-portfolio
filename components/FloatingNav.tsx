import React, { useState, useEffect, useRef } from 'react';

interface FloatingNavProps {
  activeSection: string;
  scrollToSection: (sectionId: string) => void;
}

const FloatingNav: React.FC<FloatingNavProps> = ({ activeSection, scrollToSection }) => {
  const [prevSection, setPrevSection] = useState<string>(activeSection);
  const [isVisible, setIsVisible] = useState(false);
  
  const navItems = [
    { 
      id: 'work', 
      label: 'Work',
      icon: 'grid_view'
    },
    { 
      id: 'experience', 
      label: 'Experience',
      icon: 'history'
    },
    { 
      id: 'contact', 
      label: 'Contact',
      icon: 'mail'
    },
    {
      id: 'resume',
      label: 'Resume',
      icon: 'description'
    }
  ];

  const activeIndex = navItems.findIndex(item => item.id === activeSection);
  const prevIndex = navItems.findIndex(item => item.id === prevSection);

  useEffect(() => {
    if (activeSection !== prevSection) {
       // Allow animation to play
       const timer = setTimeout(() => {
         setPrevSection(activeSection);
       }, 400); // match transition duration
       return () => clearTimeout(timer);
    }
  }, [activeSection, prevSection]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      if (scrollY > 100) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Layout Constants
  const ITEM_WIDTH = 48;
  const GAP = 4;
  const LOGO_WIDTH = 50;
  const START_OFFSET = LOGO_WIDTH + GAP; // Space for "Upen" logo
  const CONTAINER_WIDTH = 280;

  const getTranslateX = (index: number) => {
    const base = START_OFFSET; 
    const offset = index * (ITEM_WIDTH + GAP);
    return `${base + offset}px`;
  };

  const isMovingRight = activeIndex > prevIndex;
  
  return (
    <div 
      className={`fixed bottom-10 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}
    >
      <style>{`
        .glass-dock-container {
            /* Inverted contrast logic: Use Ink color for background to contrast with Page */
            --c-bg: rgba(var(--color-ink), 0.85);
            --c-glass: rgba(var(--color-ink), 0.9);
            --c-border: rgba(var(--color-ink), 0.05);
            
            /* Text content uses Page color to stand out against Ink background */
            --c-content: rgba(var(--color-page), 0.6);
            --c-active: rgba(var(--color-page), 1);
            
            /* Highlight pill uses Page color with low opacity */
            --c-highlight: rgba(var(--color-page), 0.15);
        }

        .switcher {
          position: relative;
          display: flex;
          align-items: center;
          gap: 4px; 
          width: ${CONTAINER_WIDTH}px; 
          height: 52px;
          padding: 6px 8px;
          box-sizing: border-box;
          border-radius: 99em;
          background-color: var(--c-bg);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid var(--c-border);
          box-shadow: 0 4px 20px -5px rgba(0,0,0,0.2);
        }

        .switcher__bg {
          position: absolute;
          left: 4px; 
          top: 4px;
          display: block;
          width: 56px; 
          height: calc(100% - 8px);
          border-radius: 99em;
          background-color: var(--c-highlight);
          z-index: 0;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
          transition: translate 400ms cubic-bezier(1, 0, 0.4, 1);
        }

        .switcher__logo {
          position: relative;
          z-index: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          width: ${LOGO_WIDTH}px;
          height: 100%;
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          color: var(--c-active);
          font-size: 14px;
          margin-right: 4px;
        }

        .switcher__option {
          position: relative;
          z-index: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          width: ${ITEM_WIDTH}px;
          flex: 0 0 ${ITEM_WIDTH}px;
          height: 100%;
          border-radius: 99em;
          color: var(--c-content);
          transition: all 160ms;
          cursor: pointer;
        }

        .switcher__option:hover {
          color: var(--c-active);
        }
        
        .switcher__option.active {
          color: var(--c-active);
          cursor: default;
        }

        .switcher__icon {
          display: block;
          transition: scale 200ms cubic-bezier(0.5, 0, 0, 1);
        }

        .switcher__option:hover .switcher__icon {
          scale: 1.2;
        }
        
        .switcher__option.active .switcher__icon {
          scale: 1;
        }

        /* Animations */
        @keyframes scaleToggle {
          0% { scale: 1 1; }
          50% { scale: 1.1 1; }
          100% { scale: 1 1; }
        }

        .animate-squish {
          animation: scaleToggle 440ms ease;
        }
      `}</style>

      <div className="glass-dock-container">
        <div className="switcher">
          {/* Logo */}
          <div className="switcher__logo">Upen</div>

          {/* Moving Background Pill */}
          <div 
            className={`switcher__bg ${activeSection !== prevSection ? 'animate-squish' : ''}`}
            style={{ 
              translate: `${getTranslateX(activeIndex)} 0`,
              transformOrigin: isMovingRight ? 'left' : 'right'
            }}
          ></div>

          {/* Nav Items */}
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className={`switcher__option ${activeSection === item.id ? 'active' : ''}`}
              aria-label={item.label}
            >
              <span className="switcher__icon">
                 <span className="material-symbols-rounded text-xl">{item.icon}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FloatingNav;