import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import ThemeSwitcher from './ThemeSwitcher';
import ImagePreview from './ImagePreview';
import PresentationMode, { Slide } from './PresentationMode';

interface IBCDesignSystemCaseStudyProps {
  onBack: () => void;
}

const sections = [
  { id: 'overview', label: 'Overview' },
  { id: 'introduction', label: 'Introduction' },
  { id: 'design-process', label: 'Design Process' },
  { id: 'colors', label: 'Colors' },
  { id: 'typography', label: 'Typography' },
  { id: 'ui-inventory', label: 'UI Inventory' },
  { id: 'tools', label: 'Tools' },
  { id: 'final-design', label: 'Final UI Design' },
  { id: 'learnings', label: 'Learnings' },
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

const IBCDesignSystemCaseStudy: React.FC<IBCDesignSystemCaseStudyProps> = ({ onBack }) => {
  const [activeSection, setActiveSection] = useState('overview');
  const [scrollProgress, setScrollProgress] = useState(0);
  const mouseY = useMotionValue(null);
  const [previewImage, setPreviewImage] = useState<{ src: string; alt: string } | null>(null);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Define slides - each section can have multiple slides
  const slides: Slide[] = [
    { sectionId: 'overview', slideIndex: 0 },
    { sectionId: 'introduction', slideIndex: 0 },
    { sectionId: 'design-process', slideIndex: 0 },
    { sectionId: 'colors', slideIndex: 0 },
    { sectionId: 'typography', slideIndex: 0 },
    { sectionId: 'ui-inventory', slideIndex: 0 },
    { sectionId: 'tools', slideIndex: 0 },
    { sectionId: 'final-design', slideIndex: 0 },
    { sectionId: 'learnings', slideIndex: 0 },
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
            <section id="overview" className="space-y-8"><div data-slide="0">
                <h1 className="font-display font-bold text-5xl md:text-6xl leading-tight text-ink">
                    iB Cricket's<br />Design System
                </h1>
                <p className="font-sans text-base text-ink max-w-3xl">
                    This case study narrates how I created a design system for iB Cricket. I'll share insights into our process, product design, the tools I used to create and implement the system.
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-line">
                    <div>
                        <div className="font-sans text-sm text-muted mb-2">Platform</div>
                        <div className="font-sans text-base text-ink">iPad & Web</div>
                    </div>
                    <div>
                        <div className="font-sans text-sm text-muted mb-2">My Role</div>
                        <div className="font-sans text-base text-ink">Solo designer</div>
                        <div className="text-sm text-muted">Research, ideation, visual design</div>
                    </div>
                    <div>
                        <div className="font-sans text-sm text-muted mb-2">Duration</div>
                        <div className="font-sans text-base text-ink">Jan 2018 (6 weeks)</div>
                    </div>
                </div>
            </div></section>

            {/* INTRODUCTION */}
            <section id="introduction" className="space-y-8 scroll-mt-32"><div data-slide="0">
                <div className="flex items-center gap-4">
                    <span className="h-px w-12 bg-accent"></span>
                    <h2 className="font-display font-bold text-3xl">Introduction</h2>
                </div>
                
                <p className="font-sans text-base text-ink">
                    iB Cricket needed a technology solution to bring together corporate and franchise owners for sales and operations support, streamline processes, and help the company stay on track while developing new franchises. Take a look at the <a href="#" className="text-accent hover:underline">franchise app case study</a> here.
                </p>

                <p className="font-sans text-base text-ink">
                    When I started this project, I realized that it's going to keep scaling with new features as iB cricket planned to introduce a few other apps for some other requirements. Considering all these needs, projections and maintaining the brand sanity across all apps we started off building the design system.
                </p>
            </div></section>

            {/* DESIGN PROCESS */}
            <section id="design-process" className="space-y-8 scroll-mt-32"><div data-slide="0">
                <div className="flex items-center gap-4">
                    <span className="h-px w-12 bg-accent"></span>
                    <h2 className="font-display font-bold text-3xl">Design Process</h2>
                </div>
                
                <div className="bg-panel p-8 rounded-2xl mb-8">
                    <p className="text-xl font-medium text-ink mb-4">
                        I believe in "Great digital products are built upon solid foundations"
                    </p>
                </div>

                <p className="font-sans text-base text-ink">
                    It was my first time working on a design system that contains more than hundreds of symbols, colors, grid systems and typography. I explored the Brad frost atomic design system principles and then took off with research in existing systems for inspiration. Design systems like Material design, Fluent, Shopify's Polaris, Atlassian, Airbnb, Salesforce Lightning Design System were all already established systems and had built great products.
                </p>

                <p className="font-sans text-base text-ink">
                    I started off by listing the UI inventory focusing on the upcoming features in the system. which are the building blocks of the design system.
                </p>
            </div></section>

            {/* COLORS */}
            <section id="colors" className="space-y-8 scroll-mt-32"><div data-slide="0">
                <div className="flex items-center gap-4">
                    <span className="h-px w-12 bg-accent"></span>
                    <h2 className="font-display font-bold text-3xl">Colours</h2>
                </div>

                <p className="font-sans text-base text-ink">
                    iB Cricket's brand material is predominantly blue, white and black. So, to maintain brand sanctity in the upcoming apps, I chose a similar palette. It's important that the design doesn't distract the user from the content, so subtlety is key. Brighter colors are used to convey meaning. Blue is used for primary actions and navigational links. Red is for warnings and alerts. Other tertiary colors are for different scenarios like avatars.
                </p>

                <div className="w-full rounded-2xl overflow-hidden cursor-pointer" onClick={() => setPreviewImage({ src: "/ibc-design-system-assets/colors.png", alt: "Color Palette" })}>
                    <img 
                        src="/ibc-design-system-assets/colors.png" 
                        alt="Color Palette"
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
            </div></section>

            {/* TYPOGRAPHY */}
            <section id="typography" className="space-y-8 scroll-mt-32"><div data-slide="0">
                <div className="flex items-center gap-4">
                    <span className="h-px w-12 bg-accent"></span>
                    <h2 className="font-display font-bold text-3xl">Typography</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="w-full rounded-2xl overflow-hidden cursor-pointer" onClick={() => setPreviewImage({ src: "/ibc-design-system-assets/Typo.png", alt: "Typography" })}>
                        <img 
                            src="/ibc-design-system-assets/Typo.png" 
                            alt="Typography"
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
                    <div className="w-full rounded-2xl overflow-hidden cursor-pointer" onClick={() => setPreviewImage({ src: "/ibc-design-system-assets/typo_naming.png", alt: "Typography Naming" })}>
                        <img 
                            src="/ibc-design-system-assets/typo_naming.png" 
                            alt="Typography Naming"
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
            </div></section>

            {/* UI INVENTORY */}
            <section id="ui-inventory" className="space-y-8 scroll-mt-32"><div data-slide="0">
                <div className="flex items-center gap-4">
                    <span className="h-px w-12 bg-accent"></span>
                    <h2 className="font-display font-bold text-3xl">UI Inventory</h2>
                </div>

                <p className="font-sans text-base text-ink">
                    After establishing the basic design elements including color palettes, typography, layout and then worked up towards more complex components such as input fields, buttons, and content cards, it allowed me to freely explore visual styles and quickly see them across multiple pages.
                </p>

                <div className="w-full rounded-2xl overflow-hidden cursor-pointer" onClick={() => setPreviewImage({ src: "/ibc-design-system-assets/Design_system.png", alt: "Design System Components" })}>
                    <img 
                        src="/ibc-design-system-assets/Design_system.png" 
                        alt="Design System Components"
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
            </div></section>

            {/* TOOLS */}
            <section id="tools" className="space-y-8 scroll-mt-32"><div data-slide="0">
                <div className="flex items-center gap-4">
                    <span className="h-px w-12 bg-accent"></span>
                    <h2 className="font-display font-bold text-3xl">Tools</h2>
                </div>

                <p className="font-sans text-base text-ink">
                    Sketch was used to build the design system. Component prototypes were built in Adobe xd and Invision app. I used Abstract to version control the design system as well as our actual project files.
                </p>

                <div className="w-full rounded-2xl overflow-hidden cursor-pointer" onClick={() => setPreviewImage({ src: "/ibc-design-system-assets/tools.png", alt: "Design Tools" })}>
                    <img 
                        src="/ibc-design-system-assets/tools.png" 
                        alt="Design Tools"
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
            </div></section>

            {/* FINAL UI DESIGN */}
            <section id="final-design" className="space-y-8 scroll-mt-32"><div data-slide="0">
                <div className="flex items-center gap-4">
                    <span className="h-px w-12 bg-accent"></span>
                    <h2 className="font-display font-bold text-3xl">Final UI Design</h2>
                </div>

                <div className="w-full rounded-2xl overflow-hidden cursor-pointer" onClick={() => setPreviewImage({ src: "/ibc-design-system-assets/Visual_design.png", alt: "Final UI Design" })}>
                    <img 
                        src="/ibc-design-system-assets/Visual_design.png" 
                        alt="Final UI Design"
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

                <div className="w-full rounded-2xl overflow-hidden cursor-pointer" onClick={() => setPreviewImage({ src: "/ibc-design-system-assets/eb22ff_c45d15becfa7426a8170f055b67f5b30~mv2.png", alt: "Design System Overview" })}>
                    <img 
                        src="/ibc-design-system-assets/eb22ff_c45d15becfa7426a8170f055b67f5b30~mv2.png" 
                        alt="Design System Overview"
                        className="w-full h-auto"
                        loading="lazy"
                        style={{ 
                            imageRendering: 'auto',
                            WebkitImageRendering: 'auto',
                            maxWidth: '100%',
                            height: 'auto',
                            display: 'block'
                        }}
                        onError={(e) => {
                            console.error('Image failed to load:', e.currentTarget.src);
                        }}
                    />
                </div>
            </div></section>

            {/* LEARNINGS */}
            <section id="learnings" className="space-y-12 scroll-mt-32 pb-20 border-t border-line pt-12"><div data-slide="0">
                <div className="flex items-center gap-4">
                    <span className="h-px w-12 bg-accent"></span>
                    <h2 className="font-display font-bold text-3xl">Learnings</h2>
                </div>

                <p className="font-sans text-base text-ink">
                    When you want to build a Design system that is easily scalable and reflects updates across the system, you should work on all nitty-gritty things that actually matter.
                </p>

                <div className="space-y-12">
                    <div>
                        <h3 className="font-display font-bold text-3xl mb-4 text-ink">Be organized</h3>
                        <p className="text-muted leading-relaxed mb-6">
                            Distribute the components into different pages, it will be easier for navigating between the component. More it is organized, more easier to design and modify.
                        </p>
                        <div className="w-full rounded-2xl overflow-hidden cursor-pointer" onClick={() => setPreviewImage({ src: "/ibc-design-system-assets/organize.png", alt: "Organization" })}>
                            <img 
                                src="/ibc-design-system-assets/organize.png" 
                                alt="Organization"
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

                    <div>
                        <h3 className="font-display font-bold text-3xl mb-4 text-ink">Defining the layers</h3>
                        <p className="text-muted leading-relaxed mb-6">
                            For example, if a color has to be updated in the system and it should be reflected across all the components, then that layer must be defined as a layer style.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-display font-bold text-3xl mb-4 text-ink">Naming is hard</h3>
                        <p className="text-muted leading-relaxed mb-6">
                            Yes, It's slightly complex. Because there will be hundreds of layers, icons, typos and other components in the system. The naming scheme should be very straightforward and simple. That'll make it easier for the other designers to navigate and apply.
                        </p>
                        <div className="bg-panel p-6 rounded-2xl">
                            <p className="text-sm text-muted leading-relaxed">
                                <span className="font-semibold text-ink">Tip:</span> You can name the layers based on where you're using them. For example, if you're using a layer for a button background, the layer name could be Buttons/blue/active. Ideally, the structure is &lt;Component&gt;/&lt;Color&gt;/&lt;State of the component&gt;. It's easy to build & use and is scalable.
                            </p>
                        </div>
                        <div className="w-full rounded-2xl overflow-hidden mt-6">
                            <img 
                                src="/ibc-design-system-assets/component_naming.png" 
                                alt="Component Naming"
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

                    <div>
                        <h3 className="font-display font-bold text-3xl mb-4 text-ink">Nesting the elements</h3>
                        <p className="text-muted leading-relaxed">
                            As I mentioned earlier, there will be hundreds of layers. Nested layers are really helpful in navigating to the desired styles. Just like symbols, text and layer styles can be nested using a forward slash in their name, which lets you organise your styles nicely in a hierarchical structure.
                        </p>
                    </div>
                </div>

                <div className="w-full rounded-2xl overflow-hidden mt-8">
                    <img 
                        src="/ibc-design-system-assets/design_system_steps_2.png" 
                        alt="Design System Steps"
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
            </div></section>
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

export default IBCDesignSystemCaseStudy;
