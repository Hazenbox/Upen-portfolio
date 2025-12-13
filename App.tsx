import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FloatingNav from './components/FloatingNav';
import AIChatWidget from './components/AIChatWidget';
import ThemeSwitcher from './components/ThemeSwitcher';
import HiverCaseStudy from './components/HiverCaseStudy';
import AgentClientConnectionsCaseStudy from './components/AgentClientConnectionsCaseStudy';
import HiverExperienceRedesignCaseStudy from './components/HiverExperienceRedesignCaseStudy';
import IBCFranchiseCaseStudy from './components/IBCFranchiseCaseStudy';
import IBCDesignSystemCaseStudy from './components/IBCDesignSystemCaseStudy';
import { Project, Experience, Testimonial, Theme } from './types';

// Extend Window interface for Unicorn Studio
declare global {
  interface Window {
    UnicornStudio?: {
      isInitialized: boolean;
      init?: () => void;
    };
  }
}

// --- MOCK DATA ---
const projects: Project[] = [
  {
    id: 5,
    title: "Hiver Analytics",
    category: "Case Study",
    description: "End-to-end design of a helpdesk analytics suite inside Gmail. Driven by data, user research, and complex system design.",
    image: "https://picsum.photos/800/600?random=5",
    link: "hiver-analytics"
  },
  {
    id: 8,
    title: "Agent-Client Connections",
    category: "Case Study",
    description: "End-to-end design of agent-client connection features across iOS, Web, and Android at Compass, enabling agents to build stronger relationships through branded experiences and activity tracking.",
    image: "https://picsum.photos/800/600?random=8",
    link: "agent-client-connections"
  },
  {
    id: 9,
    title: "Hiver Experience Redesign",
    category: "Case Study",
    description: "Complete UI/UX redesign of Hiver's email management tool to align with Gmail's new design while establishing Hiver's unique identity within the Gmail ecosystem.",
    image: "https://picsum.photos/800/600?random=9",
    link: "hiver-experience-redesign"
  },
  {
    id: 10,
    title: "iBC Franchise Management",
    category: "Case Study",
    description: "End-to-end experience design for iB Cricket's franchise management system, enabling franchise owners to track operations, revenue, and compliance from remote locations.",
    image: "https://picsum.photos/800/600?random=10",
    link: "ibc-franchise"
  },
  {
    id: 11,
    title: "iBC Design System",
    category: "Case Study",
    description: "Created a comprehensive design system for iB Cricket with hundreds of symbols, colors, grid systems, and typography to maintain brand consistency across multiple apps.",
    image: "https://picsum.photos/800/600?random=11",
    link: "ibc-design-system"
  }
];

// Side Projects / Labs
const labs = [
  {
    id: 101,
    title: "React Canvas",
    description: "Generative art study.",
    image: "https://picsum.photos/200/200?random=10"
  },
  {
    id: 102,
    title: "Type Scale",
    description: "Typography tool.",
    image: "https://picsum.photos/200/200?random=11"
  },
  {
    id: 103,
    title: "Dark Mode",
    description: "Theme switcher.",
    image: "https://picsum.photos/200/200?random=12"
  },
  {
    id: 104,
    title: "Icon Set",
    description: "Open source icons.",
    image: "https://picsum.photos/200/200?random=13"
  },
  {
    id: 105,
    title: "Motion Lib",
    description: "Animation presets.",
    image: "https://picsum.photos/200/200?random=14"
  },
  {
    id: 106,
    title: "Color Gen",
    description: "Palette generator.",
    image: "https://picsum.photos/200/200?random=15"
  }
];

