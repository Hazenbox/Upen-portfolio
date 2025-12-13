import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import ThemeSwitcher from './ThemeSwitcher';

interface HiverCaseStudyProps {
  onBack: () => void;
}

const sections = [
  { id: 'overview', label: 'Overview' },
  { id: 'problem', label: 'Problem Statement' },
  { id: 'research', label: 'Research' },
  { id: 'use-cases', label: 'Use Cases' },
  { id: 'competitive-analysis', label: 'Competitive Analysis' },
  { id: 'metrics', label: 'Metrics' },
  { id: 'design', label: 'Design Evolution' },
  { id: 'final', label: 'Final Experience' },
  { id: 'design-challenges', label: 'Design Challenges' },
  { id: 'usability-testing', label: 'Usability Testing' },
  { id: 'developer-handoff', label: 'Developer Handoff' },
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
    
    // Initial and on resize/scroll
    updateBounds();
    window.addEventListener('resize', updateBounds);
    window.addEventListener('scroll', updateBounds); 
    return () => {
        window.removeEventListener('resize', updateBounds);
        window.removeEventListener('scroll', updateBounds);
    }
  }, []);

  const distance = useTransform(mouseY, (val: number) => {
    if (val === null) return 1000; // Far away
    const center = bounds.y + bounds.height / 2;
    return val - center;
  });

  // Base dimensions
  const baseWidth = isActive ? 32 : 12;
  const hoverWidth = 48; // Max width on hover
  
  // Transform distance to dimensions
  // Range: [-120, 0, 120] -> [base, hover, base]
  const rawWidth = useTransform(distance, [-120, 0, 120], [baseWidth, hoverWidth, baseWidth]);
  const rawHeight = useTransform(distance, [-120, 0, 120], [2, 6, 2]);
  const rawOpacity = useTransform(distance, [-120, 0, 120], [isActive ? 1 : 0.3, 1, isActive ? 1 : 0.3]);

  // Smooth springs
  const width = useSpring(rawWidth, { mass: 0.1, stiffness: 150, damping: 12 });
  const height = useSpring(rawHeight, { mass: 0.1, stiffness: 150, damping: 12 });
  const opacity = useSpring(rawOpacity, { mass: 0.1, stiffness: 150, damping: 12 });

  return (
    <button 
      ref={ref}
      onClick={onClick}
      className="flex items-center gap-4 py-2 group/item outline-none"
    >
        {/* Label - Reveals on Parent Group Hover */}
        <span className={`
            text-xs font-medium transition-all duration-300 transform
            opacity-0 translate-x-4 group-hover:translate-x-0 group-hover:opacity-100
            ${isActive ? 'text-ink' : 'text-muted group-hover/item:text-ink'}
        `}>
            {section.label}
        </span>
        
        {/* Scale Line */}
        <motion.div 
            style={{ width, height, opacity }} 
            className={`rounded-full ${isActive ? 'bg-accent' : 'bg-muted'}`}
        />
    </button>
  );
};

