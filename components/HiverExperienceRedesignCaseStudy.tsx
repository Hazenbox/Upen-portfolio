import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import ThemeSwitcher from './ThemeSwitcher';

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
    window.addEventListener('resize', updateBounds);
    window.addEventListener('scroll', updateBounds); 
    return () => {
        window.removeEventListener('resize', updateBounds);
        window.removeEventListener('scroll', updateBounds);
    }
  }, []);

  const distance = useTransform(mouseY, (val: number) => {
    if (val === null) return 1000;
    const center = bounds.y + bounds.height / 2;
    return val - center;
  });

  const baseWidth = isActive ? 32 : 12;
  const hoverWidth = 48;
  
  const rawWidth = useTransform(distance, [-120, 0, 120], [baseWidth, hoverWidth, baseWidth]);
  const rawHeight = useTransform(distance, [-120, 0, 120], [2, 6, 2]);
  const rawOpacity = useTransform(distance, [-120, 0, 120], [isActive ? 1 : 0.3, 1, isActive ? 1 : 0.3]);

  const width = useSpring(rawWidth, { mass: 0.1, stiffness: 150, damping: 12 });
  const height = useSpring(rawHeight, { mass: 0.1, stiffness: 150, damping: 12 });
  const opacity = useSpring(rawOpacity, { mass: 0.1, stiffness: 150, damping: 12 });

  return (
    <button 
      ref={ref}
      onClick={onClick}
      className="flex items-center gap-4 py-2 group/item outline-none"
    >
      <span className={`
            text-xs font-medium transition-all duration-300 transform
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

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = scrollTop / docHeight;
      setScrollProgress(Math.min(Math.max(scrollPercent, 0), 1));
    };

    window.addEventListener('scroll', handleScroll);
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
      {/* --- HEADER / NAV --- */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-page/80 backdrop-blur-md border-b border-line transition-all duration-300">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="text-sm font-bold tracking-wide uppercase text-ink">Hiver Experience Redesign</div>
            
            <div className="flex items-center gap-4">
                <div className="md:hidden">
                    <ThemeSwitcher orientation="horizontal" />
                </div>

                <div className="relative w-10 h-10 flex items-center justify-center group">
                    <svg className="absolute w-full h-full -rotate-90 transform pointer-events-none" viewBox="0 0 40 40">
                        <circle
                            cx="20" cy="20" r="18"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            className="text-line transition-colors duration-300"
                        />
                        <circle
                            cx="20" cy="20" r="18"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            className="text-accent transition-all duration-100 ease-out"
                            strokeDasharray={circumference}
                            strokeDashoffset={circumference - (scrollProgress * circumference)}
                            strokeLinecap="round"
                        />
                    </svg>
                    <button 
                      onClick={onBack}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-transparent text-muted hover:text-ink hover:bg-panel transition-all duration-200 z-10"
                      aria-label="Close Case Study"
                    >
                        <span className="material-symbols-rounded text-xl">close</span>
                    </button>
                </div>
            </div>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="max-w-4xl mx-auto px-6 pt-32 pb-32 flex flex-col gap-24 relative">
        
            {/* HERO / OVERVIEW */}
            <section id="overview" className="space-y-8">
                <h1 className="font-display font-bold text-5xl md:text-7xl leading-tight text-ink">
                    Hiver<br />Experience Redesign
                </h1>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-line">
                    <div>
                        <div className="text-xs uppercase tracking-wider text-muted mb-2">Platform</div>
                        <div className="text-sm font-medium">Web app - live</div>
                    </div>
                    <div>
                        <div className="text-xs uppercase tracking-wider text-muted mb-2">My Role</div>
                        <div className="text-sm font-medium">Research, concept ideation, brand identity, visual design, interaction design</div>
                    </div>
                    <div>
                        <div className="text-xs uppercase tracking-wider text-muted mb-2">Team</div>
                        <div className="text-sm font-medium">Upendra, Sukanya Basu</div>
                    </div>
                    <div>
                        <div className="text-xs uppercase tracking-wider text-muted mb-2">Duration</div>
                        <div className="text-sm font-medium">Feb - Mar 2019 (1.5 month)</div>
                    </div>
                </div>

                <div className="mt-12 bg-panel rounded-3xl p-8 border border-line">
                    <h3 className="font-bold text-lg mb-4">Context</h3>
                    <p className="text-muted leading-relaxed">
                        Hiver is an email management tool that and allows team inboxes to streamline their workflow. In businesses, shared mailboxes help teams by enabling them to share their responsibilities on emails (support@, info@, etc.).
                    </p>
                </div>

                {/* Hero Image */}
                <div className="mt-12 w-full rounded-2xl overflow-hidden border border-line">
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
                <div className="flex items-center gap-4">
                    <span className="h-px w-12 bg-accent"></span>
                    <h2 className="font-display font-bold text-3xl">How it all started?</h2>
                </div>
                
                <p className="text-muted leading-relaxed text-lg">
                    Hiver was built from day one to blend in with the native Gmail UI, ensuring that there is minimal friction during adoption and teams can hit the ground running with zero to minimal onboarding/training.
                </p>

                <p className="text-muted leading-relaxed text-lg">
                    While Gmail was never an outdated product, in April 2018, Google announced a comprehensive redesign of Gmail. Gmail's redesign gave us a chance to go back to the drawing board and redesign Hiver from the ground up as well and take a step in the direction of making Hiver work better for businesses.
                </p>
            </section>

            {/* WHY REDESIGN */}
            <section id="why-redesign" className="space-y-8 scroll-mt-32">
                <div className="flex items-center gap-4">
                    <span className="h-px w-12 bg-accent"></span>
                    <h2 className="font-display font-bold text-3xl">Why redesign?</h2>
                </div>
                
                <p className="text-muted leading-relaxed text-lg mb-6">
                    Hiver's redesign was driven by two factors:
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-panel p-6 rounded-2xl border border-line">
                        <p className="text-muted leading-relaxed">
                            Help teams become more productive and collaborative using email.
                        </p>
                    </div>
                    <div className="bg-panel p-6 rounded-2xl border border-line">
                        <p className="text-muted leading-relaxed">
                            Help Hiver carve out a unique identity for itself within the Gmail ecosystem while delivering moments of delight to all our users.
                        </p>
                    </div>
                </div>

                <div className="bg-panel p-6 rounded-2xl border border-line">
                    <p className="text-xl font-medium text-ink">
                        In the fewest words: Minimal — Usable — Scalable
                    </p>
                </div>
            </section>

            {/* REDESIGN PROCESS */}
            <section id="redesign-process" className="space-y-8 scroll-mt-32">
                <div className="flex items-center gap-4">
                    <span className="h-px w-12 bg-accent"></span>
                    <h2 className="font-display font-bold text-3xl">The Redesign Process</h2>
                </div>
            </section>

            {/* UNIFIED INTERFACE */}
            <section id="unified-interface" className="space-y-8 scroll-mt-32">
                <div className="flex items-center gap-4">
                    <span className="h-px w-12 bg-accent"></span>
                    <h2 className="font-display font-bold text-3xl">1. A Unified Interface</h2>
                </div>
                
                <p className="text-muted leading-relaxed text-lg">
                    Since Hiver sits within Gmail, the product design team's first challenge was that we had to reflect Hiver's identity while keeping in mind Gmail's constraints.
                </p>

                <p className="text-muted leading-relaxed text-lg">
                    To do a full UI revamp and provide a seamless experience, we had to begin defining a new visual style. We had to revisit and rethink the colour palette, typography, icon library, and all other components. We began by creating a new and more comprehensive style guide.
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="w-full rounded-2xl overflow-hidden border border-line">
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
                    <div className="w-full rounded-2xl overflow-hidden border border-line">
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

                <div className="w-full rounded-2xl overflow-hidden border border-line">
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
            </section>

            {/* COMPONENT REDESIGN */}
            <section id="component-redesign" className="space-y-8 scroll-mt-32">
                <div className="flex items-center gap-4">
                    <span className="h-px w-12 bg-accent"></span>
                    <h2 className="font-display font-bold text-3xl">2. Component-wise Redesign</h2>
                </div>
                
                <p className="text-muted leading-relaxed text-lg">
                    Hiver is a feature-rich product. Despite that, we've always kept our interface extremely simple and minimal. Rolling out a full UI/UX revamp to all of the Hiver features might confuse our users and throw them off. We decided to begin by first shipping only the new UI with micro-interactions, and then gradually shipping other interaction changes over the next few updates. So, rest assured, we have a lot of exciting updates planned.
                </p>
            </section>

            {/* LEFT PANEL */}
            <section id="left-panel" className="space-y-8 scroll-mt-32">
                <div className="flex items-center gap-4">
                    <span className="h-px w-12 bg-accent"></span>
                    <h2 className="font-display font-bold text-3xl">i. The Left-Hand Side Panel</h2>
                </div>
                
                <p className="text-muted leading-relaxed text-lg">
                    We've given the left-hand side panel subtle tweaks to help differentiate it from the Gmail UI, making it easier for users to access their Hiver shared inboxes.
                </p>
            </section>

            {/* RIGHT PANEL */}
            <section id="right-panel" className="space-y-8 scroll-mt-32">
                <div className="flex items-center gap-4">
                    <span className="h-px w-12 bg-accent"></span>
                    <h2 className="font-display font-bold text-3xl">ii. The Right-Hand Side Panel</h2>
                </div>
                
                <p className="text-muted leading-relaxed text-lg">
                    The right panel is where Hiver comes into its own. The right panel is where almost all Hiver users spend most of their time delegating emails, sorting and filtering them via tags and users, viewing the activity timeline, etc. And since the primary purpose of the identity revamp was to help improve usability and make Hiver users more productive, a comprehensive redesign of the right-hand side panel was necessary.
                </p>

                <div>
                    <h3 className="font-bold text-xl mb-4">Assigning emails, changing status & adding tags</h3>
                    <p className="text-muted leading-relaxed mb-6">
                        We've added an avatar in the "Assigned to" field to make it easily recognisable to the user.
                    </p>
                    <p className="text-muted leading-relaxed mb-6">
                        The panel also gets a dash of colour and new icons to give it a personality as well as help users easily distinguish between alerts and activities of different kinds.
                    </p>
                    <div className="w-full rounded-2xl overflow-hidden border border-line">
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
                    <div className="w-full rounded-2xl overflow-hidden border border-line mt-6">
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
            </section>

            {/* ACTIVITY TIMELINE */}
            <section id="activity-timeline" className="space-y-8 scroll-mt-32">
                <div className="flex items-center gap-4">
                    <span className="h-px w-12 bg-accent"></span>
                    <h2 className="font-display font-bold text-3xl">iii. The Activity Timeline</h2>
                </div>
                
                <p className="text-muted leading-relaxed text-lg">
                    The most significant change of them all — We've redesigned the entire activity timeline to make it more organized, minimal as well as consumable.
                </p>

                <p className="text-muted leading-relaxed text-lg">
                    Activity icons are now more distinct and relevant. Why? We've redesigned our icons and infused them with colours for easy distinction and quick recall.
                </p>

                <div className="w-full rounded-2xl overflow-hidden border border-line">
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

                <div className="bg-panel p-6 rounded-2xl border border-line">
                    <h3 className="font-bold text-lg mb-3 text-ink">A card-style UI for Notes. Why?</h3>
                    <p className="text-muted leading-relaxed">
                        The old Hiver UI did not provide a clear distinction between notes and other activities. We've attempted to differentiate notes from other activities by giving them a card-style UI. This was necessary because notes are different from other activities in the sense that they are consumed in a different way — you can reply to a note, delete it, change its colour, etc. All other activities on the Hiver timeline are informational.
                    </p>
                </div>
            </section>

            {/* VISUAL DESIGN */}
            <section id="visual-design" className="space-y-8 scroll-mt-32">
                <div className="flex items-center gap-4">
                    <span className="h-px w-12 bg-accent"></span>
                    <h2 className="font-display font-bold text-3xl">Visual Design</h2>
                </div>

                <div>
                    <h3 className="font-bold text-xl mb-4">Explorations and Iterations</h3>
                    <div className="w-full rounded-2xl overflow-hidden border border-line">
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
            </section>

            {/* INTERACTION DESIGN */}
            <section id="interaction-design" className="space-y-8 scroll-mt-32 pb-20 border-t border-line pt-12">
                <div className="flex items-center gap-4">
                    <span className="h-px w-12 bg-accent"></span>
                    <h2 className="font-display font-bold text-3xl">Interaction Design</h2>
                </div>
            </section>
      </div>

      {/* --- FIXED COMPACT TOC (Right Side) --- */}
      <div 
        className="hidden xl:flex fixed right-8 top-1/2 -translate-y-1/2 flex-col items-end z-30 group pr-2"
        onMouseMove={(e) => mouseY.set(e.clientY)}
        onMouseLeave={() => mouseY.set(null)}
      >
         <nav className="flex flex-col items-end gap-3">
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

    </motion.div>
  );
};

export default HiverExperienceRedesignCaseStudy;
