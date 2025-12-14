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
    id: 8,
    title: "Agent-Client Connections",
    category: "Case study",
    industry: "Real Estate",
    description: "End-to-end design of agent-client connection features across iOS, Web, and Android at Compass, enabling agents to build stronger relationships through branded experiences and activity tracking.",
    image: "https://picsum.photos/800/600?random=8",
    link: "agent-client-connections"
  },
  {
    id: 5,
    title: "Hiver Analytics",
    category: "Case study",
    industry: "SaaS",
    description: "End-to-end design of a helpdesk analytics suite inside Gmail. Driven by data, user research, and complex system design.",
    image: "https://picsum.photos/800/600?random=5",
    link: "hiver-analytics"
  },
  {
    id: 9,
    title: "Hiver Experience Redesign",
    category: "Case study",
    industry: "Product revamp",
    description: "Complete UI/UX redesign of Hiver's email management tool to align with Gmail's new design while establishing Hiver's unique identity within the Gmail ecosystem.",
    image: "https://picsum.photos/800/600?random=9",
    link: "hiver-experience-redesign"
  },
  {
    id: 10,
    title: "iBC Franchise Management",
    category: "Case study",
    industry: "SaaS",
    description: "End-to-end experience design for iB Cricket's franchise management system, enabling franchise owners to track operations, revenue, and compliance from remote locations.",
    image: "https://picsum.photos/800/600?random=10",
    link: "ibc-franchise"
  },
  {
    id: 11,
    title: "iBC Design System",
    category: "Case study",
    industry: "Design system",
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
    id: 4,
    text: "Upen was the first designer at compass IDC, who spearheaded the UX. His data-driven approach led to some great insights for the product. And his unmatched design skills up-leveled the experience for the end users. As a hands-on designer, his decision-making approach shipping many 0 to 1 products by walking shoulder to shoulder with product and engineering partners without compromising the quality. He is a self-managed IC leader. I would jump at any opportunity to work with him again.",
    author: "Prashanth Sharma",
    position: "Design Manager, Compass",
    image: "/prashanth.avif"
  },
  {
    id: 1,
    text: "Upen is adept at analyzing complex workflows to deliver intuitive and deceptively simple user experiences, leveraging data and customer insights to provoke his eagerness to innovate. He's also exceptionally talented at designing web and mobile interaction patterns! He has a great eye for detail and was an avid contributor supporting our nascent design system token and component development. Upen's ability to craft design solutions for scale and simplicity makes him a joy to partner with, whether you're a fellow designer, product manager, or engineer working together.",
    author: "Scher Foord",
    position: "Director, Compass",
    image: "/scher.avif"
  },
  {
    id: 2,
    text: "Upen is a versatile product designer who can pick up almost any design requirement. His ability to pick up various requirements stems from his varied interests and tremendous potential to learn and deliver at a fast pace. He has contributed to Hiver design in many ways - UX-focussed product design, marketing collateral, functional decks, etc. Towards the latter part of his career in the company, Upen also started voicing opinions in product functionality which were very helpful for the product managers. He is a great value add to any product team and I would highly recommend him to any design or product leader.",
    author: "Arvind Ganesan",
    position: "VP of Product, Hiver",
    image: "/arvind_edited.avif"
  },
  {
    id: 3,
    text: "Upen adds a lot of value to the product thinking / brainstorming sessions. He keeps coming up with ideas & also always mocks them up for the stakeholders to be able to internalize & evaluate the ideas better",
    author: "Ravi Tetali",
    position: "Group Product Manager, Compass",
    image: "/ravi.avif"
  },
  {
    id: 5,
    text: "Upen demonstrated openness to feedback and approaches everything he contributes thoughtfully.",
    author: "Catarina Tsang",
    position: "Senior Director, Compass",
    image: "/catarina_edited.avif"
  }
];

