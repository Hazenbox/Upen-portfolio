import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import ThemeSwitcher from './ThemeSwitcher';

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

const IBCFranchiseCaseStudy: React.FC<IBCFranchiseCaseStudyProps> = ({ onBack }) => {
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
            <div className="text-sm font-bold tracking-wide uppercase text-ink">iB Cricket Franchise Management</div>
            
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
                    End-to-end experience design for<br />iB Cricket's franchise management system
                </h1>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-line">
                    <div>
                        <div className="text-xs uppercase tracking-wider text-muted mb-2">Platform</div>
                        <div className="text-sm font-medium">iPad - B2B</div>
                    </div>
                    <div>
                        <div className="text-xs uppercase tracking-wider text-muted mb-2">My Role</div>
                        <div className="text-sm font-medium">Solo designer</div>
                        <div className="text-sm text-muted">user research, concept ideation, interaction design, visual design, prototyping</div>
                    </div>
                    <div>
                        <div className="text-xs uppercase tracking-wider text-muted mb-2">Duration</div>
                        <div className="text-sm font-medium">Jan - Mar 2018 (10 weeks)</div>
                    </div>
                </div>

                <div className="mt-12 bg-panel rounded-3xl p-8 border border-line">
                    <h3 className="font-bold text-lg mb-4">Context</h3>
                    <p className="text-muted leading-relaxed">
                        iB Cricket is available to play for people in the franchises and they needed a technology solution to provide support to its franchisees and improve processes.
                    </p>
                </div>
            </section>

            {/* PROBLEM */}
            <section id="problem" className="space-y-8 scroll-mt-32">
                <div className="flex items-center gap-4">
                    <span className="h-px w-12 bg-accent"></span>
                    <h2 className="font-display font-bold text-3xl">Problem Statement</h2>
                </div>
                
                <p className="text-muted leading-relaxed text-lg">
                    Overseeing the growth of a business is no easy task. The franchise owners/managers are in the administrative position of needing a way to cope with the growing demand for their business. They have had to track and regulate the ongoing activities at the franchise from remote areas to ease the business flow.
                </p>

                <div className="bg-red-500/5 border border-red-500/20 p-8 rounded-2xl">
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
            </section>

            {/* DESIGN PROCESS */}
            <section id="design-process" className="space-y-8 scroll-mt-32">
                <div className="flex items-center gap-4">
                    <span className="h-px w-12 bg-accent"></span>
                    <h2 className="font-display font-bold text-3xl">The Design Process</h2>
                </div>

                <p className="text-muted leading-relaxed text-lg">
                    This is how it all started
                </p>

                <div className="w-full rounded-2xl overflow-hidden border border-line">
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
            </section>

            {/* RESEARCH */}
            <section id="research" className="space-y-12 scroll-mt-32">
                <div className="flex items-center gap-4">
                    <span className="h-px w-12 bg-accent"></span>
                    <h2 className="font-display font-bold text-3xl">Research</h2>
                </div>

                <p className="text-muted leading-relaxed text-lg">
                    The first step was to investigate the people involved with Franchise Management. How is their work day like? What are their challenges? What motivates them? How can we help make their work day better?
                </p>

                <p className="text-muted leading-relaxed text-lg">
                    Interviewed 6 people which could help me to understand the user. They are from 27-50 years old, both living alone or having their own family. There are mainly 4 aspects I want to know about the users:
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-panel p-6 rounded-2xl border border-line">
                        <div className="font-semibold text-ink mb-2">What kind of lifestyle they have?</div>
                    </div>
                    <div className="bg-panel p-6 rounded-2xl border border-line">
                        <div className="font-semibold text-ink mb-2">What do they think about franchise business?</div>
                    </div>
                    <div className="bg-panel p-6 rounded-2xl border border-line">
                        <div className="font-semibold text-ink mb-2">Are they fancy on new technology?</div>
                    </div>
                    <div className="bg-panel p-6 rounded-2xl border border-line">
                        <div className="font-semibold text-ink mb-2">What incentive would attract them to use the app?</div>
                    </div>
                </div>

                <p className="text-muted leading-relaxed text-lg">
                    After interviews and observation, I created a primary persona and figured out what kind of users would use the app and how they would use it. It helped me to develop the experience strategy.
                </p>

                <p className="text-muted leading-relaxed text-lg">
                    Eventually I developed something of an impression of them:
                </p>

                <div className="w-full rounded-2xl overflow-hidden border border-line">
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
            </section>

            {/* INFORMATION ARCHITECTURE */}
            <section id="information-architecture" className="space-y-8 scroll-mt-32">
                <div className="flex items-center gap-4">
                    <span className="h-px w-12 bg-accent"></span>
                    <h2 className="font-display font-bold text-3xl">How I organized ideas into actionable features within limited time</h2>
                </div>

                <p className="text-muted leading-relaxed text-lg">
                    This map outlines all the features, content and structure of the app. Center management, revenue summary, support, VR games, slots & rentals, offers and players are the key features. It helped me understand the scope of the project as well as the priority of feature needed in terms of communicating my vision. I was able to quickly decide on the key user flows.
                </p>

                <div className="w-full rounded-2xl overflow-hidden border border-line">
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

                <div className="bg-panel p-6 rounded-2xl border border-line">
                    <p className="text-ink font-semibold text-lg">
                        A solid blue print
                    </p>
                </div>
            </section>

            {/* WIREFRAMES */}
            <section id="wireframes" className="space-y-8 scroll-mt-32">
                <div className="flex items-center gap-4">
                    <span className="h-px w-12 bg-accent"></span>
                    <h2 className="font-display font-bold text-3xl">Wireframes</h2>
                </div>

                <p className="text-muted leading-relaxed text-lg">
                    I created detailed wireframe designs of key pages. Helped business & strategy teams to work on the prioritizations and to make accurate decisions.
                </p>

                <div className="w-full rounded-2xl overflow-hidden border border-line">
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
            </section>

            {/* DESIGN SYSTEM */}
            <section id="design-system" className="space-y-8 scroll-mt-32">
                <div className="flex items-center gap-4">
                    <span className="h-px w-12 bg-accent"></span>
                    <h2 className="font-display font-bold text-3xl">Building the Design System</h2>
                </div>

                <div className="bg-panel p-8 rounded-2xl border border-line mb-8">
                    <p className="text-xl font-medium text-ink mb-4">
                        I believe in "Great digital products are built upon solid foundations"
                    </p>
                </div>

                <p className="text-muted leading-relaxed text-lg">
                    When we started this project, we realised that it's gonna be keep on scaling with new features. iB Cricket planned to introduce a few other apps for some other requirements. Considering all these needs, projections and to maintain the brand sanity across all apps we started off building the design system.
                </p>

                <p className="text-muted leading-relaxed text-lg">
                    Design system itself a huge project to work. It was my first time working on a design system that contains more than hundreds of symbols, colours, grid systems and typography.
                </p>

                <p className="text-muted leading-relaxed text-lg">
                    I took off with existing research and looking at inspiration. Design systems like Material design, Fluent, Shopify Polaris, Atlassian, AirBnB, Salesforce Lightning Design System were already established and built solid & great products.
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="w-full rounded-2xl overflow-hidden border border-line">
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
                    <div className="w-full rounded-2xl overflow-hidden border border-line">
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
            </section>

            {/* FINAL DESIGN */}
            <section id="final-design" className="space-y-8 scroll-mt-32">
                <div className="flex items-center gap-4">
                    <span className="h-px w-12 bg-accent"></span>
                    <h2 className="font-display font-bold text-3xl">High Fidelity Mockups</h2>
                </div>

                <p className="text-muted leading-relaxed text-lg">
                    High fidelity mockups and many more...
                </p>

                <div className="w-full rounded-2xl overflow-hidden border border-line">
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
                    <h3 className="font-bold text-xl mb-4">Prototypes</h3>
                    <p className="text-muted leading-relaxed mb-6">
                        Revenue transactions of a franchise
                    </p>
                    <div className="w-full rounded-2xl overflow-hidden border border-line">
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
            </section>

            {/* OUTCOME */}
            <section id="outcome" className="space-y-8 scroll-mt-32 pb-20 border-t border-line pt-12">
                <div className="flex items-center gap-4">
                    <span className="h-px w-12 bg-accent"></span>
                    <h2 className="font-display font-bold text-3xl">Outcome</h2>
                </div>

                <p className="text-muted leading-relaxed text-lg">
                    It was really an exciting project for me to work on as it provides real value, involved a ton of research, and detailed interaction work. I learned a lot of things while building the design system and some important takeaways from this project related to product and business processes.
                </p>

                <div className="w-full rounded-2xl overflow-hidden border border-line">
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

export default IBCFranchiseCaseStudy;
