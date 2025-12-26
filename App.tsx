import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AIChatWidget from './components/AIChatWidget';
import ThemeSwitcher from './components/ThemeSwitcher';
import TopBar from './components/TopBar';
import ImageStack from './components/ImageStack';
import CompanyLogo from './components/CompanyLogo';
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
    title: "Goodeeds",
    description: "Social impact platform.",
    image: "/Projects/goodeeds.png"
  },
  {
    id: 102,
    title: "KidsTube",
    description: "Children's content platform.",
    image: "/Projects/kidstube.png"
  },
  {
    id: 103,
    title: "Print Grid",
    description: "Print layout tool.",
    image: "/Projects/print-grid.png"
  }
];

// Updated Experience Data from Resume
const experience: (Experience & { color: string, tag: string })[] = [
  {
    id: 1,
    role: "Design Lead",
    company: "Jio",
    period: "2023 — Present",
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
    period: "2020 — 2023",
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
    period: "2019 — 2020",
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
    period: "2016 — 2018",
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
    position: "Group Product Manager, Compass"
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
            <div className="w-11 h-11 overflow-hidden flex items-center justify-center mx-auto">
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

// Logo mapping function (kept for backward compatibility, but now returns SVG paths)
const getCompanyLogo = (companyName: string): string => {
  const logoMap: { [key: string]: string } = {
    'Jio': '/experience/jio.svg',
    'Compass': '/experience/COMP 1.svg',
    'Hiver': '/experience/hiver.svg',
    'iB Hubs': '/experience/ib.svg'
  };
  return logoMap[companyName] || '';
};

const ExperienceCard: React.FC<{ job: typeof experience[0] }> = ({ job }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <div
      onClick={() => setIsExpanded(!isExpanded)}
      className="group relative rounded-xl cursor-pointer overflow-hidden flex experience-card-hover backdrop-blur-md"
      style={{ 
        height: isExpanded ? 'auto' : '45px', 
        padding: isExpanded ? '12px 18px 18px 18px' : '12px 18px' 
      }}
    >
      <div className="flex flex-col w-full">
        <div className="flex justify-between items-center" style={{ height: '18px', flexShrink: 0 }}>
            <div className="flex gap-6">
              {/* Company Logo - centered with role + company */}
              <div className="flex items-center shrink-0">
                <CompanyLogo 
                  companyName={job.company}
                  className="object-contain"
                  style={{ width: '18px', height: '18px' }}
                />
              </div>
              
              <div className="flex flex-col justify-center">
                  <h4 className="font-sans font-normal text-ink leading-tight" style={{ fontSize: '14px' }}>{job.role} • {job.company}</h4>
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
                style={{ fontSize: '14px', marginLeft: '40px' }}
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
  const [tailwindConnectCopied, setTailwindConnectCopied] = useState(false);
  const [theme, setTheme] = useState<Theme>('light');
  const [isScrolled, setIsScrolled] = useState(false);
  const [showTopBar, setShowTopBar] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

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

  // Scroll detection for TopBar and hero section
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const scrollThreshold = 100; // Show top bar after scrolling 100px
      
      setIsScrolled(scrollY > 0);
      setShowTopBar(scrollY > scrollThreshold);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setActiveSection(sectionId);
  };

  const copyEmailTailwindConnect = () => {
    navigator.clipboard.writeText('upendra.uxr@gmail.com');
    setTailwindConnectCopied(true);
    setTimeout(() => setTailwindConnectCopied(false), 2000);
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
    <div className={`theme-${theme} w-full min-h-screen ${isChatOpen ? 'md:bg-panel' : 'bg-page'} text-ink font-sans selection:bg-accent selection:text-white transition-colors duration-500 flex`}>
      
      {/* Noise Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-50 bg-noise bg-repeat mix-blend-overlay"></div>

      {/* Top Bar */}
      <TopBar isVisible={showTopBar} isChatOpen={isChatOpen} />

      {/* Fixed Bottom-Left Theme Switcher (Desktop) - Always Visible */}
      <div className={`hidden md:flex fixed bottom-8 left-8 z-50 flex-col items-start transition-all duration-300 ${isChatOpen ? 'md:left-8' : 'left-8'}`}>
        <ThemeSwitcher orientation="vertical" />
      </div>

      {/* Main Body Container with Rounded Border when Chat is Open */}
      <div className={`flex-1 transition-all duration-300 ${isChatOpen ? 'md:relative md:z-40 md:rounded-[24px] md:mx-2 md:my-2 md:bg-page md:border md:border-line md:overflow-y-auto md:mr-[400px] md:h-[calc(100vh-16px)]' : ''}`}>
        {/* Progressive Blur Layer - Top */}
        <div 
          className="sticky top-0 left-0 right-0 pointer-events-none z-50"
          style={{
            height: '44px',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)'
          }}
        />
        {/* View Switching Logic */}
        <AnimatePresence mode="wait">
          {view === 'case-study' && caseStudyType === 'hiver' ? (
             <motion.div key="hiver-case-study" className="flex-1">
               <HiverCaseStudy onBack={handleCaseStudyBack} />
             </motion.div>
          ) : view === 'case-study' && caseStudyType === 'agent-client' ? (
             <motion.div key="agent-client-case-study" className="flex-1">
               <AgentClientConnectionsCaseStudy onBack={handleCaseStudyBack} />
             </motion.div>
          ) : view === 'case-study' && caseStudyType === 'hiver-experience' ? (
             <motion.div key="hiver-experience-case-study" className="flex-1">
               <HiverExperienceRedesignCaseStudy onBack={handleCaseStudyBack} />
             </motion.div>
          ) : view === 'case-study' && caseStudyType === 'ibc-franchise' ? (
             <motion.div key="ibc-franchise-case-study" className="flex-1">
               <IBCFranchiseCaseStudy onBack={handleCaseStudyBack} />
             </motion.div>
          ) : view === 'case-study' && caseStudyType === 'ibc-design-system' ? (
             <motion.div key="ibc-design-system-case-study" className="flex-1">
               <IBCDesignSystemCaseStudy onBack={handleCaseStudyBack} />
             </motion.div>
          ) : (
            /* --- HOME PORTFOLIO VIEW --- */
            <motion.div 
               key="home"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="flex-1"
            >
              {/* Single Column Layout Container */}
              <div className="max-w-2xl mx-auto px-6 py-16 md:py-24">
                
                {/* --- HEADER --- */}
                <header className="mb-24 flex flex-col gap-8">
                    <div className="flex flex-col gap-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <motion.h1 
                              className="font-display font-bold text-5xl md:text-6xl leading-none tracking-tight text-ink"
                              animate={{ 
                                opacity: 1,
                                y: 0
                              }}
                            >
                                Upen
                            </motion.h1>
                          </div>
                          
                          <div className="flex items-center gap-3 pl-2">
                            <img src="/experience/next.svg" alt="" className="w-3 theme-aware" />
                            <div className="font-sans text-sm text-ink flex items-center gap-3 pl-1">
                              <a 
                                href="https://dribbble.com/upen-design" 
                                target="_blank" 
                                rel="noreferrer"
                                className="hover:text-ink hover:underline underline-offset-4 transition-colors duration-200"
                                aria-label="Dribbble"
                              >
                                Dribbble
                              </a>
                              <span className="opacity-40">/</span>
                              <a 
                                href="https://linkedin.com/in/upen-design" 
                                target="_blank" 
                                rel="noreferrer"
                                className="hover:text-ink hover:underline underline-offset-4 transition-colors duration-200"
                                aria-label="LinkedIn"
                              >
                                LinkedIn
                              </a>
                              <span className="opacity-40">/</span>
                              <a 
                                href="https://github.com/Hazenbox/" 
                                target="_blank" 
                                rel="noreferrer"
                                className="hover:text-ink hover:underline underline-offset-4 transition-colors duration-200"
                                aria-label="GitHub"
                              >
                                GitHub
                              </a>
                            </div>
                          </div>
                        </div>

                        <div className="font-sans text-base font-normal leading-[25px] tracking-[-0.1px] text-ink pt-1">
                          <p>
                            I craft scalable systems and prototypes that blend user-centered design with emerging technology. Specialized in AI based apps, Design systems, Real estate, Customer service, E-commerce, Edtech, and Gaming.
                          </p>
                        </div>
                    </div>

                    {/* Actions Row */}
                    <div className="flex items-center justify-between" style={{ left: 0, top: 0 }}>
                      <div className="flex items-center gap-3">
                        {/* Copy Email Button (Styled) */}
                        <button 
                          onClick={copyEmailTailwindConnect}
                          className="bg-ink no-underline group cursor-pointer relative shadow-2xl shadow-black/20 rounded-full p-px text-xs font-semibold leading-6 text-page inline-block overflow-hidden"
                          aria-label="Copy Email"
                        >
                          <span className="absolute inset-0 overflow-hidden rounded-full">
                            <span 
                              className="absolute inset-0 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                              style={{
                                backgroundImage: `radial-gradient(75% 100% at 50% 0%, rgb(var(--color-accent) / 0.6) 0%, rgb(var(--color-accent) / 0) 75%)`
                              }}
                            />
                          </span>
                          <div className="relative flex items-center justify-center z-10 rounded-full bg-ink/90 py-1 px-4 ring-1 ring-line/20 min-w-[100px]">
                            <AnimatePresence mode="wait" initial={false}>
                              {!tailwindConnectCopied ? (
                                <motion.span
                                  key="copy"
                                  initial={{ opacity: 0, scale: 0.8, y: 4 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.8, y: -4 }}
                                  transition={{ duration: 0.12, ease: [0.4, 0, 0.2, 1] }}
                                  className="block font-medium"
                                >
                                  Copy Email
                                </motion.span>
                              ) : (
                                <motion.span
                                  key="copied"
                                  initial={{ opacity: 0, scale: 0.8, y: 4 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.8, y: -4 }}
                                  transition={{ duration: 0.12, ease: [0.4, 0, 0.2, 1] }}
                                  className="block font-medium"
                                >
                                  Copied!
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </div>
                          <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-accent/0 via-accent/90 to-accent/0 transition-opacity duration-500 group-hover:opacity-40" />
                        </button>

                      </div>
                      
                      {/* Mobile Switcher (visible < md) */}
                      <div className="md:hidden">
                          <ThemeSwitcher orientation="vertical" />
                      </div>
                    </div>
                </header>


                {/* --- MAIN CONTENT --- */}
                <main className="flex flex-col gap-24">
                    
                    {/* Work Index Section */}
                    <section id="work" className="scroll-mt-20">
                      <h3 className="text-sm font-normal text-muted mb-4">Featured Works</h3>
                      
                      <ImageStack images={projects.slice(0, 5).map(p => ({
                        id: p.id,
                        src: p.image,
                        alt: p.title
                      }))} />

                      {/* Reduced space between items */}
                      <div className="w-full space-y-0">
                        {projects.map((project) => (
                          <div 
                            key={project.id} 
                            onClick={() => handleProjectClick(project)}
                            className="group work-item-hover backdrop-blur-md flex flex-col sm:flex-row sm:items-center py-3 px-3 cursor-pointer rounded-xl"
                          >
                            <h4 className="font-sans font-normal text-[14px] text-ink flex-shrink-0 pr-1.5">
                              {project.title}
                            </h4>
                            <span className="divider-line hidden sm:block flex-1 h-px bg-line/60 mx-1.5"></span>
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

                      <div> 
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
                      {/* Contact section content can be added here in the future */}
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
          </motion.div>
        )}
        </AnimatePresence>
        {/* Progressive Blur Layer - Bottom */}
        <div 
          className="sticky bottom-0 left-0 right-0 pointer-events-none z-50"
          style={{
            height: '44px',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 100%)'
          }}
        />
      </div>

      <AIChatWidget onOpenChange={setIsChatOpen} />
    </div>
  );
};

export default App;