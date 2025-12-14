import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import ThemeSwitcher from './ThemeSwitcher';
import ImagePreview from './ImagePreview';
import PresentationMode, { Slide } from './PresentationMode';

interface IBCFranchiseCaseStudyProps {
  onBack: () => void;
}

const sections = [
  { id: 'overview', label: 'Overview' },
  { id: 'problem', label: 'Problem' },
  { id: 'design-process', label: 'Design Process' },
  { id: 'research', label: 'Research' },
  { id: 'information-architecture', label: 'Information Architecture' },
  { id: 'wireframes', label: 'Wireframes' },
  { id: 'design-system', label: 'Design System' },
  { id: 'final-design', label: 'Final Design' },
  { id: 'outcome', label: 'Outcome' },
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

const IBCFranchiseCaseStudy: React.FC<IBCFranchiseCaseStudyProps> = ({ onBack }) => {
  const [activeSection, setActiveSection] = useState('overview');
  const [scrollProgress, setScrollProgress] = useState(0);
  const mouseY = useMotionValue(null);
  const [previewImage, setPreviewImage] = useState<{ src: string; alt: string } | null>(null);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Define slides - each section can have multiple slides
  const slides: Slide[] = [
    { sectionId: 'overview', slideIndex: 0 },
    { sectionId: 'problem', slideIndex: 0 },
    { sectionId: 'design-process', slideIndex: 0 },
    { sectionId: 'research', slideIndex: 0 },
    { sectionId: 'information-architecture', slideIndex: 0 },
    { sectionId: 'wireframes', slideIndex: 0 },
    { sectionId: 'design-system', slideIndex: 0 },
    { sectionId: 'final-design', slideIndex: 0 },
    { sectionId: 'outcome', slideIndex: 0 },
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
                    End-to-end experience design for<br />iB Cricket's franchise management system
                </h1>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-line">
                    <div>
                        <div className="font-sans text-sm text-muted mb-2">Platform</div>
                        <div className="font-sans text-base text-ink">iPad - B2B</div>
                    </div>
                    <div>
                        <div className="font-sans text-sm text-muted mb-2">My Role</div>
                        <div className="font-sans text-base text-ink">Solo designer</div>
                        <div className="text-sm text-muted">user research, concept ideation, interaction design, visual design, prototyping</div>
                    </div>
                    <div>
                        <div className="font-sans text-sm text-muted mb-2">Duration</div>
                        <div className="font-sans text-base text-ink">Jan - Mar 2018 (10 weeks)</div>
                    </div>
                </div>

                <div className="mt-12 bg-panel rounded-3xl p-8">
                    <h3 className="font-bold text-lg mb-4">Context</h3>
                    <p className="text-muted leading-relaxed">
                        iB Cricket is available to play for people in the franchises and they needed a technology solution to provide support to its franchisees and improve processes.
                    </p>
                </div>
            </div></section>

            {/* PROBLEM */}
            <section id="problem" className="space-y-8 scroll-mt-32"><div data-slide="0">
                <div className="flex items-center gap-4">
                    <span className="h-px w-12 bg-accent"></span>
                    <h2 className="font-display font-bold text-3xl">Problem Statement</h2>
                </div>
                
                <p className="font-sans text-base text-ink">
                    Overseeing the growth of a business is no easy task. The franchise owners/managers are in the administrative position of needing a way to cope with the growing demand for their business. They have had to track and regulate the ongoing activities at the franchise from remote areas to ease the business flow.
                </p>

                <div className="bg-red-500/5 p-8 rounded-2xl">
                    <p className="text-lg font-medium leading-relaxed text-ink/90 mb-4">
                        They needed a technology solution to bring together corporate and franchise owners for sales and operations support, streamline processes, and help the company stay on track while developing new franchises.
                    </p>
                    <ul className="space-y-3 text-muted">
                        <li className="flex items-start gap-3">
                            <span className="text-accent mt-1">•</span>
                            <span>Eliminate manual tracking of franchise information.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-accent mt-1">•</span>
                            <span>A central location for franchisees to access important business information like tracking & updating the franchise revenues, slot bookings & rentals, tracking compliances.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-accent mt-1">•</span>
                            <span>A unified franchise information system in tracking of store inventory, crew attendance, quality management so they can stay on top of compliance and historical records.</span>
                        </li>
                    </ul>
                </div>
            </div></section>

            {/* DESIGN PROCESS */}
            <section id="design-process" className="space-y-8 scroll-mt-32"><div data-slide="0">
                <div className="flex items-center gap-4">
                    <span className="h-px w-12 bg-accent"></span>
                    <h2 className="font-display font-bold text-3xl">The Design Process</h2>
                </div>

                <p className="font-sans text-base text-ink">
                    This is how it all started
                </p>

                <div className="w-full rounded-2xl overflow-hidden cursor-pointer" onClick={() => setPreviewImage({ src: "/ibc-franchise-assets/process.png", alt: "Design Process" })}>
                    <img 
                        src="/ibc-franchise-assets/process.png" 
                        alt="Design Process"
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

            {/* RESEARCH */}
            <section id="research" className="space-y-12 scroll-mt-32"><div data-slide="0">
                <div className="flex items-center gap-4">
                    <span className="h-px w-12 bg-accent"></span>
                    <h2 className="font-display font-bold text-3xl">Research</h2>
                </div>

                <p className="font-sans text-base text-ink">
                    The first step was to investigate the people involved with Franchise Management. How is their work day like? What are their challenges? What motivates them? How can we help make their work day better?
                </p>

                <p className="font-sans text-base text-ink">
                    Interviewed 6 people which could help me to understand the user. They are from 27-50 years old, both living alone or having their own family. There are mainly 4 aspects I want to know about the users:
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-panel p-6 rounded-2xl">
                        <div className="font-semibold text-ink mb-2">What kind of lifestyle they have?</div>
                    </div>
                    <div className="bg-panel p-6 rounded-2xl">
                        <div className="font-semibold text-ink mb-2">What do they think about franchise business?</div>
                    </div>
                    <div className="bg-panel p-6 rounded-2xl">
                        <div className="font-semibold text-ink mb-2">Are they fancy on new technology?</div>
                    </div>
                    <div className="bg-panel p-6 rounded-2xl">
                        <div className="font-semibold text-ink mb-2">What incentive would attract them to use the app?</div>
                    </div>
                </div>

                <p className="font-sans text-base text-ink">
                    After interviews and observation, I created a primary persona and figured out what kind of users would use the app and how they would use it. It helped me to develop the experience strategy.
                </p>

                <p className="font-sans text-base text-ink">
                    Eventually I developed something of an impression of them:
                </p>

                <div className="w-full rounded-2xl overflow-hidden cursor-pointer" onClick={() => setPreviewImage({ src: "/ibc-franchise-assets/eb22ff_1422d86bd8134c04803cb169e01c4cff~mv2_d_2048_1200_s_2.jpg", alt: "User Persona" })}>
                    <img 
                        src="/ibc-franchise-assets/eb22ff_1422d86bd8134c04803cb169e01c4cff~mv2_d_2048_1200_s_2.jpg" 
                        alt="User Persona"
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

            {/* INFORMATION ARCHITECTURE */}
            <section id="information-architecture" className="space-y-8 scroll-mt-32"><div data-slide="0">
                <div className="flex items-center gap-4">
                    <span className="h-px w-12 bg-accent"></span>
                    <h2 className="font-display font-bold text-3xl">How I organized ideas into actionable features within limited time</h2>
                </div>

                <p className="font-sans text-base text-ink">
                    This map outlines all the features, content and structure of the app. Center management, revenue summary, support, VR games, slots & rentals, offers and players are the key features. It helped me understand the scope of the project as well as the priority of feature needed in terms of communicating my vision. I was able to quickly decide on the key user flows.
                </p>

                <div className="w-full rounded-2xl overflow-hidden cursor-pointer" onClick={() => setPreviewImage({ src: "/ibc-franchise-assets/information_architecture.png", alt: "Information Architecture" })}>
                    <img 
                        src="/ibc-franchise-assets/information_architecture.png" 
                        alt="Information Architecture"
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
                    <p className="text-ink font-semibold text-lg">
                        A solid blue print
                    </p>
                </div>
            </div></section>

            {/* WIREFRAMES */}
            <section id="wireframes" className="space-y-8 scroll-mt-32"><div data-slide="0">
                <div className="flex items-center gap-4">
                    <span className="h-px w-12 bg-accent"></span>
                    <h2 className="font-display font-bold text-3xl">Wireframes</h2>
                </div>

                <p className="font-sans text-base text-ink">
                    I created detailed wireframe designs of key pages. Helped business & strategy teams to work on the prioritizations and to make accurate decisions.
                </p>

                <div className="w-full rounded-2xl overflow-hidden cursor-pointer" onClick={() => setPreviewImage({ src: "/ibc-franchise-assets/eb22ff_54aca49c2fbd49c19e936d4f90274f85~mv2_d_2048_1200_s_2.jpg", alt: "Wireframes" })}>
                    <img 
                        src="/ibc-franchise-assets/eb22ff_54aca49c2fbd49c19e936d4f90274f85~mv2_d_2048_1200_s_2.jpg" 
                        alt="Wireframes"
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

            {/* DESIGN SYSTEM */}
            <section id="design-system" className="space-y-8 scroll-mt-32"><div data-slide="0">
                <div className="flex items-center gap-4">
                    <span className="h-px w-12 bg-accent"></span>
                    <h2 className="font-display font-bold text-3xl">Building the Design System</h2>
                </div>

                <div className="bg-panel p-8 rounded-2xl mb-8">
                    <p className="text-xl font-medium text-ink mb-4">
                        I believe in "Great digital products are built upon solid foundations"
                    </p>
                </div>

                <p className="font-sans text-base text-ink">
                    When we started this project, we realised that it's gonna be keep on scaling with new features. iB Cricket planned to introduce a few other apps for some other requirements. Considering all these needs, projections and to maintain the brand sanity across all apps we started off building the design system.
                </p>

                <p className="font-sans text-base text-ink">
                    Design system itself a huge project to work. It was my first time working on a design system that contains more than hundreds of symbols, colours, grid systems and typography.
                </p>

                <p className="font-sans text-base text-ink">
                    I took off with existing research and looking at inspiration. Design systems like Material design, Fluent, Shopify Polaris, Atlassian, AirBnB, Salesforce Lightning Design System were already established and built solid & great products.
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="w-full rounded-2xl overflow-hidden cursor-pointer" onClick={() => setPreviewImage({ src: "/ibc-franchise-assets/Design_system.png", alt: "Design System" })}>
                        <img 
                            src="/ibc-franchise-assets/Design_system.png" 
                            alt="Design System"
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
                    <div className="w-full rounded-2xl overflow-hidden cursor-pointer" onClick={() => setPreviewImage({ src: "/ibc-franchise-assets/design_system_steps.png", alt: "Design System Steps" })}>
                        <img 
                            src="/ibc-franchise-assets/design_system_steps.png" 
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
                </div>
            </div></section>

            {/* FINAL DESIGN */}
            <section id="final-design" className="space-y-8 scroll-mt-32"><div data-slide="0">
                <div className="flex items-center gap-4">
                    <span className="h-px w-12 bg-accent"></span>
                    <h2 className="font-display font-bold text-3xl">High Fidelity Mockups</h2>
                </div>

                <p className="font-sans text-base text-ink">
                    High fidelity mockups and many more...
                </p>

                <div className="w-full rounded-2xl overflow-hidden cursor-pointer" onClick={() => setPreviewImage({ src: "/ibc-franchise-assets/Visual_design.png", alt: "Visual Design" })}>
                    <img 
                        src="/ibc-franchise-assets/Visual_design.png" 
                        alt="Visual Design"
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

                <div>
                    <h3 className="font-display font-bold text-3xl mb-4 text-ink">Prototypes</h3>
                    <p className="text-muted leading-relaxed mb-6">
                        Revenue transactions of a franchise
                    </p>
                    <div className="w-full rounded-2xl overflow-hidden cursor-pointer" onClick={() => setPreviewImage({ src: "/ibc-franchise-assets/eb22ff_4b0f91e3be0c47e29827243e8a1dcde8~mv2_d_4320_2040_s_2.png", alt: "Prototypes" })}>
                        <img 
                            src="/ibc-franchise-assets/eb22ff_4b0f91e3be0c47e29827243e8a1dcde8~mv2_d_4320_2040_s_2.png" 
                            alt="Prototypes"
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

            {/* OUTCOME */}
            <section id="outcome" className="space-y-8 scroll-mt-32 pb-20 border-t border-line pt-12"><div data-slide="0">
                <div className="flex items-center gap-4">
                    <span className="h-px w-12 bg-accent"></span>
                    <h2 className="font-display font-bold text-3xl">Outcome</h2>
                </div>

                <p className="font-sans text-base text-ink">
                    It was really an exciting project for me to work on as it provides real value, involved a ton of research, and detailed interaction work. I learned a lot of things while building the design system and some important takeaways from this project related to product and business processes.
                </p>

                <div className="w-full rounded-2xl overflow-hidden cursor-pointer" onClick={() => setPreviewImage({ src: "/ibc-franchise-assets/eb22ff_f07c5522ebef4a8a8ccbf7de2d3f199f~mv2_d_4320_2040_s_2.png", alt: "Final Outcome" })}>
                    <img 
                        src="/ibc-franchise-assets/eb22ff_f07c5522ebef4a8a8ccbf7de2d3f199f~mv2_d_4320_2040_s_2.png" 
                        alt="Final Outcome"
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

export default IBCFranchiseCaseStudy;