// Updated Experience Data from Resume
const experience: (Experience & { color: string, tag: string })[] = [
  {
    id: 1,
    role: "Design Lead",
    company: "Jio",
    period: "Feb 2023 — Present",
    description: "",
    color: "bg-blue-500",
    tag: "Design Systems",
    points: [
      "Led design of Jio’s design system management tool, optimizing scalability, workflow integration, and documentation efficiency utilised across Jio products.",
      "Designed Layers, a Figma plugin enabling designers to apply DS components and tokens while allowing developers to generate UI code seamlessly.",
      "Prototyped an AI-driven UI builder leveraging vibe coding to explore intelligent design-dev workflows.",
      "Developed the onboarding strategy, governance model, and GTM playbooks for scaling Layers + DS v3.0 adoption across Jio.",
      "Led design of Jio’s design system documentation platform, improving scalability, workflow integration, and adoption across Jio’s portfolio products."
    ]
  },
  {
    id: 2,
    role: "Senior Product Designer",
    company: "Compass",
    period: "Jul 2020 — Jan 2023",
    description: "",
    color: "bg-gray-800",
    tag: "Growth & Search",
    points: [
      "Designed the ‘Find an Agent’ experience with advanced search and profile features, driving a 50% increase in monthly users within six months.",
      "Designed end-to-end Agent-Client Connections across iOS, Web, and Android, boosting monthly invite send rates by 64%.",
      "Strategically Led the Lead Validation Program with research and A/B testing, increasing agent action rate from 40% to 72%.",
      "Supported design hiring by conducting portfolio reviews and leading white boarding sessions."
    ]
  },
  {
    id: 3,
    role: "Product Designer",
    company: "Hiver",
    period: "Feb 2019 — Jun 2020",
    description: "",
    color: "bg-yellow-500",
    tag: "SaaS Analytics",
    points: [
      "Led end-to-end design of the Reports module from research and high-fidelity design to prototyping and usability testing - driving 60% Analytics adoption within 6 months.",
      "Redesigned the product with a new brand identity and design system, featuring updated visuals, iconography, motion design, and WCAG AA-compliant accessibility."
    ]
  },
  {
    id: 4,
    role: "UX Designer",
    company: "iB Hubs",
    period: "Jun 2016 — Dec 2018",
    description: "",
    color: "bg-red-500",
    tag: "Multi-Product",
    points: [
      "Designed 10+ products across iOS, Android, and Web in diverse sectors, while building a unified design system, brand guidelines, and marketing sites."
    ]
  }
];

const testimonials: Testimonial[] = [
  {
    id: 1,
    text: "Alex has a unique ability to blend retro nostalgia with cutting-edge usability patterns. A joy to work with.",
    author: "Sarah Connor",
    position: "VP of Product"
  },
  {
    id: 2,
    text: "The speed and quality of delivery was unmatched. The design system he built saved us months of dev time.",
    author: "John Matrix",
    position: "CTO @ Commando"
  },
  {
    id: 3,
    text: "He doesn't just design interfaces; he designs systems that scale. His work on our component library was foundational.",
    author: "Elena Fisher",
    position: "Head of Design"
  },
  {
    id: 4,
    text: "A rare breed of designer who understands the code as well as the canvas. Bridging the gap has never been easier.",
    author: "Nathan Drake",
    position: "Lead Engineer"
  }
];

