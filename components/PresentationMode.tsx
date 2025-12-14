import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface Slide {
  sectionId: string;
  slideIndex: number; // 0-based index within the section
}

interface PresentationModeProps {
  isActive: boolean;
  sections: Array<{ id: string; label: string }>;
  slides: Slide[]; // Array of slides
  currentIndex: number; // Now represents slide index, not section index
  onNext: () => void;
  onPrevious: () => void;
  onExit: () => void;
  onJumpToFirst?: () => void;
  onJumpToLast?: () => void;
  children: React.ReactNode;
}

const PresentationMode: React.FC<PresentationModeProps> = ({
  isActive,
  sections,
  slides,
  currentIndex,
  onNext,
  onPrevious,
  onExit,
  onJumpToFirst,
  onJumpToLast,
  children
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Prevent body scroll when presentation mode is active
  useEffect(() => {
    if (isActive) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isActive]);

  // Show/hide slides based on currentIndex
  useEffect(() => {
    if (!isActive) {
      // Reset all styles when presentation mode is disabled
      if (contentRef.current) {
        const allSections = contentRef.current.querySelectorAll('section[id]');
        allSections.forEach((section) => {
          (section as HTMLElement).style.display = '';
        });
        const allSlides = contentRef.current.querySelectorAll('[data-slide]');
        allSlides.forEach((slide) => {
          (slide as HTMLElement).style.display = '';
        });
      }
      return;
    }

    if (!contentRef.current || !slides || slides.length === 0) return;

    const currentSlide = slides[currentIndex];
    if (!currentSlide) return;

    // Use requestAnimationFrame to ensure DOM is ready
    const frameId = requestAnimationFrame(() => {
      if (!contentRef.current) return;

      // Hide all sections first
      const allSections = contentRef.current.querySelectorAll('section[id]');
      allSections.forEach((section) => {
        (section as HTMLElement).style.display = 'none';
      });

      // Show the section containing the current slide
      const targetSection = contentRef.current.querySelector(`section[id="${currentSlide.sectionId}"]`) as HTMLElement;
      if (targetSection) {
        targetSection.style.display = 'block';
        
        // Check if section has any data-slide elements
        const allSlides = targetSection.querySelectorAll('[data-slide]');
        
        if (allSlides.length > 0) {
          // Section has slides defined - hide all and show only current
          allSlides.forEach((slide) => {
            (slide as HTMLElement).style.display = 'none';
          });

          // Show only the current slide - data-slide values are strings
          let found = false;
          allSlides.forEach((slide) => {
            const slideValue = slide.getAttribute('data-slide');
            if (slideValue === String(currentSlide.slideIndex)) {
              (slide as HTMLElement).style.display = 'block';
              found = true;
            }
          });

          // If no slide found, show first slide as fallback
          if (!found && allSlides.length > 0) {
            (allSlides[0] as HTMLElement).style.display = 'block';
          }
        } else {
          // No slides defined in section - show all content (fallback)
          // This handles sections that don't have data-slide attributes
        }
      }
    });

    return () => cancelAnimationFrame(frameId);
  }, [isActive, currentIndex, slides]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isActive || !slides || slides.length === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default for navigation keys
      if (['ArrowRight', 'ArrowLeft', 'Space', 'Home', 'End'].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === 'ArrowRight' || (e.key === 'Space' && !e.shiftKey)) {
        if (currentIndex < slides.length - 1) {
          e.preventDefault();
          e.stopPropagation();
          onNext();
        }
      } else if (e.key === 'ArrowLeft' || (e.key === 'Space' && e.shiftKey)) {
        if (currentIndex > 0) {
          e.preventDefault();
          e.stopPropagation();
          onPrevious();
        }
      } else if (e.key === 'Home' && onJumpToFirst) {
        e.preventDefault();
        onJumpToFirst();
      } else if (e.key === 'End' && onJumpToLast) {
        e.preventDefault();
        onJumpToLast();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onExit();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isActive, currentIndex, slides, onNext, onPrevious, onExit, onJumpToFirst, onJumpToLast]);

  if (!isActive) {
    return <>{children}</>;
  }

  // Safety checks
  if (!slides || slides.length === 0) {
    return <>{children}</>;
  }

  const currentSlide = slides[currentIndex];
  if (!currentSlide) {
    return <>{children}</>;
  }

  const currentSection = sections.find(s => s.id === currentSlide.sectionId) || null;
  const isFirstSlide = currentIndex === 0;
  const isLastSlide = currentIndex === slides.length - 1;
  
  // Calculate slide number within current section
  const slidesInCurrentSection = slides.filter(s => s.sectionId === currentSlide.sectionId);
  const slideNumberInSection = slidesInCurrentSection.findIndex(s => 
    s.sectionId === currentSlide.sectionId && s.slideIndex === currentSlide.slideIndex
  ) + 1;
  const totalSlidesInSection = slidesInCurrentSection.length;

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          ref={containerRef}
          className="fixed inset-0 z-[90] bg-page/98 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Exit Button - Top Right */}
          <motion.button
            onClick={onExit}
            className="fixed top-8 right-8 z-[100] w-12 h-12 flex items-center justify-center rounded-full bg-panel/90 backdrop-blur-sm text-ink hover:bg-panel transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Exit Presentation Mode"
          >
            <span className="material-symbols-rounded text-xl" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}>
              close
            </span>
          </motion.button>

          {/* Section Title - Top Right Center */}
          <motion.div
            className="fixed top-8 right-1/2 translate-x-1/2 z-[100]"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            key={currentSlide?.sectionId}
          >
            <h2 className="font-display font-bold text-lg md:text-xl text-ink text-center px-4 py-2 rounded-full bg-panel/90 backdrop-blur-sm">
              {currentSection?.label || 'Overview'}
              {totalSlidesInSection > 1 && (
                <span className="text-sm text-muted ml-2">
                  ({slideNumberInSection}/{totalSlidesInSection})
                </span>
              )}
            </h2>
          </motion.div>

          {/* Progress Indicator with Arrows - Bottom Center */}
          <motion.div
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Previous Button - Left of Slide Count */}
            <motion.button
              onClick={onPrevious}
              disabled={isFirstSlide}
              className={`w-8 h-8 flex items-center justify-center rounded-full backdrop-blur-sm transition-all ${
                isFirstSlide
                  ? 'bg-panel/40 text-muted cursor-not-allowed'
                  : 'bg-panel/90 text-ink hover:bg-panel'
              }`}
              whileHover={!isFirstSlide ? { scale: 1.1 } : {}}
              whileTap={!isFirstSlide ? { scale: 0.9 } : {}}
              aria-label="Previous Slide"
            >
              <span className="material-symbols-rounded text-lg" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}>
                arrow_back
              </span>
            </motion.button>

            {/* Slide Count */}
            <div className="px-4 py-2 rounded-full bg-panel/90 backdrop-blur-sm">
              <div className="font-sans text-sm text-ink text-center">
                <span className="font-medium">Slide {currentIndex + 1}</span>
                <span className="text-muted mx-2">/</span>
                <span className="text-muted">{slides.length}</span>
              </div>
            </div>

            {/* Next Button - Right of Slide Count */}
            <motion.button
              onClick={onNext}
              disabled={isLastSlide}
              className={`w-8 h-8 flex items-center justify-center rounded-full backdrop-blur-sm transition-all ${
                isLastSlide
                  ? 'bg-panel/40 text-muted cursor-not-allowed'
                  : 'bg-panel/90 text-ink hover:bg-panel'
              }`}
              whileHover={!isLastSlide ? { scale: 1.1 } : {}}
              whileTap={!isLastSlide ? { scale: 0.9 } : {}}
              aria-label="Next Slide"
            >
              <span className="material-symbols-rounded text-lg" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}>
                arrow_forward
              </span>
            </motion.button>
          </motion.div>

          {/* Content Container */}
          <div className="absolute inset-0 overflow-y-auto">
            <div className="min-h-full flex items-start justify-center py-20">
              <div ref={contentRef} className="w-full max-w-5xl mx-auto px-8">
                {children}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PresentationMode;
