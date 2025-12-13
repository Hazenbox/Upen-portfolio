import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import ThemeSwitcher from './ThemeSwitcher';

interface AgentClientConnectionsCaseStudyProps {
  onBack: () => void;
}

const sections = [
  { id: 'overview', label: 'Overview' },
  { id: 'design-process', label: 'Design Process' },
  { id: 'agent-problems', label: 'Agent Problems' },
  { id: 'research', label: 'Research' },
  { id: 'design-goals', label: 'Design Goals' },
  { id: 'approach', label: 'Approach' },
  { id: 'user-insights', label: 'User Insights' },
  { id: 'design-principles', label: 'Design Principles' },
  { id: 'visual-design', label: 'Visual Design' },
  { id: 'tracking', label: 'Tracking & Communications' },
  { id: 'results', label: 'Results' },
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

const AgentClientConnectionsCaseStudy: React.FC<AgentClientConnectionsCaseStudyProps> = ({ onBack }) => {
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
      style={{ imageRendering: 'auto' }}
    >
      {/* --- HEADER / NAV --- */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-page/80 backdrop-blur-md border-b border-line transition-all duration-300">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="text-sm font-bold tracking-wide uppercase text-ink">Agent-Client Connections</div>
            
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
                    Agent-Client<br />Connections on Compass
                </h1>
                <p className="text-xl md:text-2xl font-light text-muted leading-relaxed max-w-3xl">
                    Compass is an internet & AI-based real estate brokerage with over 26,000 agents who use best-in-class technology to serve their clients. This industry is strongly driven by relationships between the agents & clients which is our primary focus while designing effective user experiences.
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-line">
                    <div>
                        <div className="text-xs uppercase tracking-wider text-muted mb-2">Platform</div>
                        <div className="text-sm font-medium">Web</div>
                        <div className="text-sm font-medium">iOS</div>
                        <div className="text-sm font-medium">Android</div>
                    </div>
                    <div>
                        <div className="text-xs uppercase tracking-wider text-muted mb-2">Team</div>
                        <div className="text-sm font-medium">Product Designer</div>
                        <div className="text-sm text-muted">User Researcher</div>
                        <div className="text-sm text-muted">Product Manager</div>
                        <div className="text-sm text-muted">UX Copywriter</div>
                        <div className="text-sm text-muted">Web and Mobile Engineers & QA</div>
                    </div>
                    <div>
                        <div className="text-xs uppercase tracking-wider text-muted mb-2">Duration</div>
                        <div className="text-sm font-medium">2021 (10 weeks)</div>
                    </div>
                </div>

                {/* Hero Image */}
                <div className="mt-12 w-full rounded-2xl overflow-hidden border border-line">
                    <img 
                        src="/agent-client-connections-assets/eb22ff_553d71ef9b594fbf9dc4bf4c5edfe9db~mv2.jpg" 
                        alt="Agent-Client Connections Cover"
                        className="w-full h-auto"
                        loading="eager"
                        style={{ imageRendering: 'auto', WebkitImageRendering: 'auto' }}
                    />
                </div>
            </section>

            {/* DESIGN PROCESS */}
            <section id="design-process" className="space-y-8 scroll-mt-32">
                <div className="flex items-center gap-4">
                    <span className="h-px w-12 bg-accent"></span>
                    <h2 className="font-display font-bold text-3xl">The Design Process</h2>
                </div>
                
                <p className="text-muted leading-relaxed text-lg">
                    I engaged in product brainstorming and strategy. Post research, the entire project was broken down into smaller pieces, designed the user flows for each scenario, and evaluated with the product partners and the overlapping teams. I presented my concepts and viewpoints to stakeholders to ensure that the best user experience was created while keeping the overall business goals in mind.
                </p>

                <div className="w-full rounded-2xl overflow-hidden border border-line">
                    <img 
                        src="/agent-client-connections-assets/process.jpg" 
                        alt="Design Process"
                        className="w-full h-auto"
                        loading="lazy"
                        style={{ 
                            imageRendering: '-webkit-optimize-contrast',
                            WebkitImageRendering: '-webkit-optimize-contrast',
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

            {/* AGENT PROBLEMS */}
            <section id="agent-problems" className="space-y-8 scroll-mt-32">
                <div className="flex items-center gap-4">
                    <span className="h-px w-12 bg-accent"></span>
                    <h2 className="font-display font-bold text-3xl">Agent Problems</h2>
                </div>
                
                <p className="text-muted leading-relaxed text-lg">
                    When a client hires a brokerage, they are really hiring the agent. By nurturing their relationships and having visibility into their clients' activity on the Compass platform, our agents can better understand the needs of their clients and in turn, provide the best experience possible for them.
                </p>

                <div className="bg-red-500/5 border border-red-500/20 p-8 rounded-2xl">
                    <p className="text-lg font-medium leading-relaxed text-ink/90 mb-4">
                        We wanted to solve two core problems in the above zone:
                    </p>
                    <div className="space-y-4">
                        <div>
                            <p className="text-muted leading-relaxed">
                                <span className="font-semibold text-ink">Problem 1:</span> Agents representing buyers want their prospective and active clients to have a (branded) experience on Compass to prevent any loss of business from clients being exposed to other agents while browsing on the platform.
                            </p>
                        </div>
                        <div>
                            <p className="text-muted leading-relaxed">
                                <span className="font-semibold text-ink">Problem 2:</span> Today, the only way that agents can understand their clients' activity (like search criteria, type of listings that a client has saved, etc.) is by sharing a Collection with the client, which is an online collection of listings that matches the client's home buying criteria. Agents do not want to solely rely on Collections to track client activity.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-panel p-6 rounded-2xl border border-line">
                    <p className="text-ink font-semibold text-lg">
                        1,637 agents reported it as a need.
                    </p>
                </div>

                <div className="w-full rounded-2xl overflow-hidden border border-line">
                    <img 
                        src="/agent-client-connections-assets/eb22ff_3250abd975f2464e82c6992eaa15047d~mv2.jpg" 
                        alt="Agent Problems"
                        className="w-full h-auto"
                        loading="lazy"
                        style={{ 
                            imageRendering: '-webkit-optimize-contrast',
                            WebkitImageRendering: '-webkit-optimize-contrast',
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

            {/* RESEARCH */}
            <section id="research" className="space-y-12 scroll-mt-32">
                <div className="flex items-center gap-4">
                    <span className="h-px w-12 bg-accent"></span>
                    <h2 className="font-display font-bold text-3xl">Research</h2>
                </div>

                <div className="space-y-8">
                    <div>
                        <h3 className="font-bold text-xl mb-4">Understanding Agent Needs</h3>
                        <p className="text-muted leading-relaxed mb-6">
                            In order to get a better understanding of the agent needs, behaviors and motivations, I sifted through a bunch of comments and feature requests by our agents on Canny.io (At Compass, we capture feedback from our agents on canny.io), and further categorized them under buckets, and highlighted them in terms of importance. This was some crucial feedback that helped me identify various pain points and areas of improvement.
                        </p>
                        <div className="w-full rounded-2xl overflow-hidden border border-line">
                            <img 
                                src="/agent-client-connections-assets/eb22ff_ab1051a322b24284868edb045429e4bc~mv2.jpg" 
                                alt="Example of branding"
                                className="w-full h-auto"
                                loading="lazy"
                                style={{ 
                            imageRendering: '-webkit-optimize-contrast',
                            WebkitImageRendering: '-webkit-optimize-contrast',
                            maxWidth: '100%',
                            height: 'auto',
                            display: 'block'
                        }}
                        onError={(e) => {
                            console.error('Image failed to load:', e.currentTarget.src);
                        }}
                            />
                        </div>
                    </div>

                    <div>
                        <h3 className="font-bold text-xl mb-4">Agents' Jobs to be Done</h3>
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="bg-panel p-6 rounded-2xl border border-line">
                                <div className="font-bold text-lg mb-3 text-ink">Branded experience</div>
                                <p className="text-sm text-muted leading-relaxed">
                                    Clients should be able to see only branded agent's information across the platform.
                                </p>
                            </div>
                            <div className="bg-panel p-6 rounded-2xl border border-line">
                                <div className="font-bold text-lg mb-3 text-ink">Invite & connect</div>
                                <p className="text-sm text-muted leading-relaxed">
                                    Agents need new and easy methods to invite clients onto the Compass platform and connect with them.
                                </p>
                            </div>
                            <div className="bg-panel p-6 rounded-2xl border border-line">
                                <div className="font-bold text-lg mb-3 text-ink">Track activity</div>
                                <p className="text-sm text-muted leading-relaxed">
                                    Agents want easy ways to track the client's activity like search activity, saved properties, etc.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-bold text-xl mb-4">Product Audit</h3>
                        <p className="text-muted leading-relaxed mb-6">
                            In order to understand how agents collaborate with their clients, I started auditing the user flows of all our different features. <span className="font-semibold text-ink">I identified 14 different touchpoints!</span> This exercise helped us determine the design elements that fit in all these cases.
                        </p>
                        <div className="w-full rounded-2xl overflow-hidden border border-line">
                            <img 
                                src="/agent-client-connections-assets/LFR_matrix.png" 
                                alt="Product Audit - 14 touchpoints"
                                className="w-full h-auto"
                                loading="lazy"
                                style={{ 
                            imageRendering: '-webkit-optimize-contrast',
                            WebkitImageRendering: '-webkit-optimize-contrast',
                            maxWidth: '100%',
                            height: 'auto',
                            display: 'block'
                        }}
                        onError={(e) => {
                            console.error('Image failed to load:', e.currentTarget.src);
                        }}
                            />
                        </div>
                    </div>

                    <div>
                        <h3 className="font-bold text-xl mb-4">Competitive Analysis</h3>
                        <div className="bg-panel p-8 rounded-2xl border border-line mb-6">
                            <h4 className="font-semibold text-lg mb-4 text-ink">Takeaways</h4>
                            <ul className="space-y-3 text-muted">
                                <li className="flex items-start gap-3">
                                    <span className="text-accent mt-1">•</span>
                                    <span>It's not a one-size-fits-all solution. Everyone has different business goals.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-accent mt-1">•</span>
                                    <span>Branding touchpoints vary based on the business strategy.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-accent mt-1">•</span>
                                    <span>Easy to access the branded agent's contact info.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-accent mt-1">•</span>
                                    <span>Clients can connect with only one agent on most platforms and can't find other agents in the branded state.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-accent mt-1">•</span>
                                    <span>Connection management mechanisms have different access points and patterns.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-accent mt-1">•</span>
                                    <span>Contact call-to-actions, nomenclature, and labels vary</span>
                                </li>
                            </ul>
                        </div>
                        <div className="w-full rounded-2xl overflow-hidden border border-line">
                            <img 
                                src="/agent-client-connections-assets/eb22ff_6e0305a37a384497a4add495220c4842~mv2.jpg" 
                                alt="Competitive Analysis"
                                className="w-full h-auto"
                                loading="lazy"
                                style={{ 
                            imageRendering: '-webkit-optimize-contrast',
                            WebkitImageRendering: '-webkit-optimize-contrast',
                            maxWidth: '100%',
                            height: 'auto',
                            display: 'block'
                        }}
                        onError={(e) => {
                            console.error('Image failed to load:', e.currentTarget.src);
                        }}
                            />
                        </div>
                    </div>

                    <div>
                        <h3 className="font-bold text-xl mb-4">User Flows</h3>
                        <p className="text-muted leading-relaxed mb-6">
                            Compass is a super app for real estate agents, and therefore a lot of features and complexities exist. With these, I uncovered all corner cases and collaboration points with different teams in the design process. It also helped engineers understand all the user scenarios and build their APIs in the earlier stages.
                        </p>
                        <div className="w-full rounded-2xl overflow-hidden border border-line">
                            <img 
                                src="/agent-client-connections-assets/collabaration.png" 
                                alt="User Flows and Collaboration"
                                className="w-full h-auto"
                                loading="lazy"
                                style={{ 
                            imageRendering: '-webkit-optimize-contrast',
                            WebkitImageRendering: '-webkit-optimize-contrast',
                            maxWidth: '100%',
                            height: 'auto',
                            display: 'block'
                        }}
                        onError={(e) => {
                            console.error('Image failed to load:', e.currentTarget.src);
                        }}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* DESIGN GOALS */}
            <section id="design-goals" className="space-y-8 scroll-mt-32">
                <div className="flex items-center gap-4">
                    <span className="h-px w-12 bg-accent"></span>
                    <h2 className="font-display font-bold text-3xl">Design Goals</h2>
                </div>
                
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-panel p-8 rounded-2xl border border-line">
                        <div className="font-bold text-xl mb-4 text-ink">Help Agents</div>
                        <p className="text-muted leading-relaxed">
                            Easily invite clients and track their activity.
                        </p>
                    </div>
                    <div className="bg-panel p-8 rounded-2xl border border-line">
                        <div className="font-bold text-xl mb-4 text-ink">Help Clients</div>
                        <p className="text-muted leading-relaxed">
                            Easily contact and collaborate with their agent.
                        </p>
                    </div>
                    <div className="bg-panel p-8 rounded-2xl border border-line">
                        <div className="font-bold text-xl mb-4 text-ink">Help Compass</div>
                        <p className="text-muted leading-relaxed">
                            Increase the agent and client retention → Better business
                        </p>
                    </div>
                </div>

                <div className="bg-panel p-6 rounded-2xl border border-line">
                    <p className="text-muted leading-relaxed">
                        <span className="font-semibold text-ink">💯 Virtual</span> It was fun and good learning by collaborating with people from cross-functional teams
                    </p>
                    <p className="text-muted leading-relaxed mt-4">
                        It was a massive collaborative project that spread across different parts of the platform. I'm the only person working from India, all my counterparts were located in New York and Washington.
                    </p>
                </div>
            </section>

            {/* APPROACH */}
            <section id="approach" className="space-y-12 scroll-mt-32">
                <div className="flex items-center gap-4">
                    <span className="h-px w-12 bg-accent"></span>
                    <h2 className="font-display font-bold text-3xl">Approach</h2>
                </div>

                <div className="w-full rounded-2xl overflow-hidden border border-line mb-8">
                    <img 
                        src="/agent-client-connections-assets/Approach.jpg" 
                        alt="Approach"
                        className="w-full h-auto"
                        loading="lazy"
                        style={{ 
                            imageRendering: '-webkit-optimize-contrast',
                            WebkitImageRendering: '-webkit-optimize-contrast',
                            maxWidth: '100%',
                            height: 'auto',
                            display: 'block'
                        }}
                        onError={(e) => {
                            console.error('Image failed to load:', e.currentTarget.src);
                        }}
                    />
                </div>

                <div className="space-y-12">
                    <div>
                        <h3 className="font-bold text-2xl mb-6">1. Temporary Branding</h3>
                        <p className="text-muted leading-relaxed mb-6 text-lg">
                            Invite a client to Compass via any of the following methods:
                        </p>
                        <ul className="space-y-3 mb-6">
                            <li className="flex items-start gap-3 text-muted">
                                <span className="text-accent mt-1">•</span>
                                <span>Share a Listing</span>
                            </li>
                            <li className="flex items-start gap-3 text-muted">
                                <span className="text-accent mt-1">•</span>
                                <span>Share a Public Collection</span>
                            </li>
                            <li className="flex items-start gap-3 text-muted">
                                <span className="text-accent mt-1">•</span>
                                <span>Invite to a Saved Search</span>
                            </li>
                            <li className="flex items-start gap-3 text-muted">
                                <span className="text-accent mt-1">•</span>
                                <span>Share your branded Bridge Loans, Concierge, or Private Exclusive URLs</span>
                            </li>
                            <li className="flex items-start gap-3 text-muted">
                                <span className="text-accent mt-1">•</span>
                                <span>Paid social media ad</span>
                            </li>
                        </ul>
                        <p className="text-muted leading-relaxed">
                            When a user accesses Compass via one of the five options above, only the agent's branding and contact information will appear on Compass for that session. All forms will be branded on behalf of the agent and routed directly to them. When a form is submitted, if the contact did not previously exist in the agent CRM, a new contact will be created.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-bold text-2xl mb-6">2. Permanent Branding & Activity Tracking</h3>
                        <p className="text-muted leading-relaxed mb-6 text-lg">
                            Agents will have the ability to create permanent connections and track the client's activity by:
                        </p>
                        <ul className="space-y-3 mb-6">
                            <li className="flex items-start gap-3 text-muted">
                                <span className="text-accent mt-1">•</span>
                                <span>Sending a Welcome Invite from the CRM</span>
                            </li>
                            <li className="flex items-start gap-3 text-muted">
                                <span className="text-accent mt-1">•</span>
                                <span>Invite to a Private Collection</span>
                            </li>
                            <li className="flex items-start gap-3 text-muted">
                                <span className="text-accent mt-1">•</span>
                                <span>Mobile invite</span>
                            </li>
                        </ul>
                        <p className="text-muted leading-relaxed mb-4">
                            Once the client has signed up/in after receiving any of the above invites, the agent will be permanently connected to the client. The client will only see the agent's branding from device to device.
                        </p>
                        <p className="text-muted leading-relaxed">
                            Once a client is connected to an agent, the agent will have the ability to view client activity on any device, including viewed listings and searches queried.
                        </p>
                    </div>
                </div>
            </section>

            {/* USER INSIGHTS */}
            <section id="user-insights" className="space-y-8 scroll-mt-32">
                <div className="flex items-center gap-4">
                    <span className="h-px w-12 bg-accent"></span>
                    <h2 className="font-display font-bold text-3xl">User Interviews Insights</h2>
                </div>

                <div className="w-full rounded-2xl overflow-hidden border border-line mb-6">
                    <img 
                        src="/agent-client-connections-assets/Agent_quotes.png" 
                        alt="User Interview Insights"
                        className="w-full h-auto"
                        loading="lazy"
                        style={{ 
                            imageRendering: '-webkit-optimize-contrast',
                            WebkitImageRendering: '-webkit-optimize-contrast',
                            maxWidth: '100%',
                            height: 'auto',
                            display: 'block'
                        }}
                        onError={(e) => {
                            console.error('Image failed to load:', e.currentTarget.src);
                        }}
                    />
                </div>

                <div className="bg-panel p-8 rounded-2xl border border-line">
                    <div className="space-y-4">
                        <div>
                            <p className="font-semibold text-ink mb-2">Clients:</p>
                            <p className="text-muted leading-relaxed">
                                "I don't want to bound with only one agent when I just started searching for homes. I will be talking to multiple agents before I commit working with one."
                            </p>
                        </div>
                        <div>
                            <p className="font-semibold text-ink mb-2">Agents:</p>
                            <p className="text-muted leading-relaxed">
                                "I want my clients to be in my branded experience. But, I don't want to spend time managing connections manually."
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* DESIGN PRINCIPLES */}
            <section id="design-principles" className="space-y-8 scroll-mt-32">
                <div className="flex items-center gap-4">
                    <span className="h-px w-12 bg-accent"></span>
                    <h2 className="font-display font-bold text-3xl">Design Principles</h2>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-panel p-6 rounded-2xl border border-line">
                        <p className="text-muted leading-relaxed">
                            <span className="font-semibold text-ink block mb-2">Be nuanced on nomenclature</span>
                            for prospective and active clients
                        </p>
                    </div>
                    <div className="bg-panel p-6 rounded-2xl border border-line">
                        <p className="text-muted leading-relaxed">
                            <span className="font-semibold text-ink block mb-2">Offer frictionless mechanisms</span>
                            to opt-in and out of agent branding
                        </p>
                    </div>
                    <div className="bg-panel p-6 rounded-2xl border border-line">
                        <p className="text-muted leading-relaxed">
                            <span className="font-semibold text-ink block mb-2">Take advantage of mobile native patterns</span>
                        </p>
                    </div>
                </div>
            </section>

            {/* VISUAL DESIGN */}
            <section id="visual-design" className="space-y-12 scroll-mt-32">
                <div className="flex items-center gap-4">
                    <span className="h-px w-12 bg-accent"></span>
                    <h2 className="font-display font-bold text-3xl">Visual Design</h2>
                </div>

                <div className="w-full rounded-2xl overflow-hidden border border-line mb-8">
                    <img 
                        src="/agent-client-connections-assets/visual_design.png" 
                        alt="Visual Design"
                        className="w-full h-auto"
                        loading="lazy"
                        style={{ 
                            imageRendering: '-webkit-optimize-contrast',
                            WebkitImageRendering: '-webkit-optimize-contrast',
                            maxWidth: '100%',
                            height: 'auto',
                            display: 'block'
                        }}
                        onError={(e) => {
                            console.error('Image failed to load:', e.currentTarget.src);
                        }}
                    />
                </div>

                <div className="space-y-12">
                    <div>
                        <h3 className="font-bold text-xl mb-4">Agent Problem 1:</h3>
                        <p className="text-muted leading-relaxed mb-6">
                            Agents want their clients to see only them as the only agent to prevent loss of business to their competition. We figured out the significant touchpoints for clients. The critical elements in the agent branding are the agent's avatar, name, and contact information.
                        </p>
                        <div className="space-y-6">
                            <div>
                                <h4 className="font-semibold text-lg mb-3 text-ink">Agent flow: while sharing a listing with the client</h4>
                                <div className="w-full rounded-2xl overflow-hidden border border-line">
                                    <img 
                                        src="/agent-client-connections-assets/eb22ff_afca11a64d9f4055b0e9842c92dc06ab~mv2.jpg" 
                                        alt="Agent flow - sharing listing"
                                        className="w-full h-auto"
                                        loading="lazy"
                                        style={{ 
                            imageRendering: '-webkit-optimize-contrast',
                            WebkitImageRendering: '-webkit-optimize-contrast',
                            maxWidth: '100%',
                            height: 'auto',
                            display: 'block'
                        }}
                        onError={(e) => {
                            console.error('Image failed to load:', e.currentTarget.src);
                        }}
                                    />
                                </div>
                            </div>
                            <div>
                                <h4 className="font-semibold text-lg mb-3 text-ink">Client experience</h4>
                                <div className="w-full rounded-2xl overflow-hidden border border-line">
                                    <img 
                                        src="/agent-client-connections-assets/eb22ff_ecb025e1985043baa08b193361204731~mv2.jpg" 
                                        alt="Client experience"
                                        className="w-full h-auto"
                                        loading="lazy"
                                        style={{ 
                            imageRendering: '-webkit-optimize-contrast',
                            WebkitImageRendering: '-webkit-optimize-contrast',
                            maxWidth: '100%',
                            height: 'auto',
                            display: 'block'
                        }}
                        onError={(e) => {
                            console.error('Image failed to load:', e.currentTarget.src);
                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-bold text-xl mb-4">Agent Problem 2: Easy ways to invite and connect with clients</h3>
                        <p className="text-muted leading-relaxed mb-6">
                            Apart from collections invite, two more invitation mechanisms exist in the system. Instead of introducing a new way, we leveraged these methods to establish a connection between agent-client.
                        </p>
                        <div className="space-y-4 mb-6">
                            <div className="bg-panel p-4 rounded-xl border border-line">
                                <p className="text-muted">
                                    <span className="font-semibold text-ink">1. CRM invite:</span> An agent can add a contact on the Compass CRM and send an invitation email.
                                </p>
                            </div>
                            <div className="bg-panel p-4 rounded-xl border border-line">
                                <p className="text-muted">
                                    <span className="font-semibold text-ink">2. Mobile invite:</span> An agent can share a mobile app download link with clients to invite them to the Compass platform via mobile app.
                                </p>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <h4 className="font-semibold text-lg mb-3 text-ink">Agent experience</h4>
                                <div className="w-full rounded-2xl overflow-hidden border border-line">
                                    <img 
                                        src="/agent-client-connections-assets/eb22ff_f5a09bebbf4d4efdacc718fec88d0aa8~mv2.jpg" 
                                        alt="Agent experience"
                                        className="w-full h-auto"
                                        loading="lazy"
                                        style={{ 
                            imageRendering: '-webkit-optimize-contrast',
                            WebkitImageRendering: '-webkit-optimize-contrast',
                            maxWidth: '100%',
                            height: 'auto',
                            display: 'block'
                        }}
                        onError={(e) => {
                            console.error('Image failed to load:', e.currentTarget.src);
                        }}
                                    />
                                </div>
                            </div>
                            <div>
                                <h4 className="font-semibold text-lg mb-3 text-ink">Client experience</h4>
                                <div className="w-full rounded-2xl overflow-hidden border border-line">
                                    <img 
                                        src="/agent-client-connections-assets/Users.jpg" 
                                        alt="Client experience"
                                        className="w-full h-auto"
                                        loading="lazy"
                                        style={{ 
                            imageRendering: '-webkit-optimize-contrast',
                            WebkitImageRendering: '-webkit-optimize-contrast',
                            maxWidth: '100%',
                            height: 'auto',
                            display: 'block'
                        }}
                        onError={(e) => {
                            console.error('Image failed to load:', e.currentTarget.src);
                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* TRACKING */}
            <section id="tracking" className="space-y-8 scroll-mt-32">
                <div className="flex items-center gap-4">
                    <span className="h-px w-12 bg-accent"></span>
                    <h2 className="font-display font-bold text-3xl">Tracking Client Activity & Communications</h2>
                </div>

                <p className="text-muted leading-relaxed text-lg">
                    We enabled agents to track the client's activity once connected with them via the above invitation mechanisms. The agent will be notified when a client takes any actions on the platform. For example, agents will be notified when a client views a listing, saves a property, or performs a search.
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="w-full rounded-2xl overflow-hidden border border-line">
                        <img 
                            src="/agent-client-connections-assets/mobile_activity.png" 
                            alt="Mobile Activity Tracking"
                            className="w-full h-auto"
                            loading="lazy"
                            style={{ 
                            imageRendering: '-webkit-optimize-contrast',
                            WebkitImageRendering: '-webkit-optimize-contrast',
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
                            src="/agent-client-connections-assets/Email_notification.jpg" 
                            alt="Email Notifications"
                            className="w-full h-auto"
                            loading="lazy"
                            style={{ 
                            imageRendering: '-webkit-optimize-contrast',
                            WebkitImageRendering: '-webkit-optimize-contrast',
                            maxWidth: '100%',
                            height: 'auto',
                            display: 'block'
                        }}
                        onError={(e) => {
                            console.error('Image failed to load:', e.currentTarget.src);
                        }}
                        />
                    </div>
                </div>

                <div className="w-full rounded-2xl overflow-hidden border border-line">
                    <img 
                        src="/agent-client-connections-assets/eb22ff_98484b1f2fe9442490db3e8b63094147~mv2.jpg" 
                        alt="Activity Tracking Details"
                        className="w-full h-auto"
                        loading="lazy"
                        style={{ 
                            imageRendering: '-webkit-optimize-contrast',
                            WebkitImageRendering: '-webkit-optimize-contrast',
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

            {/* RESULTS */}
            <section id="results" className="space-y-12 scroll-mt-32 pb-20 border-t border-line pt-12">
                <div className="flex items-center gap-4">
                    <span className="h-px w-12 bg-accent"></span>
                    <h2 className="font-display font-bold text-3xl">Results</h2>
                </div>

                <div>
                    <h3 className="font-bold text-xl mb-6">Agents' Feedback via NPS</h3>
                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                        <div className="w-full rounded-2xl overflow-hidden border border-line">
                            <img 
                                src="/agent-client-connections-assets/Agents feedback chart.png" 
                                alt="Agents Feedback Chart"
                                className="w-full h-auto"
                                loading="lazy"
                                style={{ 
                            imageRendering: '-webkit-optimize-contrast',
                            WebkitImageRendering: '-webkit-optimize-contrast',
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
                                src="/agent-client-connections-assets/Agents feedback chart 3.png" 
                                alt="Agents Feedback Chart 3"
                                className="w-full h-auto"
                                loading="lazy"
                                style={{ 
                            imageRendering: '-webkit-optimize-contrast',
                            WebkitImageRendering: '-webkit-optimize-contrast',
                            maxWidth: '100%',
                            height: 'auto',
                            display: 'block'
                        }}
                        onError={(e) => {
                            console.error('Image failed to load:', e.currentTarget.src);
                        }}
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-panel to-page p-8 md:p-12 rounded-3xl border border-line">
                    <h3 className="font-bold text-2xl mb-8 text-ink">Agents - Results</h3>
                    <div className="w-full rounded-2xl overflow-hidden border border-line mb-8">
                        <img 
                            src="/agent-client-connections-assets/eb22ff_615497e0ef3d4392a70b43b0926cf95d~mv2.jpg" 
                            alt="Agents Results"
                            className="w-full h-auto"
                            loading="lazy"
                            style={{ 
                            imageRendering: '-webkit-optimize-contrast',
                            WebkitImageRendering: '-webkit-optimize-contrast',
                            maxWidth: '100%',
                            height: 'auto',
                            display: 'block'
                        }}
                        onError={(e) => {
                            console.error('Image failed to load:', e.currentTarget.src);
                        }}
                        />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-panel to-page p-8 md:p-12 rounded-3xl border border-line">
                    <h3 className="font-bold text-2xl mb-8 text-ink">Clients - Results</h3>
                    <div className="w-full rounded-2xl overflow-hidden border border-line mb-8">
                        <img 
                            src="/agent-client-connections-assets/Screenshot 2022-06-27 at 12_34_16 AM.png" 
                            alt="Clients Results"
                            className="w-full h-auto"
                            loading="lazy"
                            style={{ 
                            imageRendering: '-webkit-optimize-contrast',
                            WebkitImageRendering: '-webkit-optimize-contrast',
                            maxWidth: '100%',
                            height: 'auto',
                            display: 'block'
                        }}
                        onError={(e) => {
                            console.error('Image failed to load:', e.currentTarget.src);
                        }}
                        />
                    </div>
                    <div className="space-y-4 text-muted">
                        <p className="leading-relaxed">
                            Based on the retention numbers below, connected clients are <span className="font-bold text-ink text-lg">57% more likely</span> to continue using Compass than non-branded consumers.
                        </p>
                        <p className="leading-relaxed">
                            Connected clients are <span className="font-bold text-ink text-lg">68% more likely</span> to keep using Compass than non-connected clients by the fourth month.
                        </p>
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

export default AgentClientConnectionsCaseStudy;