const HiverCaseStudy: React.FC<HiverCaseStudyProps> = ({ onBack }) => {
  const [activeSection, setActiveSection] = useState('overview');
  const [scrollProgress, setScrollProgress] = useState(0);
  const mouseY = useMotionValue(null);

  // Scroll Spy & Progress
  useEffect(() => {
    const handleScroll = () => {
      // Update Scroll Progress
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = scrollTop / docHeight;
      setScrollProgress(Math.min(Math.max(scrollPercent, 0), 1));
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Intersection Observer for Active Section
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

  const circumference = 2 * Math.PI * 18; // r=18

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
            {/* Title (Left) */}
            <div className="text-sm font-bold tracking-wide uppercase text-ink">Hiver Analytics</div>
            
            <div className="flex items-center gap-4">
                {/* Mobile Theme Switcher (Hidden on Desktop) */}
                <div className="md:hidden">
                    <ThemeSwitcher orientation="horizontal" />
                </div>

                {/* Close Button with Progress (Right) */}
                <div className="relative w-10 h-10 flex items-center justify-center group">
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
        
            {/* HERO */}
            <section id="overview" className="space-y-8">
                <h1 className="font-display font-bold text-5xl md:text-7xl leading-tight text-ink">
                    Hiver Analytics:<br />Reports Module
                </h1>
                <p className="text-xl md:text-2xl font-light text-muted leading-relaxed max-w-3xl">
                    Leading the end-to-end design of a helpdesk analytics suite inside Gmail, enabling teams to track performance without leaving their inbox.
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-line">
                    <div>
                        <div className="text-xs uppercase tracking-wider text-muted mb-2">My Role</div>
                        <div className="text-sm font-medium">Lead Product Designer</div>
                    </div>
                    <div>
                        <div className="text-xs uppercase tracking-wider text-muted mb-2">Duration</div>
                        <div className="text-sm font-medium">12 Weeks (2020)</div>
                    </div>
                    <div>
                        <div className="text-xs uppercase tracking-wider text-muted mb-2">Team</div>
                        <div className="text-sm font-medium">PM, 7 Engineers, QA</div>
                    </div>
                    <div>
                        <div className="text-xs uppercase tracking-wider text-muted mb-2">Platform</div>
                        <div className="text-sm font-medium">Web / Chrome Ext</div>
                    </div>
                </div>

                <div className="mt-12 bg-panel rounded-3xl p-8 border border-line">
                    <h3 className="font-bold text-lg mb-4">Context</h3>
                    <p className="text-muted leading-relaxed">
                        Hiver is a customer support platform built for teams using Gmail. It allows teams to manage shared email inboxes, such as support@ or info@, directly from Gmail. With Hiver, teams can collaborate on customer queries, assign emails to team members, track performance, and ensure smooth communication without leaving the Gmail interface.
                    </p>
                </div>

                {/* Hero Image */}
                <div className="mt-12 w-full rounded-2xl overflow-hidden border border-line">
                    <img 
                        src="/hiver-analytics-assets/analytics_cover (1).webp" 
                        alt="Hiver Analytics Cover"
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

            {/* PROBLEM */}
            <section id="problem" className="space-y-8 scroll-mt-32">
                <div className="flex items-center gap-4">
                    <span className="h-px w-12 bg-accent"></span>
                    <h2 className="font-display font-bold text-3xl">Problem Statement</h2>
                </div>
                
                <p className="text-muted leading-relaxed text-lg">
                    Hiver is used by support teams, sales managers, finance teams, and many more. The primary issue was that users needed a simple yet powerful way to analyze their business data. Today, Hiver doesn't support any Analytics, users end up integrating data into google data studio kind of tools and sift through a lot of irrelevant data to make decisions. Leading to frustration and missed opportunities for quick decision-making. From a business perspective, we also needed to design features that would cater to users with different plans, providing value at every tier while incentivizing premium upgrades.
                </p>
            </section>

            {/* RESEARCH */}
            <section id="research" className="space-y-12 scroll-mt-32">
                 <div className="flex items-center gap-4">
                    <span className="h-px w-12 bg-accent"></span>
                    <h2 className="font-display font-bold text-3xl">Research</h2>
                </div>

                <p className="text-muted leading-relaxed text-lg">
                    I started by conducting extensive user research and competitive analysis to understand how current analytics tools were falling short. I interviewed users from various business roles and discovered that different user segments required different levels of dashboard customization. For example, basic users were primarily interested in at-a-glance metrics, while more advanced users wanted deep dives into complex data sets. These insights helped us define a tiered feature set, which laid the foundation for upsell opportunities by offering advanced functionalities to premium users.
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Persona 1 */}
                    <div className="bg-panel p-6 rounded-2xl border border-line">
                        <div className="font-semibold text-ink mb-2">Advanced user</div>
                        <div className="w-full rounded-xl overflow-hidden border border-line mt-4">
                            <img 
                                src="/hiver-analytics-assets/Team Manager Persona.png" 
                                alt="Team Manager Persona"
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

                    {/* Persona 2 */}
                    <div className="bg-panel p-6 rounded-2xl border border-line">
                        <div className="font-semibold text-ink mb-2">Basic user</div>
                        <div className="w-full rounded-xl overflow-hidden border border-line mt-4">
                            <img 
                                src="/hiver-analytics-assets/CX Persona-1.png" 
                                alt="CX Persona"
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

            {/* USE CASES */}
            <section id="use-cases" className="space-y-8 scroll-mt-32">
                <div className="flex items-center gap-4">
                    <span className="h-px w-12 bg-accent"></span>
                    <h2 className="font-display font-bold text-3xl">Use Cases</h2>
                </div>

                <p className="text-muted leading-relaxed text-lg">
                    Various teams require data tailored to their specific needs.
                </p>

                <p className="text-muted leading-relaxed text-lg">
                    Hiver is used by businesses across different verticals - ranging from logistics and B2B companies to educational institutions and travel brands. Hiver is found useful in multiple types of teams - support, sales, finance, and operations, to name a few.
                </p>

                <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-panel p-6 rounded-2xl border border-line">
                        <h3 className="font-bold text-lg mb-4">Support team</h3>
                        <ul className="space-y-2 text-muted text-sm">
                            <li>→ Workload on teams</li>
                            <li>→ Time taken to respond to queries</li>
                            <li>→ Time taken to resolve an issue</li>
                            <li>→ Customer satisfaction</li>
                            <li>& many more</li>
                        </ul>
                    </div>
                    <div className="bg-panel p-6 rounded-2xl border border-line">
                        <h3 className="font-bold text-lg mb-4">Travelling agency</h3>
                        <ul className="space-y-2 text-muted text-sm">
                            <li>→ No. of leads reached out</li>
                            <li>→ Time taken to close the deal</li>
                            <li>→ Type of enquiries</li>
                        </ul>
                    </div>
                    <div className="bg-panel p-6 rounded-2xl border border-line">
                        <h3 className="font-bold text-lg mb-4">University</h3>
                        <ul className="space-y-2 text-muted text-sm">
                            <li>→ Amount of journals in progress</li>
                            <li>→ Time taken to publish a journal</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* COMPETITIVE ANALYSIS */}
            <section id="competitive-analysis" className="space-y-8 scroll-mt-32">
                <div className="flex items-center gap-4">
                    <span className="h-px w-12 bg-accent"></span>
                    <h2 className="font-display font-bold text-3xl">Competitive Analysis</h2>
                </div>

                <p className="text-muted leading-relaxed text-lg">
                    Studied different reporting systems in the existing tools to observe the system behavior, navigation flows, and product design.
                </p>

                <div className="w-full rounded-2xl overflow-hidden border border-line">
                    <img 
                        src="/hiver-analytics-assets/c_analysis.png" 
                        alt="Competitive Analysis"
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

            {/* METRICS */}
            <section id="metrics" className="space-y-8 scroll-mt-32">
                <div className="flex items-center gap-4">
                    <span className="h-px w-12 bg-accent"></span>
                    <h2 className="font-display font-bold text-3xl">Metrics</h2>
                </div>

                <p className="text-muted leading-relaxed text-lg">
                    After studying the user requirements and business needs, the product team came up with a few metrics for the initial release. To serve the user needs with a simplistic experience, and also with the competitive analysis, we categorized the metrics into four different groups.
                </p>

                <div className="w-full rounded-2xl overflow-hidden border border-line">
                    <img 
                        src="/hiver-analytics-assets/Metricss.png" 
                        alt="Metrics"
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

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="w-full rounded-2xl overflow-hidden border border-line">
                        <img 
                            src="/hiver-analytics-assets/wireframing.jpg" 
                            alt="Brainstorming Sessions"
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
                            src="/hiver-analytics-assets/wireframing(1).jpg" 
                            alt="Sketches"
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

            {/* DESIGN EVOLUTION */}
            <section id="design" className="space-y-12 scroll-mt-32">
                 <div className="flex items-center gap-4">
                    <span className="h-px w-12 bg-accent"></span>
                    <h2 className="font-display font-bold text-3xl">Design Evolution</h2>
                </div>
                
                <div>
                    <h3 className="font-bold text-xl mb-4">Rapid Prototyping</h3>
                    <p className="text-muted leading-relaxed text-lg mb-6">
                        With rapid prototyping, I worked to solve high-level challenges like navigation, data visualization, and information positioning. Validated these with the stakeholders and in-house supporting team [users].
                    </p>

                    <div className="grid md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-panel p-4 rounded-xl border border-line text-center">
                            <div className="text-accent text-2xl mb-2">✔</div>
                            <div className="text-sm font-medium">Stakeholder Reviews</div>
                        </div>
                        <div className="bg-panel p-4 rounded-xl border border-line text-center">
                            <div className="text-accent text-2xl mb-2">✔</div>
                            <div className="text-sm font-medium">User Testing</div>
                        </div>
                        <div className="bg-panel p-4 rounded-xl border border-line text-center">
                            <div className="text-accent text-2xl mb-2">✔</div>
                            <div className="text-sm font-medium">Engineering Team Discussions</div>
                        </div>
                    </div>

                    <div className="bg-red-500/5 border border-red-500/20 p-6 rounded-2xl mb-8">
                        <div className="font-semibold text-ink mb-3">Feedback:</div>
                        <ul className="space-y-2 text-muted text-sm">
                            <li>• Long scroll, not so easy to navigate.</li>
                            <li>• Metrics need to be more organized.</li>
                            <li>• Some customers run their companies during business hours.</li>
                        </ul>
                    </div>
                </div>

                <div>
                    <h3 className="font-bold text-xl mb-4">v0.1</h3>
                    <div className="w-full rounded-2xl overflow-hidden border border-line mb-6">
                        <img 
                            src="/hiver-analytics-assets/Reports_V0-min.jpg" 
                            alt="Version 0.1"
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
                    <div className="bg-red-500/5 border border-red-500/20 p-6 rounded-2xl">
                        <div className="font-semibold text-ink mb-3">Feedback:</div>
                        <ul className="space-y-2 text-muted text-sm">
                            <li>• Tabs UI is not clear.</li>
                            <li>• Using different colors for graphs may not be scalable and visually a bit intrusive.</li>
                        </ul>
                    </div>
                </div>

                <div>
                    <h3 className="font-bold text-xl mb-4">v0.2</h3>
                    <div className="w-full rounded-2xl overflow-hidden border border-line mb-6">
                        <img 
                            src="/hiver-analytics-assets/Reports_v1-min.jpg" 
                            alt="Version 0.2"
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
                    <div className="bg-red-500/5 border border-red-500/20 p-6 rounded-2xl">
                        <div className="font-semibold text-ink mb-3">Feedback:</div>
                        <p className="text-muted text-sm">
                            Almost there, but horizontal tabs may not be scalable when we introduce a new set of metrics, customer reports, and dashboards.
                        </p>
                    </div>
                </div>
            </section>

            {/* FINAL EXPERIENCE */}
            <section id="final" className="space-y-12 scroll-mt-32">
                <div className="flex items-center gap-4">
                    <span className="h-px w-12 bg-accent"></span>
                    <h2 className="font-display font-bold text-3xl">Final Experience</h2>
                </div>
                
                <p className="text-muted leading-relaxed text-lg">
                    Conversations, Users, Tags, and CSAT are the overview reports through which users can get high-level information on workload and performance.
                </p>

                <div className="w-full rounded-2xl overflow-hidden border border-line">
                    <img 
                        src="/hiver-analytics-assets/Reports_v2-min.jpg" 
                        alt="Final Experience"
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

                <div className="w-full rounded-2xl overflow-hidden border border-line">
                    <img 
                        src="/hiver-analytics-assets/hiver-UI.png" 
                        alt="Hiver UI"
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

                <div className="w-full rounded-2xl overflow-hidden border border-line">
                    <img 
                        src="/hiver-analytics-assets/UI-explain.png" 
                        alt="UI Explanation"
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
            </section>

             {/* OUTCOME */}
            <section id="outcome" className="space-y-8 scroll-mt-32 pb-20 border-t border-line pt-12">
                <div className="flex items-center gap-4">
                    <span className="h-px w-12 bg-accent"></span>
                    <h2 className="font-display font-bold text-3xl">Outcome</h2>
                </div>

                <p className="text-muted leading-relaxed text-lg">
                    I was thrilled to work on this project because it brought real value to our customers and involved in-depth research and detailed interaction design. I learned a lot from collaborating with various teams and customers, with key takeaways that enhanced both product and business processes.
                </p>

                <div className="grid md:grid-cols-3 gap-6 mt-12">
                    <div className="bg-panel p-6 rounded-2xl border border-line">
                        <div className="text-3xl font-bold text-accent mb-2">40%</div>
                        <div className="text-sm text-muted">Adoption of the analytics tool grew by 40% within the first three months of the launch.</div>
                    </div>
                    <div className="bg-panel p-6 rounded-2xl border border-line">
                        <div className="text-3xl font-bold text-accent mb-2">60%</div>
                        <div className="text-sm text-muted">Over the past 6 months, 60% of our paying customers actively use the Analytics feature.</div>
                    </div>
                    <div className="bg-panel p-6 rounded-2xl border border-line">
                        <div className="text-3xl font-bold text-accent mb-2">172</div>
                        <div className="text-sm text-muted">Around 30 accounts have generated a total of 172 custom reports.</div>
                    </div>
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

export default HiverCaseStudy;