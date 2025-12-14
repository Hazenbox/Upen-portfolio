import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import ThemeSwitcher from './ThemeSwitcher';
import ImagePreview from './ImagePreview';
import PresentationMode, { Slide } from './PresentationMode';

interface HiverExperienceRedesignCaseStudyProps {
  onBack: () => void;
}

const sections = [
  { id: 'overview', label: 'Overview' },
  { id: 'how-it-started', label: 'How It Started' },
  { id: 'why-redesign', label: 'Why Redesign?' },
  { id: 'redesign-process', label: 'Redesign Process' },
  { id: 'unified-interface', label: 'Unified Interface' },
  { id: 'component-redesign', label: 'Component Redesign' },
  { id: 'left-panel', label: 'Left Panel' },
  { id: 'right-panel', label: 'Right Panel' },
  { id: 'activity-timeline', label: 'Activity Timeline' },
  { id: 'visual-design', label: 'Visual Design' },
  { id: 'interaction-design', label: 'Interaction Design' },
];

const TOCItem: React.FC<{ section: any; isActive: boolean; onClick: () => void; mouseY: any }> = ({ section, isActive, onClick, mouseY }) => {
  const ref = useRef<HTMLButtonElement>(null);
  const [bounds, setBounds] = useState({ y: 0, height: 0 });

  useEffect(() => {
    const updateBounds = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        setBounds({ y: rect.top, height: rect.height });
      }
    };
    
    updateBounds();
    const interval = setInterval(updateBounds, 100);
    window.addEventListener('resize', updateBounds);
    window.addEventListener('scroll', updateBounds); 
    return () => {
        clearInterval(interval);
        window.removeEventListener('resize', updateBounds);
        window.removeEventListener('scroll', updateBounds);
    }
  }, []);

  const distance = useTransform(mouseY, (val: number | null) => {
    if (val === null || bounds.height === 0) return 1000;
    const center = bounds.y + bounds.height / 2;
    return val - center;
  });

  const baseWidth = isActive ? 24 : 8;
  const hoverWidth = 36;
  
  const rawWidth = useTransform(distance, [-120, 0, 120], [baseWidth, hoverWidth, baseWidth]);
  const rawHeight = useTransform(distance, [-120, 0, 120], [1.5, 4, 1.5]);
  const rawOpacity = useTransform(distance, [-120, 0, 120], [isActive ? 1 : 0.3, 1, isActive ? 1 : 0.3]);

  const width = useSpring(rawWidth, { mass: 0.1, stiffness: 150, damping: 12 });
  const height = useSpring(rawHeight, { mass: 0.1, stiffness: 150, damping: 12 });
  const opacity = useSpring(rawOpacity, { mass: 0.1, stiffness: 150, damping: 12 });

  return (
    <button 
      ref={ref}
      onClick={onClick}
      className="flex items-center gap-3 py-0.5 group/item outline-none"
    >
      <span className={`
            font-sans text-xs font-normal transition-all duration-300 transform
            opacity-0 translate-x-4 group-hover:translate-x-0 group-hover:opacity-100
            ${isActive ? 'text-ink' : 'text-muted group-hover/item:text-ink'}
        `}>
            {section.label}
        </span>
        
        <motion.div 
            style={{ width, height, opacity }} 
            className={`rounded-full ${isActive ? 'bg-accent' : 'bg-muted'}`}
        />
    </button>
  );
};