const ExperienceCard: React.FC<{ job: typeof experience[0] }> = ({ job }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      layout
      onClick={() => setIsExpanded(!isExpanded)}
      className="group relative bg-panel rounded-xl p-5 cursor-pointer overflow-hidden flex gap-4 transition-colors hover:bg-panel/80"
    >
      {/* Dot aligned with designation */}
      <div className={`w-2 h-2 rounded-full ${job.color} shrink-0 mt-2 opacity-70`} />
      
      <div className="flex flex-col w-full">
        <div className="flex justify-between items-start">
            <div>
                <h4 className="font-sans font-medium text-base text-ink leading-tight">{job.role}</h4>
                <div className="text-sm font-normal text-ink/80 mt-1">{job.company}</div>
            </div>
            
            {/* Tenure relocated to right side */}
            <div className="text-xs font-normal text-muted uppercase tracking-wide opacity-70 whitespace-nowrap ml-4 mt-0.5">
                {job.period}
            </div>
        </div>
        
        {/* Description - Hidden when collapsed */}
        <AnimatePresence>
            {isExpanded && (
                <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="text-muted text-sm font-normal leading-relaxed overflow-hidden"
                >
                     {job.points && (
                        <ul className="list-disc ml-4 space-y-2 marker:text-muted/50">
                            {job.points.map((point, idx) => (
                              <li key={idx}>{point}</li>
                            ))}
                        </ul>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'case-study'>('home');
  const [activeSection, setActiveSection] = useState('work');
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [emailCopied, setEmailCopied] = useState(false);
  const [headerEmailCopied, setHeaderEmailCopied] = useState(false);
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    // Load initial theme
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
        setTheme(savedTheme);
    }

    // Listen for theme changes (previews and commits)
    const handleThemeChange = (e: CustomEvent) => {
        if (e.detail?.theme) {
            setTheme(e.detail.theme);
        }
    };
    
    window.addEventListener('theme-change', handleThemeChange as EventListener);
    return () => window.removeEventListener('theme-change', handleThemeChange as EventListener);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setActiveSection(sectionId);
  };

  const copyEmail = () => {
    navigator.clipboard.writeText('upendra.uxr@gmail.com');
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 2000);
  };

  const copyEmailHeader = () => {
    navigator.clipboard.writeText('upendra.uxr@gmail.com');
    setHeaderEmailCopied(true);
    setTimeout(() => setHeaderEmailCopied(false), 2000);
  };

  const [caseStudyType, setCaseStudyType] = useState<'hiver' | 'agent-client' | 'hiver-experience' | 'ibc-franchise' | 'ibc-design-system' | null>(null);

  const handleProjectClick = (project: Project) => {
    if (project.link === 'hiver-analytics') {
      setCaseStudyType('hiver');
      setView('case-study');
      window.scrollTo({ top: 0, behavior: 'instant' });
    } else if (project.link === 'agent-client-connections') {
      setCaseStudyType('agent-client');
      setView('case-study');
      window.scrollTo({ top: 0, behavior: 'instant' });
    } else if (project.link === 'hiver-experience-redesign') {
      setCaseStudyType('hiver-experience');
      setView('case-study');
      window.scrollTo({ top: 0, behavior: 'instant' });
    } else if (project.link === 'ibc-franchise') {
      setCaseStudyType('ibc-franchise');
      setView('case-study');
      window.scrollTo({ top: 0, behavior: 'instant' });
    } else if (project.link === 'ibc-design-system') {
      setCaseStudyType('ibc-design-system');
      setView('case-study');
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  // Intersection Observer to update active section on scroll
  useEffect(() => {
    if (view !== 'home') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3 }
    );

    const sections = ['work', 'experience', 'contact'];
    sections.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [view]);

  // Track mouse position for floating image
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Hide Unicorn Studio badges and watermarks globally
  useEffect(() => {
    const hideBadge = () => {
      // Find all Unicorn Studio containers
      const containers = document.querySelectorAll('[data-us-project]');
      containers.forEach(container => {
        // Find and hide any links or badges
        const links = container.querySelectorAll('a');
        links.forEach(link => {
          const href = link.getAttribute('href') || '';
          const text = link.textContent || '';
          if (href.includes('unicorn.studio') || 
              href.includes('unicornstudio') || 
              text.includes('Made with') || 
              text.includes('unicorn.studio')) {
            link.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important; height: 0 !important; width: 0 !important; overflow: hidden !important;';
            link.remove();
          }
        });

        // Hide any elements containing badge text
        const allElements = container.querySelectorAll('*');
        allElements.forEach(el => {
          const text = el.textContent || '';
          if (text.includes('Made with') || text.includes('unicorn.studio')) {
            el.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important;';
            el.remove();
          }

          // Detect and remove center watermarks
          const style = window.getComputedStyle(el);
          const elStyle = (el as HTMLElement).style;
          const position = style.position;
          const top = style.top;
          const left = style.left;
          const transform = style.transform;
          const className = el.className || '';
          const id = el.id || '';

          // Check if element is centered (watermark pattern)
          const isCentered = (
            (position === 'absolute' || position === 'fixed') &&
            (top.includes('50%') || left.includes('50%') || transform.includes('translate(-50%') || transform.includes('translate(-50%'))
          );

          // Check for watermark indicators
          const isWatermark = (
            className.toLowerCase().includes('watermark') ||
            className.toLowerCase().includes('badge') ||
            className.toLowerCase().includes('credit') ||
            id.toLowerCase().includes('watermark') ||
            id.toLowerCase().includes('badge') ||
            id.toLowerCase().includes('credit') ||
            isCentered
          );

          // If it's a small centered element (likely watermark), hide it
          if (isWatermark && (el as HTMLElement).offsetWidth < 200 && (el as HTMLElement).offsetHeight < 200) {
            el.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important; height: 0 !important; width: 0 !important; overflow: hidden !important; position: absolute !important; left: -9999px !important; top: -9999px !important;';
            // Don't remove immediately, just hide - sometimes they recreate
          }

          // Hide canvas overlays that might be watermarks
          if (el.tagName === 'CANVAS' && isCentered) {
            const canvas = el as HTMLCanvasElement;
            if (canvas.width < 300 && canvas.height < 300) {
              // Small centered canvas - likely watermark
              el.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important;';
            }
          }

          // Hide SVG watermarks
          if (el.tagName === 'SVG' && isCentered) {
            const svg = el as SVGElement;
            const bbox = svg.getBBox();
            if (bbox.width < 200 && bbox.height < 200) {
              el.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important;';
            }
          }

          // Hide image watermarks
          if (el.tagName === 'IMG' && isCentered) {
            const img = el as HTMLImageElement;
            if (img.width < 200 && img.height < 200) {
              el.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important;';
            }
          }
        });
      });
    };

    // More aggressive watermark removal
    const removeWatermarks = () => {
      const containers = document.querySelectorAll('[data-us-project]');
      containers.forEach(container => {
        // Find all absolutely positioned elements inside
        const allElements = container.querySelectorAll('*');
        allElements.forEach((el: Element) => {
          const htmlEl = el as HTMLElement;
          const rect = htmlEl.getBoundingClientRect();
          const containerRect = (container as HTMLElement).getBoundingClientRect();
          
          // Calculate if element is in center (within 30% of center)
          const centerX = containerRect.left + containerRect.width / 2;
          const centerY = containerRect.top + containerRect.height / 2;
          const elCenterX = rect.left + rect.width / 2;
          const elCenterY = rect.top + rect.height / 2;
          
          const distFromCenter = Math.sqrt(
            Math.pow(elCenterX - centerX, 2) + Math.pow(elCenterY - centerY, 2)
          );
          const maxDist = Math.min(containerRect.width, containerRect.height) * 0.3;
          
          // If small element near center, hide it
          if (distFromCenter < maxDist && rect.width < 150 && rect.height < 150) {
            const style = window.getComputedStyle(htmlEl);
            // Only hide if it's not the main canvas
            if (htmlEl.tagName !== 'CANVAS' || (rect.width < 100 && rect.height < 100)) {
              htmlEl.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important; height: 0 !important; width: 0 !important; overflow: hidden !important; position: absolute !important; left: -9999px !important; top: -9999px !important;';
            }
          }
        });
      });
    };

    // Watch for new Unicorn Studio elements
    const observer = new MutationObserver(() => {
      hideBadge();
      removeWatermarks();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });

    // Initial cleanup - run multiple times
    hideBadge();
    removeWatermarks();
    setTimeout(() => { hideBadge(); removeWatermarks(); }, 100);
    setTimeout(() => { hideBadge(); removeWatermarks(); }, 500);
    setTimeout(() => { hideBadge(); removeWatermarks(); }, 1000);
    setTimeout(() => { hideBadge(); removeWatermarks(); }, 2000);
    setTimeout(() => { hideBadge(); removeWatermarks(); }, 3000);
    setTimeout(() => { hideBadge(); removeWatermarks(); }, 5000);

    // Continuous monitoring
    const interval = setInterval(() => {
      hideBadge();
      removeWatermarks();
    }, 1000);

    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);

  return (
    <div className={`theme-${theme} w-full min-h-screen bg-page text-ink font-sans selection:bg-accent selection:text-white transition-colors duration-500`}>
      
      {/* Noise Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-50 bg-noise bg-repeat mix-blend-overlay"></div>

      {/* Preload Images for No Delay Hover */}
      <div className="hidden">
        {projects.map((p) => (
          <img key={p.id} src={p.image} alt="preload" />
        ))}
      </div>

      {/* Floating Cursor Image */}
      <div 
        className="fixed pointer-events-none z-50 hidden md:block"
        style={{ 
          left: cursorPos.x, 
          top: cursorPos.y,
          transform: 'translate(20px, 20px)',
          opacity: hoveredImage ? 1 : 0
        }}
      >
        {hoveredImage && (
          <img 
            src={hoveredImage} 
            alt="Project Preview" 
            className="w-80 h-60 object-cover rounded-lg shadow-2xl border border-line"
          />
        )}
      </div>

      {/* Fixed Top-Right Theme Switcher (Desktop) - Always Visible */}
      <div className="hidden md:flex fixed right-8 top-8 z-50 flex-col items-end">
        <ThemeSwitcher orientation="horizontal" />
      </div>

      {/* View Switching Logic */}
      <AnimatePresence mode="wait">
        {view === 'case-study' && caseStudyType === 'hiver' ? (
           <HiverCaseStudy key="hiver-case-study" onBack={() => { setView('home'); setCaseStudyType(null); }} />
        ) : view === 'case-study' && caseStudyType === 'agent-client' ? (
           <AgentClientConnectionsCaseStudy key="agent-client-case-study" onBack={() => { setView('home'); setCaseStudyType(null); }} />
        ) : view === 'case-study' && caseStudyType === 'hiver-experience' ? (
           <HiverExperienceRedesignCaseStudy key="hiver-experience-case-study" onBack={() => { setView('home'); setCaseStudyType(null); }} />
        ) : view === 'case-study' && caseStudyType === 'ibc-franchise' ? (
           <IBCFranchiseCaseStudy key="ibc-franchise-case-study" onBack={() => { setView('home'); setCaseStudyType(null); }} />
        ) : view === 'case-study' && caseStudyType === 'ibc-design-system' ? (
           <IBCDesignSystemCaseStudy key="ibc-design-system-case-study" onBack={() => { setView('home'); setCaseStudyType(null); }} />
        ) : (
          /* --- HOME PORTFOLIO VIEW --- */
          <motion.div 
             key="home"
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="w-full"
          >
              {/* Single Column Layout Container */}
              <div className="max-w-2xl mx-auto px-6 py-16 md:py-24">
                
                {/* --- HEADER --- */}
                <header className="mb-24 flex flex-col gap-8">
                    <div className="flex flex-col gap-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h1 className="font-display font-bold text-5xl md:text-6xl leading-none tracking-tight text-ink">
                                Upen
                            </h1>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <span className="h-px w-8 bg-line"></span>
                            <p className="font-sans text-sm text-muted">
                                Product Designer (9 yoe)
                            </p>
                          </div>
                        </div>

                        <div className="font-sans text-base md:text-lg font-light leading-relaxed text-muted max-w-xl">
                          <p>
                            I craft scalable systems and prototypes that blend user-centered design with emerging technology. Specialized in AI based apps, Design systems, Real estate, Customer service, E-commerce, Edtech, and Gaming.
                          </p>
                        </div>
                    </div>

                    {/* Actions Row */}
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-6">
                        {/* Header Copy Email Button */}
                        <button 
                          onClick={copyEmailHeader}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-panel border border-line hover:border-ink/20 hover:bg-page transition-all"
                          aria-label="Copy Email"
                        >
                          <span className="material-symbols-rounded text-lg text-ink">
                            {headerEmailCopied ? 'check' : 'content_copy'}
                          </span>
                          <span className="text-sm font-normal text-ink hidden md:block">
                            {headerEmailCopied ? 'Copied' : 'Copy Email'}
                          </span>
                        </button>

                        <div className="flex gap-4">
                            {/* Updated Social Icons with Background on Hover */}
                            <a href="https://linkedin.com/in/upen-design" target="_blank" rel="noreferrer" 
                               className="flex items-center justify-center w-9 h-9 rounded-full text-muted hover:text-ink hover:bg-panel border border-transparent hover:border-line transition-all" 
                               aria-label="LinkedIn"
                            >
                              <svg className="w-5 h-5 stroke-current fill-none" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
                            </a>
                            <a href="https://dribbble.com/upen-design" target="_blank" rel="noreferrer" 
                               className="flex items-center justify-center w-9 h-9 rounded-full text-muted hover:text-ink hover:bg-panel border border-transparent hover:border-line transition-all" 
                               aria-label="Dribbble"
                            >
                              <svg className="w-5 h-5 stroke-current fill-none" strokeWidth="1.5" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M19.13 5.09C15.22 9.14 10 10.44 2.25 10.94" />
                                <path d="M21.75 12.84c-6.62-1.41-12.14 1.11-14.36 6.32" />
                                <path d="M3.78 18.65c3.01-2.02 7.54-3.23 12.07-1.67" />
                              </svg>
                            </a>
                            <a href="https://github.com/upen-design" target="_blank" rel="noreferrer" 
                               className="flex items-center justify-center w-9 h-9 rounded-full text-muted hover:text-ink hover:bg-panel border border-transparent hover:border-line transition-all" 
                               aria-label="GitHub"
                            >
                              <svg className="w-5 h-5 stroke-current fill-none" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
                            </a>
                        </div>
                      </div>
                      
                      {/* Mobile Switcher (visible < md) */}
                      <div className="md:hidden">
                          <ThemeSwitcher orientation="horizontal" />
                      </div>
                    </div>
                </header>


                {/* --- MAIN CONTENT --- */}
                <main className="flex flex-col gap-24">
                    
                    {/* Work Index Section */}
                    <section id="work" className="scroll-mt-20">
                      <h3 className="text-sm font-normal text-muted mb-8">Selected Works</h3>
                      {/* Reduced space between items */}
                      <div className="w-full space-y-0">
                        {projects.map((project) => (
                          <div 
                            key={project.id} 
                            onClick={() => handleProjectClick(project)}
                            className="group flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-line hover:border-muted/50 transition-colors cursor-pointer"
                            onMouseEnter={() => setHoveredImage(project.image)}
                            onMouseLeave={() => setHoveredImage(null)}
                          >
                            <h4 className="font-sans font-medium text-base text-ink group-hover:translate-x-1 transition-transform flex items-center gap-2">
                              {project.title}
                              {(project.link === 'hiver-analytics' || project.link === 'agent-client-connections' || project.link === 'hiver-experience-redesign' || project.link === 'ibc-franchise' || project.link === 'ibc-design-system') && (
                                <span className="inline-block px-1.5 py-0.5 text-[10px] uppercase font-bold text-page bg-accent rounded-sm opacity-0 group-hover:opacity-100 transition-opacity">Read Case Study</span>
                              )}
                            </h4>
                            <div className="flex items-center gap-4 mt-1 sm:mt-0">
                              <span className="text-muted text-sm font-normal">{project.category}</span>
                              <span className="opacity-0 group-hover:opacity-100 transition-opacity transform -translate-x-2 group-hover:translate-x-0 text-muted">
                                  <span className="material-symbols-rounded text-lg">arrow_outward</span>
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Labs Section */}
                      <div className="mt-16">
                        <h3 className="text-sm font-normal text-muted mb-8">Labs & Experiments</h3>
                        <div className="flex flex-wrap gap-4">
                          {labs.map((lab) => (
                            <div 
                              key={lab.id} 
                              className="group relative cursor-pointer"
                              onMouseEnter={() => setHoveredImage(null)}
                            >
                              <div className="w-14 h-14 rounded-2xl overflow-hidden group-hover:-translate-y-1 transition-transform duration-300 ease-out bg-panel border border-line shadow-sm">
                                  <img src={lab.image} alt={lab.title} className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </section>

                    {/* Experience Section */}
                    <section id="experience" className="scroll-mt-20">
                      <h3 className="text-sm font-normal text-muted mb-8">Experience</h3>

                      <div className="space-y-6"> 
                        {experience.map((job) => (
                            <ExperienceCard key={job.id} job={job} />
                        ))}
                      </div>
                    </section>

                    {/* Testimonials */}
                    <section className="relative py-12 border-t border-line">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {testimonials.map((t) => (
                          <div key={t.id} className="bg-transparent flex flex-col justify-between h-full">
                            <blockquote className="text-base font-light leading-relaxed mb-6 text-ink">
                              "{t.text}"
                            </blockquote>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-panel rounded-full flex items-center justify-center font-bold text-sm text-muted border border-line">
                                {t.author.charAt(0)}
                              </div>
                              <div>
                                <div className="font-medium text-sm text-ink">{t.author}</div>
                                <div className="text-sm font-normal text-muted">{t.position}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* Contact */}
                    <section id="contact" className="scroll-mt-20 pb-10 text-center border-t border-line">
                      <div className="py-20">
                        <h2 className="font-display font-bold text-4xl mb-6 text-ink">Ready for the Next Chapter?</h2>
                        <p className="text-lg font-light mb-8 max-w-lg mx-auto text-muted">
                          I am currently exploring full-time Product Design roles where I can drive design systems and user experience strategy. If your team values craftsmanship and code, let's talk.
                        </p>
                        
                        <button 
                            onClick={copyEmail}
                            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-ink text-page rounded-full font-medium text-lg hover:bg-ink/90 transition-all hover:-translate-y-1 shadow-lg shadow-black/5 overflow-hidden"
                        >
                            <div className={`flex items-center gap-2 transition-all duration-300 ${emailCopied ? '-translate-y-12 opacity-0 absolute' : 'translate-y-0 opacity-100'}`}>
                                <span>Copy Email</span>
                                <span className="material-symbols-rounded">content_copy</span>
                            </div>
                            
                            <div className={`absolute inset-0 flex items-center justify-center gap-2 transition-all duration-300 ${emailCopied ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
                                <span>Copied!</span>
                                <span className="material-symbols-rounded">check</span>
                            </div>
                        </button>
                      </div>
                    </section>

                </main>

                <footer className="mt-12 flex justify-center pb-8">
                    <div className="flex items-center gap-2 px-4 py-2 bg-panel rounded-full border border-line">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span className="text-sm font-normal text-muted">Available for new opportunities</span>
                    </div>
                </footer>
              </div>

              <FloatingNav activeSection={activeSection} scrollToSection={scrollToSection} />
          </motion.div>
        )}
      </AnimatePresence>

      <AIChatWidget />
    </div>
  );
};

export default App;