const LabsDock: React.FC<{ labs: typeof labs }> = ({ labs }) => {
  return (
    <div className="mt-16">
      <h3 className="text-sm font-normal text-muted mb-8">Labs & Experiments</h3>
      <div className="flex flex-row items-start justify-start gap-8 flex-wrap">
        {labs.map((lab) => (
          <button
            key={lab.id}
            onClick={() => {}}
            className="flex flex-col items-center justify-start gap-2 cursor-pointer transition-transform duration-200 hover:scale-110 active:scale-95"
          >
            <div className="w-14 h-14 rounded-2xl overflow-hidden flex items-center justify-center mx-auto">
              <img src={lab.image} alt={lab.title} className="w-full h-full object-cover" />
            </div>
            <span className="text-[10px] font-normal text-muted text-center leading-tight whitespace-nowrap block">
              {lab.title}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

const ExperienceCard: React.FC<{ job: typeof experience[0] }> = ({ job }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <div
      onClick={() => setIsExpanded(!isExpanded)}
      className="group relative bg-panel rounded-xl cursor-pointer overflow-hidden flex gap-2 transition-colors experience-card-hover"
      style={{ 
        minHeight: '40px', 
        padding: isExpanded ? '18px 18px 18px 18px' : '18px 18px 6px 18px' 
      }}
    >
      {/* Dot aligned with designation */}
      <div className={`w-1.5 h-1.5 rounded-full ${job.color} shrink-0 opacity-70`} style={{ marginTop: '5px' }} />
      
      <div className="flex flex-col w-full">
        <div className="flex justify-between items-start">
            <div>
                <h4 className="font-sans font-normal text-ink leading-tight" style={{ fontSize: '14px' }}>{job.role}</h4>
                <div 
                  className="font-normal text-muted" 
                  style={{ fontSize: '14px', marginTop: '1px' }}
                >
                  {job.company}
                </div>
            </div>
            
            {/* Tenure relocated to right side */}
            <div 
              className="font-normal text-muted uppercase tracking-wide opacity-70 whitespace-nowrap ml-4" 
              style={{ fontSize: '11px' }}
            >
                {job.period}
            </div>
        </div>
        
        {/* Description - Hidden when collapsed */}
        <motion.div
            animate={{
                height: isExpanded ? (contentRef.current?.scrollHeight ?? 0) : 0,
            }}
            transition={{ 
                duration: 0.2, 
                ease: [0.4, 0, 0.2, 1]
            }}
            className="overflow-hidden mt-3"
        >
            <motion.div
                ref={contentRef}
                animate={{
                    opacity: isExpanded ? 1 : 0,
                }}
                transition={{ 
                    duration: 0.15, 
                    ease: [0.4, 0, 0.2, 1]
                }}
                className="text-muted font-normal leading-relaxed"
                style={{ fontSize: '14px' }}
            >
                 {job.points && (
                    <ul className="list-disc ml-4 space-y-2 marker:text-muted/50">
                        {job.points.map((point, idx) => (
                          <li key={idx}>{point}</li>
                        ))}
                    </ul>
                )}
            </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

// URL slug mapping
const caseStudySlugs: Record<string, 'hiver' | 'agent-client' | 'hiver-experience' | 'ibc-franchise' | 'ibc-design-system'> = {
  'hiver-analytics': 'hiver',
  'agent-client-connections': 'agent-client',
  'hiver-experience-redesign': 'hiver-experience',
  'ibc-franchise': 'ibc-franchise',
  'ibc-design-system': 'ibc-design-system'
};

const caseStudyTypeToSlug: Record<string, string> = {
  'hiver': 'hiver-analytics',
  'agent-client': 'agent-client-connections',
  'hiver-experience': 'hiver-experience-redesign',
  'ibc-franchise': 'ibc-franchise',
  'ibc-design-system': 'ibc-design-system'
};

const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'case-study'>('home');
  const [activeSection, setActiveSection] = useState('work');
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

  // Initialize from URL on mount
  useEffect(() => {
    const path = window.location.pathname;
    const slugMatch = path.match(/^\/case-study\/(.+)$/);
    
    if (slugMatch) {
      const slug = slugMatch[1];
      const studyType = caseStudySlugs[slug];
      if (studyType) {
        setCaseStudyType(studyType);
        setView('case-study');
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
    } else {
      // If on home, ensure URL is clean
      if (path !== '/' && path !== '') {
        window.history.replaceState({}, '', '/');
      }
    }
  }, []);

  // Handle browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const slugMatch = path.match(/^\/case-study\/(.+)$/);
      
      if (slugMatch) {
        const slug = slugMatch[1];
        const studyType = caseStudySlugs[slug];
        if (studyType) {
          setCaseStudyType(studyType);
          setView('case-study');
          window.scrollTo({ top: 0, behavior: 'instant' });
        }
      } else {
        setCaseStudyType(null);
        setView('home');
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleProjectClick = (project: Project) => {
    if (project.link && caseStudySlugs[project.link]) {
      const studyType = caseStudySlugs[project.link];
      setCaseStudyType(studyType);
      setView('case-study');
      // Update URL with slug
      window.history.pushState({}, '', `/case-study/${project.link}`);
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  const handleCaseStudyBack = () => {
    setView('home');
    setCaseStudyType(null);
    // Update URL to home
    window.history.pushState({}, '', '/');
    window.scrollTo({ top: 0, behavior: 'instant' });
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


      {/* Fixed Top-Right Theme Switcher (Desktop) - Always Visible */}
      <div className="hidden md:flex fixed right-8 top-8 z-50 flex-col items-end">
        <ThemeSwitcher orientation="horizontal" />
      </div>

      {/* View Switching Logic */}
      <AnimatePresence mode="wait">
        {view === 'case-study' && caseStudyType === 'hiver' ? (
           <HiverCaseStudy key="hiver-case-study" onBack={handleCaseStudyBack} />
        ) : view === 'case-study' && caseStudyType === 'agent-client' ? (
           <AgentClientConnectionsCaseStudy key="agent-client-case-study" onBack={handleCaseStudyBack} />
        ) : view === 'case-study' && caseStudyType === 'hiver-experience' ? (
           <HiverExperienceRedesignCaseStudy key="hiver-experience-case-study" onBack={handleCaseStudyBack} />
        ) : view === 'case-study' && caseStudyType === 'ibc-franchise' ? (
           <IBCFranchiseCaseStudy key="ibc-franchise-case-study" onBack={handleCaseStudyBack} />
        ) : view === 'case-study' && caseStudyType === 'ibc-design-system' ? (
           <IBCDesignSystemCaseStudy key="ibc-design-system-case-study" onBack={handleCaseStudyBack} />
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

                        <div className="font-sans text-base font-normal leading-[25px] tracking-[-0.1px] text-ink max-w-xl">
                          <p>
                            I craft scalable systems and prototypes that blend user-centered design with emerging technology. Specialized in AI based apps, Design systems, Real estate, Customer service, E-commerce, Edtech, and Gaming.
                          </p>
                        </div>
                    </div>

                    {/* Actions Row */}
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        {/* Header Copy Email Button */}
                        <button 
                          onClick={copyEmailHeader}
                          className="relative inline-flex items-center justify-center gap-2 px-4 h-9 rounded-full bg-panel border border-line hover:border-ink/20 hover:bg-page transition-all overflow-hidden w-[108px] md:w-[132px]"
                          aria-label="Copy Email"
                        >
                          <AnimatePresence mode="wait" initial={false}>
                            {!headerEmailCopied ? (
                              <motion.div
                                key="copy"
                                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -15, scale: 0.95 }}
                                transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
                                className="flex items-center gap-2 absolute inset-0 justify-center"
                              >
                                <span className="material-symbols-rounded text-lg text-ink">content_copy</span>
                                <span className="text-sm font-normal text-ink hidden md:block">Copy Email</span>
                              </motion.div>
                            ) : (
                              <motion.div
                                key="copied"
                                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -15, scale: 0.95 }}
                                transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
                                className="flex items-center gap-2 absolute inset-0 justify-center"
                              >
                                <span className="material-symbols-rounded text-lg text-ink">check</span>
                                <span className="text-sm font-normal text-ink hidden md:block">Copied</span>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </button>

                        <div className="flex gap-2">
                            {/* Updated Social Icons with Background on Hover */}
                            <a href="https://linkedin.com/in/upen-design" target="_blank" rel="noreferrer" 
                               className="flex items-center justify-center w-9 h-9 rounded-full text-muted hover:text-ink hover:bg-panel border border-transparent hover:border-line transition-all" 
                               aria-label="LinkedIn"
                            >
                              <svg className="w-5 h-5 stroke-current fill-none" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" strokeLinejoin="round">
                                <path d="M6.09836 7.81968H3.22951V17H6.09836V7.81968ZM6.35656 4.66393C6.35807 4.44693 6.31682 4.23176 6.23517 4.03069C6.15353 3.82963 6.03307 3.64661 5.88069 3.4921C5.72831 3.33759 5.54699 3.2146 5.34708 3.13017C5.14717 3.04574 4.93258 3.0015 4.71558 3H4.66393C4.22264 3 3.79941 3.17531 3.48735 3.48735C3.17531 3.79941 3 4.22264 3 4.66393C3 5.10524 3.17531 5.52847 3.48735 5.84052C3.79941 6.15257 4.22264 6.32788 4.66393 6.32788C4.88096 6.33321 5.09691 6.29574 5.29943 6.21759C5.50196 6.13945 5.68712 6.02216 5.8443 5.87243C6.00149 5.7227 6.12764 5.54346 6.21553 5.34497C6.30343 5.14647 6.35135 4.9326 6.35656 4.71558V4.66393ZM17 11.423C17 8.66316 15.2443 7.59018 13.5 7.59018C12.9289 7.56158 12.3603 7.68321 11.8508 7.94296C11.3415 8.20267 10.909 8.59147 10.5967 9.07049H10.5164V7.81968H7.81967V17H10.6885V12.1172C10.6471 11.6172 10.8046 11.1209 11.1269 10.7363C11.4491 10.3517 11.9102 10.1098 12.4098 10.0632H12.5189C13.4312 10.0632 14.1082 10.6369 14.1082 12.0828V17H16.9771L17 11.423Z" />
                              </svg>
                            </a>
                            <a href="https://dribbble.com/upen-design" target="_blank" rel="noreferrer" 
                               className="flex items-center justify-center w-9 h-9 rounded-full text-muted hover:text-ink hover:bg-panel border border-transparent hover:border-line transition-all" 
                               aria-label="Dribbble"
                            >
                              <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path d="M17.9797 10.527C17.9797 10.5465 17.9867 10.564 17.9847 10.5835C17.9832 10.5935 17.9772 10.601 17.9757 10.611C17.7329 13.7955 15.6179 16.459 12.7326 17.512C12.696 17.5305 12.658 17.543 12.617 17.552C11.7967 17.837 10.9198 18 10.0034 18C5.59066 18 2.00018 14.411 2.00018 10C2.00018 9.664 2.02771 9.335 2.06825 9.0095C2.07025 8.996 2.06625 8.9835 2.06925 8.97C2.07075 8.9635 2.07526 8.959 2.07676 8.9525C2.41458 6.3875 3.97359 4.207 6.1462 3.003C6.18724 2.969 6.23378 2.9465 6.28233 2.9275C7.39491 2.339 8.65863 2 10.0034 2C12.0369 2 13.8897 2.7685 15.3031 4.022C15.3071 4.024 15.3121 4.024 15.3161 4.0265C15.3751 4.0635 15.4232 4.111 15.4607 4.165C17.0232 5.626 18.0067 7.698 18.0067 10C18.0067 10.178 17.9912 10.352 17.9797 10.527ZM16.9296 10.977C15.2956 10.835 13.8577 10.9345 12.6 11.169C12.9958 12.643 13.2065 14.347 13.0789 16.2865C15.1194 15.2825 16.6013 13.3125 16.9296 10.977ZM10.0034 17C10.7126 17 11.3948 16.8895 12.0399 16.6925C12.2301 14.6735 12.0359 12.908 11.619 11.3855C10.1125 11.779 8.91688 12.362 8.03053 12.9205C6.63217 13.802 5.76483 14.7445 5.36745 15.232C6.60364 16.328 8.22471 17 10.0034 17ZM3.00065 10C3.00065 11.719 3.62626 13.2925 4.65826 14.512C5.47405 13.528 7.60611 11.3975 11.3172 10.4195C11.127 9.8865 10.9113 9.387 10.6776 8.921C9.3478 9.5355 7.73174 9.9585 5.79686 9.9585C4.93503 9.9585 4.00663 9.8685 3.01667 9.6805C3.01216 9.787 3.00065 9.892 3.00065 10ZM3.13028 8.6755C6.08964 9.249 8.41089 8.8215 10.1831 8.025C8.79527 5.7165 7.06959 4.4 6.44799 3.9745C4.75285 4.9795 3.51515 6.677 3.13028 8.6755ZM10.0034 3C9.11007 3 8.25724 3.172 7.47098 3.4785C8.17066 4.0105 9.25421 4.9565 10.2917 6.3625C10.5545 6.719 10.8222 7.121 11.083 7.561C12.7521 6.5975 13.8251 5.3475 14.3842 4.5475C13.1835 3.5815 11.661 3 10.0034 3ZM15.1199 5.2375C14.4828 6.124 13.3272 7.4375 11.57 8.4555C11.8357 8.9865 12.0835 9.5665 12.3012 10.1955C13.6755 9.932 15.2365 9.8255 17.0052 9.9795C16.9997 8.1475 16.2815 6.4835 15.1199 5.2375Z" />
                              </svg>
                            </a>
                            <a href="https://github.com/upen-design" target="_blank" rel="noreferrer" 
                               className="flex items-center justify-center w-9 h-9 rounded-full text-muted hover:text-ink hover:bg-panel border border-transparent hover:border-line transition-all" 
                               aria-label="GitHub"
                            >
                              <svg className="w-5 h-5 stroke-current fill-none" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12.5022 17.5C12.5052 17.0268 12.5082 15.3844 12.5082 14.7341C12.5082 13.7944 12.1872 13.1795 11.8272 12.8682C14.0621 12.6185 16.4084 11.7673 16.4084 7.89523C16.4084 6.79506 16.0208 5.89506 15.3771 5.19087C15.4802 4.93587 15.8244 3.9108 15.2771 2.5233C15.2771 2.5233 14.4363 2.25249 12.5201 3.55749C11.7183 3.3332 10.8609 3.22222 10.0083 3.21776C9.15548 3.22222 8.29825 3.3333 7.49625 3.55749C5.5801 2.25249 4.73939 2.5233 4.73939 2.5233C4.1921 3.9108 4.53629 4.93587 4.63936 5.19087C3.99568 5.89506 3.60811 6.79506 3.60811 7.89523C3.60811 11.7673 5.95429 12.6185 8.18919 12.8682C7.82929 13.1795 7.50821 13.7944 7.50821 14.7341C7.50821 15.3844 7.51125 17.0268 7.51419 17.5M3 13.4459C4.00733 13.5172 4.58818 14.4326 4.58818 14.4326C5.48352 15.973 6.9373 15.5275 7.50862 15.2703" />
                              </svg>
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
                            className="group work-item-hover flex flex-col sm:flex-row sm:items-center py-3 px-3 cursor-pointer rounded-xl transition-colors"
                          >
                            <h4 className="font-sans font-normal text-[14px] text-ink flex-shrink-0 pr-1.5">
                              {project.title}
                            </h4>
                            <span className="divider-line hidden sm:block flex-1 h-px bg-line/60 mx-1.5 transition-colors"></span>
                            <div className="flex items-center gap-4 mt-1 sm:mt-0 flex-shrink-0 pl-1.5">
                              <span className="text-muted text-[13px] font-normal group-hover:hidden">{project.industry || project.category}</span>
                              <span className="text-muted text-[13px] font-normal hidden group-hover:inline">{project.category}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Labs Section */}
                      <LabsDock labs={labs} />
                    </section>

                    {/* Experience Section */}
                    <section id="experience" className="scroll-mt-20">
                      <h3 className="text-sm font-normal text-muted mb-4">Experience</h3>

                      <div className="space-y-3"> 
                        {experience.map((job) => (
                            <ExperienceCard key={job.id} job={job} />
                        ))}
                      </div>
                    </section>

                    {/* Testimonials */}
                    <section id="testimonials" className="scroll-mt-20">
                      <h3 className="text-sm font-normal text-muted mb-4">Some kind words<br />from the people I worked with</h3>
                      <div className="columns-1 md:columns-2 gap-4">
                        {testimonials.map((t) => (
                          <div key={t.id} className="testimonial-card bg-panel rounded-2xl p-5 flex flex-col gap-3 break-inside-avoid mb-4">
                            {/* Top section with avatar, name, and designation */}
                            <div className="flex items-start gap-3">
                              {t.image ? (
                                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                                  <img 
                                    src={t.image} 
                                    alt={t.author}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      // Fallback to initial if image fails to load
                                      const target = e.currentTarget;
                                      target.style.display = 'none';
                                      const parent = target.parentElement;
                                      if (parent) {
                                        parent.innerHTML = `<div class="w-10 h-10 bg-panel rounded-full flex items-center justify-center font-semibold text-sm text-ink">${t.author.charAt(0)}</div>`;
                                      }
                                    }}
                                  />
                                </div>
                              ) : (
                                <div className="w-10 h-10 bg-panel rounded-full flex items-center justify-center font-semibold text-sm text-ink">
                                  {t.author.charAt(0)}
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-sm text-ink mb-0.5">{t.author}</div>
                                <div className="text-xs font-normal text-muted">{t.position}</div>
                              </div>
                            </div>
                            
                            {/* Message content */}
                            <div className="text-sm font-normal leading-relaxed text-ink">
                              {t.text}
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* Contact */}
                    <section id="contact" className="scroll-mt-20 text-center">
                      {/* Hidden for now */}
                      {/* <div className="py-20">
                        <h2 className="font-display font-bold text-4xl mb-6 text-ink">Ready for the Next Chapter?</h2>
                        <p className="text-lg font-light mb-8 max-w-lg mx-auto text-muted">
                          I am currently exploring full-time Product Design roles where I can drive design systems and user experience strategy. If your team values craftsmanship and code, let's talk.
                        </p>
                        
                        <button 
                            onClick={copyEmail}
                            className="group relative inline-flex items-center justify-center gap-3 px-8 h-9 bg-ink text-page rounded-full font-medium text-lg hover:bg-ink/90 transition-all hover:-translate-y-1 shadow-lg shadow-black/5 overflow-hidden w-[160px]"
                        >
                            <AnimatePresence mode="wait" initial={false}>
                                {!emailCopied ? (
                                    <motion.div
                                        key="copy"
                                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -20, scale: 0.9 }}
                                        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                                        className="flex items-center gap-2 absolute inset-0 justify-center"
                                    >
                                        <span>Copy Email</span>
                                        <span className="material-symbols-rounded">content_copy</span>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="copied"
                                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -20, scale: 0.9 }}
                                        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                                        className="flex items-center gap-2 absolute inset-0 justify-center"
                                    >
                                        <span>Copied!</span>
                                        <span className="material-symbols-rounded">check</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </button>
                      </div> */}
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