const HiverExperienceRedesignCaseStudy: React.FC<HiverExperienceRedesignCaseStudyProps> = ({ onBack }) => {
  const [activeSection, setActiveSection] = useState('overview');
  const [scrollProgress, setScrollProgress] = useState(0);
  const mouseY = useMotionValue(null);
  const [previewImage, setPreviewImage] = useState<{ src: string; alt: string } | null>(null);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Define slides - each section can have multiple slides
  const slides: Slide[] = [
    { sectionId: 'overview', slideIndex: 0 },
    { sectionId: 'how-it-started', slideIndex: 0 },
    { sectionId: 'why-redesign', slideIndex: 0 },
    { sectionId: 'redesign-process', slideIndex: 0 },
    { sectionId: 'unified-interface', slideIndex: 0 },
    { sectionId: 'component-redesign', slideIndex: 0 },
    { sectionId: 'left-panel', slideIndex: 0 },
    { sectionId: 'right-panel', slideIndex: 0 },
    { sectionId: 'activity-timeline', slideIndex: 0 },
    { sectionId: 'visual-design', slideIndex: 0 },
    { sectionId: 'interaction-design', slideIndex: 0 },
  ];

  useEffect(() => {
    const handleScroll = () => {
      // Update Scroll Progress - real-time linear updates
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? scrollTop / docHeight : 0;
      setScrollProgress(Math.min(Math.max(scrollPercent, 0), 1));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.2, rootMargin: "-20% 0px -50% 0px" }
    );

    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Escape key handler to close case study (only if image preview and presentation mode are not open)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !previewImage && !isPresentationMode) {
        onBack();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBack, previewImage, isPresentationMode]);

  // Presentation mode navigation handlers
  const handlePresentationNext = () => {
    if (currentSlideIndex < slides.length - 1) {
      const nextIndex = currentSlideIndex + 1;
      setCurrentSlideIndex(nextIndex);
      const nextSlide = slides[nextIndex];
      setActiveSection(nextSlide.sectionId);
    }
  };

  const handlePresentationPrevious = () => {
    if (currentSlideIndex > 0) {
      const prevIndex = currentSlideIndex - 1;
      setCurrentSlideIndex(prevIndex);
      const prevSlide = slides[prevIndex];
      setActiveSection(prevSlide.sectionId);
    }
  };

  const handlePresentationExit = () => {
    setIsPresentationMode(false);
  };

  const handlePresentationJumpToFirst = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(0);
      const firstSlide = slides[0];
      setActiveSection(firstSlide.sectionId);
    }
  };

  const handlePresentationJumpToLast = () => {
    if (currentSlideIndex < slides.length - 1) {
      const lastIndex = slides.length - 1;
      setCurrentSlideIndex(lastIndex);
      const lastSlide = slides[lastIndex];
      setActiveSection(lastSlide.sectionId);
    }
  };

  // Sync currentSlideIndex with activeSection when in presentation mode
  useEffect(() => {
    if (isPresentationMode) {
      const slide = slides.find(s => s.sectionId === activeSection);
      if (slide) {
        const slideIndex = slides.findIndex(s => 
          s.sectionId === slide.sectionId && s.slideIndex === slide.slideIndex
        );
        if (slideIndex >= 0) {
          setCurrentSlideIndex(slideIndex);
        }
      }
    }
  }, [activeSection, isPresentationMode]);

  // Initialize presentation mode at first slide
  useEffect(() => {
    if (isPresentationMode) {
      setCurrentSlideIndex(0);
      const firstSlide = slides[0];
      if (firstSlide) {
        setActiveSection(firstSlide.sectionId);
      }
    }
  }, [isPresentationMode]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const circumference = 2 * Math.PI * 18;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="min-h-screen bg-page text-ink pb-32"
    >
      {/* --- CLOSE BUTTON (Top Left) --- */}
      {!isPresentationMode && (
        <div className="fixed top-8 left-8 z-50">
          {/* Close Button with Progress */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 25,
              mass: 0.5
            }}
            className="relative w-10 h-10 flex items-center justify-center group"
          >
            <svg className="absolute w-full h-full -rotate-90 transform pointer-events-none" viewBox="0 0 40 40">
              {/* Track */}
              <circle
                cx="20" cy="20" r="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-line transition-colors duration-300"
              />
              {/* Progress */}
              <circle
                cx="20" cy="20" r="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-accent"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - (scrollProgress * circumference)}
                strokeLinecap="round"
                style={{ transition: 'none' }}
              />
            </svg>
            <motion.div
              className="relative group"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            >
              <motion.button
                onClick={onBack}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-panel theme-switcher-container text-muted hover:text-ink transition-colors"
                aria-label="Close Case Study"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 25
                }}
              >
                <span className="material-symbols-rounded text-xl" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}>close</span>
              </motion.button>
              {/* Tooltip */}
              <motion.div
                className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 rounded text-xs text-muted bg-panel/80 backdrop-blur-sm whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-300"
                initial={{ opacity: 0 }}
              >
                esc to close
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      )}

      {/* --- PLAY BUTTON & THEME SWITCHER (Top Right) --- */}
      {!isPresentationMode && (
        <div className="fixed top-8 right-8 z-50 flex items-center gap-3">
          {/* Play Button for Presentation Mode */}
          <motion.div
            className="relative group"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1], delay: 0.1 }}
          >
            <motion.button
              onClick={() => setIsPresentationMode(true)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-panel theme-switcher-container text-muted hover:text-ink transition-colors"
              aria-label="Enter Presentation Mode"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 25
              }}
            >
              <span className="material-symbols-rounded text-xl" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}>play_arrow</span>
            </motion.button>
            {/* Tooltip */}
            <motion.div
              className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1 rounded text-xs text-muted bg-panel/80 backdrop-blur-sm whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-300"
              initial={{ opacity: 0 }}
            >
              presentation mode
            </motion.div>
          </motion.div>

          {/* Theme Switcher */}
          <ThemeSwitcher orientation="horizontal" />
        </div>
      )}

      {/* --- MAIN CONTENT --- */}
      <PresentationMode
        isActive={isPresentationMode}
        sections={sections}
        slides={slides}
        currentIndex={currentSlideIndex}
        onNext={handlePresentationNext}
        onPrevious={handlePresentationPrevious}
        onExit={handlePresentationExit}
        onJumpToFirst={handlePresentationJumpToFirst}
        onJumpToLast={handlePresentationJumpToLast}
      >
        <div className={`max-w-4xl mx-auto px-6 ${isPresentationMode ? 'pt-8 pb-8' : 'pt-24 pb-32'} flex flex-col gap-24 relative`}>
        
            {/* HERO / OVERVIEW */}
            <section id="overview" className="space-y-8">
                <h1 className="font-display font-bold text-5xl md:text-6xl leading-tight text-ink">
                    Hiver<br />Experience Redesign
                </h1>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-line">
                    <div>
                        <div className="font-sans text-sm text-muted mb-2">Platform</div>
                        <div className="font-sans text-base text-ink">Web app - live</div>
                    </div>
                    <div>
                        <div className="font-sans text-sm text-muted mb-2">My Role</div>
                        <div className="font-sans text-base text-ink">Research, concept ideation, brand identity, visual design, interaction design</div>
                    </div>
                    <div>
                        <div className="font-sans text-sm text-muted mb-2">Team</div>
                        <div className="font-sans text-base text-ink">Upendra, Sukanya Basu</div>
                    </div>
                    <div>
                        <div className="font-sans text-sm text-muted mb-2">Duration</div>
                        <div className="font-sans text-base text-ink">Feb - Mar 2019 (1.5 month)</div>
                    </div>
                </div>

                <div className="mt-12 bg-panel rounded-3xl p-8">
                    <h3 className="font-display font-bold text-3xl mb-4 text-ink">Context</h3>
                    <p className="font-sans text-base text-ink">
                        Hiver is an email management tool that and allows team inboxes to streamline their workflow. In businesses, shared mailboxes help teams by enabling them to share their responsibilities on emails (support@, info@, etc.).
                    </p>
                </div>

                {/* Hero Image */}
                <div className="mt-12 w-full rounded-2xl overflow-hidden">
                    <img 
                        src="/hiver-experience-redesign-assets/Hiver_cover_main.png" 
                        alt="Hiver Experience Redesign Cover"
                        className="w-full h-auto"
                        loading="eager"
                        style={{ 
                            imageRendering: 'auto',
                            WebkitImageRendering: 'auto',
                            maxWidth: '100%',
                            height: 'auto',
                            display: 'block'
                        }}
                    />
                </div>
            </section>

            {/* HOW IT STARTED */}
            <section id="how-it-started" className="space-y-8 scroll-mt-32">
                <div data-slide="0">
                    <div className="flex items-center gap-4">
                        <span className="h-px w-12 bg-accent"></span>
                        <h2 className="font-display font-bold text-3xl">How it all started?</h2>
                    </div>
                    
                    <p className="font-sans text-base text-ink">
                        Hiver was built from day one to blend in with the native Gmail UI, ensuring that there is minimal friction during adoption and teams can hit the ground running with zero to minimal onboarding/training.
                    </p>

                    <p className="font-sans text-base text-ink">
                        While Gmail was never an outdated product, in April 2018, Google announced a comprehensive redesign of Gmail. Gmail's redesign gave us a chance to go back to the drawing board and redesign Hiver from the ground up as well and take a step in the direction of making Hiver work better for businesses.
                    </p>
                </div>
            </section>

            {/* WHY REDESIGN */}
            <section id="why-redesign" className="space-y-8 scroll-mt-32">
                <div data-slide="0">
                    <div className="flex items-center gap-4">
                        <span className="h-px w-12 bg-accent"></span>
                        <h2 className="font-display font-bold text-3xl">Why redesign?</h2>
                    </div>
                    
                    <p className="text-muted leading-relaxed text-lg mb-6">
                        Hiver's redesign was driven by two factors:
                    </p>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-panel p-6 rounded-2xl">
                            <p className="text-muted leading-relaxed">
                                Help teams become more productive and collaborative using email.
                            </p>
                        </div>
                        <div className="bg-panel p-6 rounded-2xl">
                            <p className="text-muted leading-relaxed">
                                Help Hiver carve out a unique identity for itself within the Gmail ecosystem while delivering moments of delight to all our users.
                            </p>
                        </div>
                    </div>

                    <div className="bg-panel p-6 rounded-2xl">
                        <p className="font-sans text-base text-ink">
                            In the fewest words: Minimal — Usable — Scalable
                        </p>
                    </div>
                </div>
            </section>

            {/* REDESIGN PROCESS */}
            <section id="redesign-process" className="space-y-8 scroll-mt-32">
                <div data-slide="0">
                    <div className="flex items-center gap-4">
                        <span className="h-px w-12 bg-accent"></span>
                        <h2 className="font-display font-bold text-3xl">The Redesign Process</h2>
                    </div>
                </div>
            </section>

            {/* UNIFIED INTERFACE */}
            <section id="unified-interface" className="space-y-8 scroll-mt-32">
                <div data-slide="0">
                    <div className="flex items-center gap-4">
                        <span className="h-px w-12 bg-accent"></span>
                        <h2 className="font-display font-bold text-3xl">1. A Unified Interface</h2>
                    </div>
                    
                    <p className="font-sans text-base text-ink">
                        Since Hiver sits within Gmail, the product design team's first challenge was that we had to reflect Hiver's identity while keeping in mind Gmail's constraints.
                    </p>

                    <p className="font-sans text-base text-ink">
                        To do a full UI revamp and provide a seamless experience, we had to begin defining a new visual style. We had to revisit and rethink the colour palette, typography, icon library, and all other components. We began by creating a new and more comprehensive style guide.
                    </p>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="w-full rounded-2xl overflow-hidden cursor-pointer" onClick={() => setPreviewImage({ src: "/hiver-experience-redesign-assets/style_guide_revamp.png", alt: "Style Guide Revamp" })}>
                            <img 
                                src="/hiver-experience-redesign-assets/style_guide_revamp.png" 
                                alt="Style Guide Revamp"
                                className="w-full h-auto"
                                loading="lazy"
                                style={{ 
                                    imageRendering: 'auto',
                                    WebkitImageRendering: 'auto',
                                    maxWidth: '100%',
                                    height: 'auto',
                                    display: 'block'
                                }}
                            />
                        </div>
                        <div className="w-full rounded-2xl overflow-hidden cursor-pointer" onClick={() => setPreviewImage({ src: "/hiver-experience-redesign-assets/style_guide_revamp_2.png", alt: "Style Guide Revamp 2" })}>
                            <img 
                                src="/hiver-experience-redesign-assets/style_guide_revamp_2.png" 
                                alt="Style Guide Revamp 2"
                                className="w-full h-auto"
                                loading="lazy"
                                style={{ 
                                    imageRendering: 'auto',
                                    WebkitImageRendering: 'auto',
                                    maxWidth: '100%',
                                    height: 'auto',
                                    display: 'block'
                                }}
                            />
                        </div>
                    </div>

                    <div className="w-full rounded-2xl overflow-hidden cursor-pointer" onClick={() => setPreviewImage({ src: "/hiver-experience-redesign-assets/style_guide_breakdown.png", alt: "Style Guide Breakdown" })}>
                        <img 
                            src="/hiver-experience-redesign-assets/style_guide_breakdown.png" 
                            alt="Style Guide Breakdown"
                            className="w-full h-auto"
                            loading="lazy"
                            style={{ 
                                imageRendering: 'auto',
                                WebkitImageRendering: 'auto',
                                maxWidth: '100%',
                                height: 'auto',
                                display: 'block'
                            }}
                        />
                    </div>
                </div>
            </section>

            {/* COMPONENT REDESIGN */}
            <section id="component-redesign" className="space-y-8 scroll-mt-32">
                <div data-slide="0">
                    <div className="flex items-center gap-4">
                        <span className="h-px w-12 bg-accent"></span>
                        <h2 className="font-display font-bold text-3xl">2. Component-wise Redesign</h2>
                    </div>
                    
                    <p className="font-sans text-base text-ink">
                        Hiver is a feature-rich product. Despite that, we've always kept our interface extremely simple and minimal. Rolling out a full UI/UX revamp to all of the Hiver features might confuse our users and throw them off. We decided to begin by first shipping only the new UI with micro-interactions, and then gradually shipping other interaction changes over the next few updates. So, rest assured, we have a lot of exciting updates planned.
                    </p>
                </div>
            </section>

            {/* LEFT PANEL */}
            <section id="left-panel" className="space-y-8 scroll-mt-32">
                <div data-slide="0">
                    <div className="flex items-center gap-4">
                        <span className="h-px w-12 bg-accent"></span>
                        <h2 className="font-display font-bold text-3xl">i. The Left-Hand Side Panel</h2>
                    </div>
                    
                    <p className="font-sans text-base text-ink">
                        We've given the left-hand side panel subtle tweaks to help differentiate it from the Gmail UI, making it easier for users to access their Hiver shared inboxes.
                    </p>
                </div>
            </section>

            {/* RIGHT PANEL */}
            <section id="right-panel" className="space-y-8 scroll-mt-32">
                <div data-slide="0">
                    <div className="flex items-center gap-4">
                        <span className="h-px w-12 bg-accent"></span>
                        <h2 className="font-display font-bold text-3xl">ii. The Right-Hand Side Panel</h2>
                    </div>
                    
                    <p className="font-sans text-base text-ink">
                        The right panel is where Hiver comes into its own. The right panel is where almost all Hiver users spend most of their time delegating emails, sorting and filtering them via tags and users, viewing the activity timeline, etc. And since the primary purpose of the identity revamp was to help improve usability and make Hiver users more productive, a comprehensive redesign of the right-hand side panel was necessary.
                    </p>

                    <div>
                        <h3 className="font-display font-bold text-3xl mb-4 text-ink">Assigning emails, changing status & adding tags</h3>
                        <p className="text-muted leading-relaxed mb-6">
                            We've added an avatar in the "Assigned to" field to make it easily recognisable to the user.
                        </p>
                        <p className="text-muted leading-relaxed mb-6">
                            The panel also gets a dash of colour and new icons to give it a personality as well as help users easily distinguish between alerts and activities of different kinds.
                        </p>
                        <div className="w-full rounded-2xl overflow-hidden cursor-pointer" onClick={() => setPreviewImage({ src: "/hiver-experience-redesign-assets/right_panel.png", alt: "Right Panel" })}>
                            <img 
                                src="/hiver-experience-redesign-assets/right_panel.png" 
                                alt="Right Panel"
                                className="w-full h-auto"
                                loading="lazy"
                                style={{ 
                                    imageRendering: 'auto',
                                    WebkitImageRendering: 'auto',
                                    maxWidth: '100%',
                                    height: 'auto',
                                    display: 'block'
                                }}
                            />
                        </div>
                        <div className="w-full rounded-2xl overflow-hidden mt-6">
                            <img 
                                src="/hiver-experience-redesign-assets/right_panel_evolution.png" 
                                alt="Right Panel Evolution"
                                className="w-full h-auto"
                                loading="lazy"
                                style={{ 
                                    imageRendering: 'auto',
                                    WebkitImageRendering: 'auto',
                                    maxWidth: '100%',
                                    height: 'auto',
                                    display: 'block'
                                }}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* ACTIVITY TIMELINE */}
            <section id="activity-timeline" className="space-y-8 scroll-mt-32">
                <div data-slide="0">
                    <div className="flex items-center gap-4">
                        <span className="h-px w-12 bg-accent"></span>
                        <h2 className="font-display font-bold text-3xl">iii. The Activity Timeline</h2>
                    </div>
                    
                    <p className="font-sans text-base text-ink">
                        The most significant change of them all — We've redesigned the entire activity timeline to make it more organized, minimal as well as consumable.
                    </p>

                    <p className="font-sans text-base text-ink">
                        Activity icons are now more distinct and relevant. Why? We've redesigned our icons and infused them with colours for easy distinction and quick recall.
                    </p>

                <div className="w-full rounded-2xl overflow-hidden cursor-pointer" onClick={() => setPreviewImage({ src: "/hiver-experience-redesign-assets/activity timeline .png", alt: "Activity Timeline" })}>
                    <img 
                        src="/hiver-experience-redesign-assets/activity timeline .png" 
                        alt="Activity Timeline"
                        className="w-full h-auto"
                        loading="lazy"
                        style={{ 
                            imageRendering: 'auto',
                            WebkitImageRendering: 'auto',
                            maxWidth: '100%',
                            height: 'auto',
                            display: 'block'
                        }}
                    />
                </div>

                    <div className="bg-panel p-6 rounded-2xl">
                        <h3 className="font-display font-bold text-3xl mb-3 text-ink">A card-style UI for Notes. Why?</h3>
                        <p className="text-muted leading-relaxed">
                            The old Hiver UI did not provide a clear distinction between notes and other activities. We've attempted to differentiate notes from other activities by giving them a card-style UI. This was necessary because notes are different from other activities in the sense that they are consumed in a different way — you can reply to a note, delete it, change its colour, etc. All other activities on the Hiver timeline are informational.
                        </p>
                    </div>
                </div>
            </section>

            {/* VISUAL DESIGN */}
            <section id="visual-design" className="space-y-8 scroll-mt-32">
                <div data-slide="0">
                    <div className="flex items-center gap-4">
                        <span className="h-px w-12 bg-accent"></span>
                        <h2 className="font-display font-bold text-3xl">Visual Design</h2>
                    </div>

                    <div>
                        <h3 className="font-display font-bold text-3xl mb-4 text-ink">Explorations and Iterations</h3>
                        <div className="w-full rounded-2xl overflow-hidden cursor-pointer" onClick={() => setPreviewImage({ src: "/hiver-experience-redesign-assets/Visual_design.png", alt: "Visual Design Explorations" })}>
                            <img 
                                src="/hiver-experience-redesign-assets/Visual_design.png" 
                                alt="Visual Design Explorations"
                                className="w-full h-auto"
                                loading="lazy"
                                style={{ 
                                    imageRendering: 'auto',
                                    WebkitImageRendering: 'auto',
                                    maxWidth: '100%',
                                    height: 'auto',
                                    display: 'block'
                                }}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* INTERACTION DESIGN */}
            <section id="interaction-design" className="space-y-8 scroll-mt-32 pb-20 border-t border-line pt-12">
                <div data-slide="0">
                    <div className="flex items-center gap-4">
                        <span className="h-px w-12 bg-accent"></span>
                        <h2 className="font-display font-bold text-3xl">Interaction Design</h2>
                    </div>
                </div>
            </section>
        </div>
      </PresentationMode>

      {/* --- FIXED COMPACT TOC (Right Side) --- */}
      {!isPresentationMode && (
        <div 
          className="hidden xl:flex fixed right-8 top-1/2 -translate-y-1/2 flex-col items-end z-30 group pr-2"
          onMouseMove={(e) => {
            mouseY.set(e.clientY);
          }}
          onMouseEnter={(e) => {
            mouseY.set(e.clientY);
          }}
          onMouseLeave={() => mouseY.set(null)}
        >
           <nav className="flex flex-col items-end gap-0.5 group-hover:gap-1 transition-all duration-300">
               {sections.map(section => (
                  <TOCItem 
                      key={section.id} 
                      section={section} 
                      isActive={activeSection === section.id}
                      onClick={() => scrollTo(section.id)}
                      mouseY={mouseY}
                  />
               ))}
           </nav>
        </div>
      )}

      {/* Image Preview Modal */}
      <ImagePreview
        src={previewImage?.src || ''}
        alt={previewImage?.alt || ''}
        isOpen={!!previewImage}
        onClose={() => setPreviewImage(null)}
      />

    </motion.div>
  );
};

export default HiverExperienceRedesignCaseStudy;
