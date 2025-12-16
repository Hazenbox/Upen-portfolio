import React, { useState, useRef, useEffect, useLayoutEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { streamAIResponse, ChatMessage } from '../services/geminiService';
import { Persona, personaConfigs, personaSelectionOptions } from '../utils/personaRecommendations';
import { MOTION, prefersReducedMotion } from '../utils/chatAnimations';

// Extend Window interface for Unicorn Studio
declare global {
  interface Window {
    UnicornStudio?: {
      isInitialized: boolean;
      init?: () => void;
      scan?: () => void;
    };
  }
}

// State machine type
type AIChatState = 'fab' | 'opening' | 'open' | 'closing';

// Reusable Orb Component - Persistent, never unmounts
const AnimatedOrb: React.FC<{ 
  size?: number; 
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}> = ({ size = 70, className = '', onClick, style }) => {
  const orbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = orbRef.current;
    if (!container) return;

    // Check if container is visible and has dimensions before initializing
    const checkVisibility = () => {
      const rect = container.getBoundingClientRect();
      const isVisible = rect.width > 0 && rect.height > 0 && 
                       window.getComputedStyle(container).display !== 'none' &&
                       window.getComputedStyle(container).visibility !== 'hidden' &&
                       window.getComputedStyle(container).opacity !== '0';
      return isVisible;
    };

    // Use local JSON file instead of embed ID
    container.setAttribute('data-us-project-src', '/orb-small.json');
    // Disable mouse tracking/interactivity
    container.setAttribute('data-us-disablemouse', 'true');
    container.style.width = `${size}px`;
    container.style.height = `${size}px`;

    // Function to initialize
    const initOrb = () => {
      // Double-check visibility before initializing
      if (!checkVisibility()) {
        return false;
      }

      if (window.UnicornStudio && window.UnicornStudio.init) {
        try {
          if (!window.UnicornStudio.isInitialized) {
            window.UnicornStudio.init();
            window.UnicornStudio.isInitialized = true;
          } else {
            // Force re-scan for new elements
            if (typeof (window as any).UnicornStudio?.scan === 'function') {
              (window as any).UnicornStudio.scan();
            } else {
              // Re-initialize to pick up new elements
              window.UnicornStudio.init();
            }
          }
          return true;
        } catch (error) {
          // Silently handle WebGL errors during transitions
          if (error instanceof Error && error.message.includes('WebGL')) {
            return false;
          }
          console.error('Error initializing Unicorn Studio:', error);
          return false;
        }
      }
      return false;
    };

    // Wait for element to be properly mounted and visible
    const waitForVisibility = (callback: () => void, maxAttempts = 50) => {
      let attempts = 0;
      const check = () => {
        attempts++;
        if (checkVisibility() || attempts >= maxAttempts) {
          callback();
        } else {
          requestAnimationFrame(check);
        }
      };
      requestAnimationFrame(check);
    };

    // Wait for SDK to load and element to be visible
    const tryInit = () => {
      if (window.UnicornStudio && window.UnicornStudio.init && checkVisibility()) {
        return initOrb();
      }
      return false;
    };

    // Wait for visibility, then try to initialize
    let checkSDKInterval: NodeJS.Timeout | null = null;
    let timeoutId: NodeJS.Timeout | null = null;

    waitForVisibility(() => {
      // Try immediately
      if (!tryInit()) {
        // Poll for SDK
        checkSDKInterval = setInterval(() => {
          if (checkVisibility() && tryInit()) {
            if (checkSDKInterval) {
              clearInterval(checkSDKInterval);
              checkSDKInterval = null;
            }
          }
        }, 100);

        // Cleanup after 10 seconds
        timeoutId = setTimeout(() => {
          if (checkSDKInterval) {
            clearInterval(checkSDKInterval);
            checkSDKInterval = null;
          }
        }, 10000);
      }
    });

    // Cleanup function
    return () => {
      if (checkSDKInterval) {
        clearInterval(checkSDKInterval);
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [size]);

  return (
    <div
      className={className}
      onClick={onClick}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        overflow: 'hidden',
        flexShrink: 0,
        ...style
      }}
    >
      <div
        ref={orbRef}
        className="w-full h-full pointer-events-none"
        style={{ 
          width: `${size}px`, 
          height: `${size}px`
        }}
      />
    </div>
  );
};

// Persistent Orb Component - Never unmounts, only transforms
const ChatOrb: React.FC<{ 
  state: AIChatState;
  isLoading: boolean;
  onClick: () => void;
  fabPosition: { x: number; y: number } | null;
  panelAnchorPosition: { x: number; y: number } | null;
  showInPanel: boolean;
}> = ({ state, isLoading, onClick, fabPosition, panelAnchorPosition, showInPanel }) => {
  const reducedMotion = prefersReducedMotion();
  
  // Calculate transform based on state
  // Use useMemo to prevent recalculations during animation
  const transform = useMemo(() => {
    if (!fabPosition || !panelAnchorPosition) {
      return { x: 0, y: 0, scale: 1 };
    }

    if (state === 'fab') {
      return { 
        x: 0, 
        y: 0, 
        scale: 1 
      };
    } else if (state === 'opening' || (state === 'open' && showInPanel)) {
      // Only calculate if we have valid positions
      if (panelAnchorPosition.x === 0 && panelAnchorPosition.y === 0 && fabPosition.x !== 0 && fabPosition.y !== 0) {
        // Position not ready yet, stay at FAB
        return { x: 0, y: 0, scale: 1 };
      }
      const deltaX = panelAnchorPosition.x - fabPosition.x;
      const deltaY = panelAnchorPosition.y - fabPosition.y;
      return {
        x: deltaX,
        y: deltaY,
        scale: MOTION.scale.orbDocked
      };
    } else if (state === 'closing') {
      // During closing, orb moves back to FAB
      return {
        x: 0,
        y: 0,
        scale: 1
      };
    }
    return { x: 0, y: 0, scale: 1 };
  }, [state, fabPosition, panelAnchorPosition, showInPanel]);
  const isVisible = state === 'fab' || state === 'opening' || state === 'closing' || (state === 'open' && showInPanel);

  // Determine if orb is animating (not in stable fab or open state)
  const isAnimating = state === 'opening' || state === 'closing';

  return (
    <motion.div
      className="fixed pointer-events-auto"
      style={{
        left: fabPosition ? `${fabPosition.x}px` : 'auto',
        top: fabPosition ? `${fabPosition.y}px` : 'auto',
        transformOrigin: 'center center',
        zIndex: 60,
        cursor: state === 'fab' ? 'pointer' : 'default',
        pointerEvents: state === 'fab' ? 'auto' : 'none',
        // Performance optimizations: enable hardware acceleration during animation
        willChange: isAnimating ? 'transform' : 'auto',
        backfaceVisibility: 'hidden' as const,
        WebkitBackfaceVisibility: 'hidden' as const
      }}
      animate={{
        x: transform.x,
        y: transform.y,
        scale: transform.scale,
        opacity: isVisible ? 1 : 0
      }}
      transition={reducedMotion ? { duration: 0 } : {
        // Use smooth easing curves instead of spring for clean, bounce-free motion
        // Position (x, y) - smooth cubic-bezier easing, no bounce
        x: { 
          duration: MOTION.duration.orb / 1000, 
          ease: MOTION.easing.movement 
        },
        y: { 
          duration: MOTION.duration.orb / 1000, 
          ease: MOTION.easing.movement 
        },
        // Scale animation - quick and smooth with slight ease-out
        scale: { 
          duration: MOTION.duration.orb / 1000, 
          ease: MOTION.easing.movement 
        },
        opacity: { duration: 0.2, ease: "easeOut" }
      }}
      onClick={state === 'fab' ? onClick : undefined}
    >
      <div className="relative w-[70px] h-[70px] group overflow-visible">
        {/* Ambient Back Glow - only in FAB state */}
        {state === 'fab' && (
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] rounded-full bg-accent/20 blur-xl transition-all duration-700 ${isLoading ? 'opacity-100 scale-110' : 'opacity-0 group-hover:opacity-40'}`}></div>
        )}
        
        {/* Unicorn Studio Orb */}
        <AnimatedOrb 
          size={70}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        />
      </div>
    </motion.div>
  );
};

interface AIChatWidgetProps {
  onOpenChange?: (isOpen: boolean) => void;
}

const AIChatWidget: React.FC<AIChatWidgetProps> = ({ onOpenChange }) => {
  // State machine
  const [state, setState] = useState<AIChatState>('fab');
  const [persona, setPersona] = useState<Persona>(null);
  const [hasSelectedPersona, setHasSelectedPersona] = useState(false);
  const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  
  // Position refs
  const fabRef = useRef<HTMLDivElement>(null);
  const panelAnchorRefDesktop = useRef<HTMLDivElement>(null);
  const panelAnchorRefMobile = useRef<HTMLDivElement>(null);
  const [fabPosition, setFabPosition] = useState<{ x: number; y: number } | null>(null);
  const [panelAnchorPosition, setPanelAnchorPosition] = useState<{ x: number; y: number } | null>(null);
  const [panelAnimationComplete, setPanelAnimationComplete] = useState(false);
  const [welcomeScreenAnimationComplete, setWelcomeScreenAnimationComplete] = useState(false);
  // Track if orb animation is in progress to prevent position updates during animation
  const isOrbAnimatingRef = useRef(false);

  // Calculate positions with validation and safety checks
  const calculatePositions = useCallback((skipAnimationCheck = false) => {
    // Always calculate FAB position
    if (fabRef.current) {
      const rect = fabRef.current.getBoundingClientRect();
      const fabPos = {
        x: rect.left + rect.width / 2 - 35, // Center orb (70px / 2)
        y: rect.top + rect.height / 2 - 35
      };
      setFabPosition(fabPos);
      console.log('[Orb Debug] FAB Position:', fabPos);
    }
    
    // Prevent position updates during active orb animation to avoid jerky motion
    if (!skipAnimationCheck && isOrbAnimatingRef.current) {
      console.log('[Orb Debug] Skipping position update - animation in progress');
      return;
    }
    
    // Only calculate panel anchor position if:
    // 1. Panel is open/opening
    // 2. Welcome screen should be visible (no persona selected, no messages)
    // 3. Panel animation is complete (scale = 1)
    // 4. Welcome screen animation is complete
    if ((state === 'open' || state === 'opening') && !hasSelectedPersona && messages.length === 0) {
      // Use desktop ref on desktop, mobile ref on mobile
      const isDesktop = window.innerWidth >= 768; // md breakpoint
      const panelAnchorRef = isDesktop ? panelAnchorRefDesktop.current : panelAnchorRefMobile.current;
      
      if (panelAnchorRef) {
        const rect = panelAnchorRef.getBoundingClientRect();
        const styles = window.getComputedStyle(panelAnchorRef);
        
        // Check if element is actually visible and has valid dimensions
        if (rect.width > 0 && rect.height > 0 && 
            styles.display !== 'none' && 
            styles.visibility !== 'hidden' && 
            styles.opacity !== '0') {
          // Calculate center of avatar placeholder (64px / 2 = 32px)
          // But account for orb's actual size when docked (70px scaled to 64px)
          // The orb container is 70px, so we need to center it on the 64px placeholder
          // getBoundingClientRect() returns viewport coordinates, which is what we need for fixed positioning
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          
          const panelPos = {
            x: centerX - 35, // Center of 64px div minus half of 70px orb container
            y: centerY - 35
          };
          
          // Validate coordinates are reasonable (not 0,0 or extreme values)
          const isValidPosition = 
            panelPos.x > -1000 && panelPos.x < window.innerWidth + 1000 &&
            panelPos.y > -1000 && panelPos.y < window.innerHeight + 1000 &&
            !isNaN(panelPos.x) && !isNaN(panelPos.y);
          
          if (isValidPosition) {
            setPanelAnchorPosition(panelPos);
            console.log('[Orb Debug] Panel Anchor Position:', panelPos, {
              rect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
              center: { x: centerX, y: centerY },
              isDesktop,
              panelAnimationComplete,
              welcomeScreenAnimationComplete
            });
          } else {
            console.warn('[Orb Debug] Invalid panel anchor position calculated:', panelPos);
          }
        } else {
          console.warn('[Orb Debug] Panel anchor ref not visible or has invalid dimensions:', {
            width: rect.width,
            height: rect.height,
            display: styles.display,
            visibility: styles.visibility,
            opacity: styles.opacity
          });
        }
      } else {
        console.warn('[Orb Debug] Panel anchor ref not found', { isDesktop, state });
      }
    }
  }, [state, hasSelectedPersona, messages.length, panelAnimationComplete, welcomeScreenAnimationComplete]);

  // Calculate positions on mount and resize
  useEffect(() => {
    calculatePositions();
    const handleResize = () => {
      // Allow position updates on resize even during animation
      calculatePositions(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [calculatePositions]);

  // Calculate panel anchor position early - before orb animation starts
  // This prevents jerky animation from position updates mid-animation
  // Use useLayoutEffect to calculate before paint for smoother animation
  useLayoutEffect(() => {
    if (state === 'opening') {
      // Mark animation as starting
      isOrbAnimatingRef.current = true;
      
      // Calculate position early, but wait a bit for panel to start scaling
      // This gives us a better estimate before the orb starts moving
      const timeout = setTimeout(() => {
        if (!hasSelectedPersona && messages.length === 0) {
          // Use requestAnimationFrame to ensure DOM is updated
          requestAnimationFrame(() => {
            // Force position calculation before animation starts
            calculatePositions(true);
            // Small delay to let position settle, then allow animation
            setTimeout(() => {
              isOrbAnimatingRef.current = false;
            }, 50);
          });
        } else {
          isOrbAnimatingRef.current = false;
        }
      }, 50); // Reduced delay for faster position calculation
      return () => {
        clearTimeout(timeout);
        isOrbAnimatingRef.current = false;
      };
    } else if (state === 'open' && panelAnimationComplete && welcomeScreenAnimationComplete) {
      // Final position calculation after everything is settled
      isOrbAnimatingRef.current = false;
      const rafId = requestAnimationFrame(() => {
        if (!hasSelectedPersona && messages.length === 0) {
          calculatePositions(true);
        }
      });
      return () => cancelAnimationFrame(rafId);
    } else if (state === 'fab' || state === 'closing') {
      // Reset animation flag when returning to FAB or closing
      isOrbAnimatingRef.current = state === 'closing';
      if (state === 'closing') {
        // Allow position reset during closing
        setTimeout(() => {
          isOrbAnimatingRef.current = false;
        }, 100);
      }
    }
  }, [state, panelAnimationComplete, welcomeScreenAnimationComplete, calculatePositions, hasSelectedPersona, messages.length]);

  // Reset animation completion flags when panel closes
  useEffect(() => {
    if (state === 'fab') {
      setPanelAnimationComplete(false);
      setWelcomeScreenAnimationComplete(false);
    }
  }, [state]);

  // Check if presentation mode is active
  useEffect(() => {
    const checkPresentationMode = () => {
      const presentationOverlay = document.querySelector('[class*="z-[90]"]') as HTMLElement;
      const isActive = presentationOverlay && window.getComputedStyle(presentationOverlay).opacity !== '0' && presentationOverlay.style.display !== 'none';
      setIsPresentationMode(isActive);
    };

    // Check initially and on mutations
    checkPresentationMode();
    const observer = new MutationObserver(checkPresentationMode);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style'] });
    
    // Also check periodically as a fallback
    const interval = setInterval(checkPresentationMode, 100);

    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  // Reset conversation function
  const handleReset = () => {
    setPersona(null);
    setHasSelectedPersona(false);
    setMessages([]);
    setInput('');
    if (idleTimeoutRef.current) {
      clearTimeout(idleTimeoutRef.current);
    }
  };

  // Reset state when chat closes
  useEffect(() => {
    if (state === 'fab') {
      handleReset();
    }
  }, [state]);

  // Handle persona selection
  const handlePersonaSelect = (selectedPersona: Persona) => {
    setPersona(selectedPersona);
    setHasSelectedPersona(true);
    
    const config = selectedPersona ? personaConfigs[selectedPersona] : null;
    if (config) {
      setMessages(prev => [
        ...prev,
        { text: config.greeting || "I can help in a few ways — here are some good starting points.", isUser: false }
      ]);
    }
  };

  // Handle recommendation click
  const handleRecommendationClick = async (recommendation: string) => {
    setInput(recommendation);
    // Trigger submit
    const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
    await handleSubmit(fakeEvent, recommendation);
  };

  // Proactive suggestion after idle time - removed for new design

  const handleSubmit = async (e: React.FormEvent, overrideInput?: string) => {
    e.preventDefault();
    const userMsg = overrideInput || input;
    if (!userMsg.trim() || isLoading) return;

    setInput('');
    setIsLoading(true);

      // Get conversation history before adding new messages
      // Skip only the initial persona selection greeting
      setMessages(prev => {
        const conversationHistory: ChatMessage[] = prev
          .slice(1) // Skip the initial greeting
          .filter(msg => !msg.text.includes("Mind telling me who you are") && !msg.text.includes("Most people start here"))
          .map(msg => ({
            role: msg.isUser ? 'user' as const : 'assistant' as const,
            content: msg.text
          }));

      // Add user message and empty AI placeholder
      const updated = [...prev, { text: userMsg, isUser: true }, { text: '', isUser: false }];

      // Stream the response asynchronously
      (async () => {
        try {
          // Pass persona to streamAIResponse for response shaping
          const result = await streamAIResponse(userMsg, conversationHistory, persona);
          let fullText = '';
          let hasReceivedData = false;

          // Read the stream and update the message incrementally
          for await (const chunk of result.textStream) {
            hasReceivedData = true;
            fullText += chunk;
            setMessages(current => {
              const currentUpdated = [...current];
              // Find the last AI message (empty placeholder) and update it
              const lastIndex = currentUpdated.length - 1;
              if (lastIndex >= 0 && !currentUpdated[lastIndex].isUser) {
                currentUpdated[lastIndex] = { text: fullText, isUser: false };
              }
              return currentUpdated;
            });
          }

          // If stream completed but no data was received, it might be a rate limit
          if (!hasReceivedData && fullText.length === 0) {
            throw new Error('No response received from AI service. This might be due to rate limits.');
          }
        } catch (error: any) {
          console.error("Error streaming AI response:", error);
          
          // Check for rate limit errors
          const errorMessage = error?.message || String(error);
          const isRateLimit = errorMessage.includes('Rate limit') || 
                             errorMessage.includes('429') || 
                             errorMessage.includes('tokens per day');
          
          let userMessage = "I'm having trouble connecting to my thought processor right now. Please try again later.";
          
          if (isRateLimit) {
            userMessage = "I've hit my daily API limit. Please try again in a few minutes, or contact Upen directly at upendra.uxr@gmail.com.";
          }
          
          setMessages(current => {
            const currentUpdated = [...current];
            // Replace the last message (empty or partial) with error message
            const lastIndex = currentUpdated.length - 1;
            if (lastIndex >= 0 && !currentUpdated[lastIndex].isUser) {
              currentUpdated[lastIndex] = { 
                text: userMessage, 
                isUser: false 
              };
            }
            return currentUpdated;
          });
        } finally {
          setIsLoading(false);
        }
      })();

      return updated;
    });
  };

  // State machine transitions
  const handleOpen = useCallback(() => {
    if (state === 'fab') {
      setState('opening');
      // Transition to open after animation
      setTimeout(() => {
        setState('open');
      }, prefersReducedMotion() ? 0 : MOTION.duration.orb);
    }
  }, [state]);

  const handleClose = useCallback(() => {
    if (state === 'open') {
      setState('closing');
      // Transition to fab after animation
      setTimeout(() => {
        setState('fab');
      }, prefersReducedMotion() ? 0 : MOTION.duration.orb);
    }
  }, [state]);

  // Notify parent of open state changes
  useEffect(() => {
    onOpenChange?.(state === 'open' || state === 'opening');
  }, [state, onOpenChange]);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && (state === 'open' || state === 'opening')) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state, handleClose]);

  // Hide widget if presentation mode is active - use conditional rendering instead of early return
  if (isPresentationMode) {
    return null;
  }

  const isOpen = state === 'open' || state === 'opening';
  const showOrbInPanel = state === 'open' && !hasSelectedPersona && messages.length === 0;
  const reducedMotion = prefersReducedMotion();

  return (
    <div id="ai-host" className="fixed inset-0 pointer-events-none z-[60]">
      {/* Persistent Orb - Never unmounts */}
      <ChatOrb
        state={state}
        isLoading={isLoading}
        onClick={handleOpen}
        fabPosition={fabPosition}
        panelAnchorPosition={panelAnchorPosition}
        showInPanel={showOrbInPanel}
      />
      
      {/* Orb button for accessibility - hidden but focusable */}
      <button
        onClick={handleOpen}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleOpen();
          }
        }}
        aria-expanded={state === 'open' || state === 'opening'}
        aria-label="Open AI chat assistant"
        className="sr-only"
        tabIndex={state === 'fab' ? 0 : -1}
      >
        Open chat
      </button>
      
      {/* FAB Position Reference (hidden) */}
      <div 
        ref={fabRef}
        className="fixed bottom-11 right-12 w-10 h-10 pointer-events-none invisible"
        aria-hidden="true"
      />

      {/* Mobile Backdrop - Only on mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.2 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden pointer-events-auto"
            onClick={handleClose}
          />
        )}
      </AnimatePresence>

      {/* Desktop Panel - Fixed position, transform-based animation */}
      <motion.div
        className="hidden md:flex fixed top-0 right-0 w-[384px] h-screen bg-panel flex-col overflow-hidden pointer-events-auto"
        style={{
          transformOrigin: 'top right',
          zIndex: 50
        }}
        animate={{
          scale: isOpen ? 1 : MOTION.scale.panelInitial,
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none'
        }}
        transition={reducedMotion ? { duration: 0 } : {
          duration: MOTION.duration.panel / 1000,
          ease: MOTION.easing.panel
        }}
        onAnimationComplete={(definition) => {
          // Only mark complete when scale reaches 1 (fully open)
          if (isOpen && definition.scale === 1) {
            console.log('[Orb Debug] Panel animation complete');
            setPanelAnimationComplete(true);
          }
        }}
      >
        {isOpen && (
          <div className="h-full flex flex-col">
            {/* Header */}
            <div 
              className="bg-panel text-ink px-4 py-4 flex justify-between items-center flex-shrink-0"
            >
              <div>
                 <div className="font-semibold text-sm flex items-center gap-2">
                    Upen's assistant
                    {isLoading && <span className="flex h-1.5 w-1.5 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent"></span>
                    </span>}
                 </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Reset button - only show when conversation has started */}
                {hasSelectedPersona && (
                  <button 
                    onClick={handleReset}
                    className="w-6 h-6 rounded-full flex items-center justify-center opacity-50 hover:opacity-100 hover:bg-page transition-all text-xs text-ink"
                    title="Reset conversation"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                      <path d="M21 3v5h-5"/>
                      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                      <path d="M3 21v-5h5"/>
                    </svg>
                  </button>
                )}
                <button 
                  onClick={handleClose} 
                  className="w-6 h-6 rounded-full flex items-center justify-center opacity-50 hover:opacity-100 hover:bg-page transition-all text-base text-ink"
                  title="Close chat"
                >
                  ×
                </button>
              </div>
            </div>
            
            {/* Messages Area - Flex grow to fill available space */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-panel font-sans text-sm scrollbar-thin scrollbar-thumb-line">
              {/* Initial Welcome Screen - Show when no persona selected and no messages */}
              {!hasSelectedPersona && messages.length === 0 && (
                <motion.div 
                  className="flex flex-col items-center justify-center h-full -mt-16"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={reducedMotion ? { duration: 0 } : {
                    duration: MOTION.duration.content / 1000,
                    delay: MOTION.duration.panel / 1000 / 2
                  }}
                  onAnimationComplete={() => {
                    console.log('[Orb Debug] Welcome screen animation complete (desktop)');
                    setWelcomeScreenAnimationComplete(true);
                  }}
                >
                  <div className="flex flex-col items-center gap-8 w-full max-w-[179px]">
                    {/* Large AI Avatar - Orb position (orb is rendered separately) - Panel Anchor Reference */}
                    <div ref={panelAnchorRefDesktop} className="w-16 h-16" />
                    
                    {/* Title */}
                    <p className="font-sans text-base text-ink text-center">
                      Talk to Upen's Assistant
                    </p>
                    
                    {/* Persona Selection Section */}
                    <div className="flex flex-col gap-[15px] items-center justify-center w-full">
                      <p className="font-medium text-xs text-muted w-full text-left">
                        Who are you?
                      </p>
                      <div className="flex flex-col gap-2 items-start w-full">
                        <button
                          onClick={() => handlePersonaSelect('recruiter')}
                          className="w-full text-left px-4 py-2.5 bg-black/5 hover:bg-black/10 rounded-full text-sm text-ink transition-colors"
                        >
                          I'm a recruiter
                        </button>
                        <button
                          onClick={() => handlePersonaSelect('designer')}
                          className="w-full text-left px-4 py-2.5 bg-black/5 hover:bg-black/10 rounded-full text-sm text-ink transition-colors"
                        >
                          I'm a designer
                        </button>
                        <button
                          onClick={() => handlePersonaSelect('friend')}
                          className="w-full text-left px-4 py-2.5 bg-black/5 hover:bg-black/10 rounded-full text-sm text-ink transition-colors"
                        >
                          Just browsing
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {/* Regular Messages */}
              {messages.map((msg, idx) => {
                const isLastMessage = idx === messages.length - 1;
                const isEmptyStreaming = isLastMessage && !msg.isUser && !msg.text && isLoading;
                const isRecommendationMessage = msg.text.includes("I can help") || msg.text.includes("Most people start here");
                
                // Don't render empty streaming messages - show loading indicator instead
                if (isEmptyStreaming) {
                  return null;
                }
                
                return (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={reducedMotion ? { duration: 0 } : {
                      duration: MOTION.duration.content / 1000,
                      delay: idx * 0.05
                    }}
                  >
                    <div className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'} items-start gap-2`}>
                      {!msg.isUser && (
                        <div className="w-7 h-7 rounded-full flex-shrink-0 mt-0.5 overflow-hidden">
                          <img src="/ai_avatar.png" alt="AI" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className={`
                        max-w-[85%] px-3 py-2 rounded-xl leading-relaxed text-sm
                        ${msg.isUser 
                          ? 'bg-accent text-page rounded-tr-sm' 
                          : 'bg-page text-ink rounded-tl-sm border border-line'}
                      `}>
                        {msg.text}
                      </div>
                    </div>
                    
                    {/* Persona-specific Recommendations */}
                    {isRecommendationMessage && persona && personaConfigs[persona] && (
                      <div className="mt-2 space-y-1.5">
                        {personaConfigs[persona].recommendations.map((rec, recIdx) => (
                          <button
                            key={recIdx}
                            onClick={() => handleRecommendationClick(rec)}
                            className="w-full text-left px-3 py-2 bg-page hover:bg-panel rounded-lg text-sm text-ink transition-colors border border-line"
                          >
                            {rec}
                          </button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                );
              })}
              {isLoading && (!messages[messages.length - 1]?.text || messages[messages.length - 1]?.isUser) && (
                <div className="flex justify-start items-start gap-2">
                  <div className="w-7 h-7 rounded-full flex-shrink-0 mt-0.5 overflow-hidden">
                    <img src="/ai_avatar.png" alt="AI" className="w-full h-full object-cover" />
                  </div>
                  <div className="bg-page px-3 py-2 rounded-xl rounded-tl-sm flex gap-1 items-center h-8 border border-line">
                      <span className="w-1 h-1 bg-muted rounded-full animate-bounce"></span>
                      <span className="w-1 h-1 bg-muted rounded-full animate-bounce delay-100"></span>
                      <span className="w-1 h-1 bg-muted rounded-full animate-bounce delay-200"></span>
                   </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form - Fixed at bottom */}
            <form onSubmit={handleSubmit} className="p-4 bg-panel flex-shrink-0">
              <div className="flex gap-2 bg-page rounded-full px-4 py-2.5 border border-line">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="How else can I help"
                  className="flex-1 bg-transparent outline-none text-sm placeholder-muted text-ink"
                  autoComplete="off"
                  spellCheck="false"
                />
                <button type="submit" disabled={!input.trim()} className="text-ink opacity-50 hover:opacity-100 transition-opacity disabled:opacity-30">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m22 2-7 20-4-9-9-4Z"/>
                    <path d="M22 2 11 13"/>
                  </svg>
                </button>
              </div>
            </form>
          </div>
        )}
      </motion.div>

      {/* Mobile: Overlay with transform animation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={reducedMotion ? { duration: 0 } : {
              type: "spring",
              stiffness: 300,
              damping: 30,
              mass: 0.8
            }}
            onAnimationComplete={() => {
              console.log('[Orb Debug] Mobile panel animation complete');
              setPanelAnimationComplete(true);
            }}
            className="md:hidden fixed top-0 right-0 h-screen w-full z-50 bg-panel border-l border-line shadow-2xl flex flex-col overflow-hidden pointer-events-auto"
          >
            {/* Header */}
            <div 
              className="bg-panel text-ink px-4 py-4 flex justify-between items-center flex-shrink-0"
            >
              <div>
                 <div className="font-semibold text-sm flex items-center gap-2">
                    Upen's assistant
                    {isLoading && <span className="flex h-1.5 w-1.5 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent"></span>
                    </span>}
                 </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Reset button - only show when conversation has started */}
                {hasSelectedPersona && (
                  <button 
                    onClick={handleReset}
                    className="w-6 h-6 rounded-full flex items-center justify-center opacity-50 hover:opacity-100 hover:bg-page transition-all text-xs text-ink"
                    title="Reset conversation"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                      <path d="M21 3v5h-5"/>
                      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                      <path d="M3 21v-5h5"/>
                    </svg>
                  </button>
                )}
                <button 
                  onClick={handleClose} 
                  className="w-6 h-6 rounded-full flex items-center justify-center opacity-50 hover:opacity-100 hover:bg-page transition-all text-base text-ink"
                  title="Close chat"
                >
                  ×
                </button>
              </div>
            </div>
            
            {/* Messages Area - Flex grow to fill available space */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-panel font-sans text-sm scrollbar-thin scrollbar-thumb-line">
              {/* Initial Welcome Screen - Show when no persona selected and no messages */}
              {!hasSelectedPersona && messages.length === 0 && (
                <motion.div 
                  className="flex flex-col items-center justify-center h-full -mt-16"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={reducedMotion ? { duration: 0 } : {
                    duration: MOTION.duration.content / 1000,
                    delay: MOTION.duration.panel / 1000 / 2
                  }}
                  onAnimationComplete={() => {
                    console.log('[Orb Debug] Welcome screen animation complete (mobile)');
                    setWelcomeScreenAnimationComplete(true);
                  }}
                >
                  <div className="flex flex-col items-center gap-8 w-full max-w-[179px]">
                    {/* Large AI Avatar - Orb position (orb is rendered separately) - Panel Anchor Reference */}
                    <div ref={panelAnchorRefMobile} className="w-16 h-16" />
                    
                    {/* Title */}
                    <p className="font-sans text-base text-ink text-center">
                      Talk to Upen's Assistant
                    </p>
                    
                    {/* Persona Selection Section */}
                    <div className="flex flex-col gap-[15px] items-center justify-center w-full">
                      <p className="font-medium text-xs text-muted w-full text-left">
                        Who are you?
                      </p>
                      <div className="flex flex-col gap-2 items-start w-full">
                        <button
                          onClick={() => handlePersonaSelect('recruiter')}
                          className="w-full text-left px-4 py-2.5 bg-black/5 hover:bg-black/10 rounded-full text-sm text-ink transition-colors"
                        >
                          I'm a recruiter
                        </button>
                        <button
                          onClick={() => handlePersonaSelect('designer')}
                          className="w-full text-left px-4 py-2.5 bg-black/5 hover:bg-black/10 rounded-full text-sm text-ink transition-colors"
                        >
                          I'm a designer
                        </button>
                        <button
                          onClick={() => handlePersonaSelect('friend')}
                          className="w-full text-left px-4 py-2.5 bg-black/5 hover:bg-black/10 rounded-full text-sm text-ink transition-colors"
                        >
                          Just browsing
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {/* Regular Messages */}
              {messages.map((msg, idx) => {
                const isLastMessage = idx === messages.length - 1;
                const isEmptyStreaming = isLastMessage && !msg.isUser && !msg.text && isLoading;
                const isRecommendationMessage = msg.text.includes("I can help") || msg.text.includes("Most people start here");
                
                // Don't render empty streaming messages - show loading indicator instead
                if (isEmptyStreaming) {
                  return null;
                }
                
                return (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={reducedMotion ? { duration: 0 } : {
                      duration: MOTION.duration.content / 1000,
                      delay: idx * 0.05
                    }}
                  >
                    <div className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'} items-start gap-2`}>
                      {!msg.isUser && (
                        <div className="w-7 h-7 rounded-full flex-shrink-0 mt-0.5 overflow-hidden">
                          <img src="/ai_avatar.png" alt="AI" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className={`
                        max-w-[85%] px-3 py-2 rounded-xl leading-relaxed text-sm
                        ${msg.isUser 
                          ? 'bg-accent text-page rounded-tr-sm' 
                          : 'bg-page text-ink rounded-tl-sm border border-line'}
                      `}>
                        {msg.text}
                      </div>
                    </div>
                    
                    {/* Persona-specific Recommendations */}
                    {isRecommendationMessage && persona && personaConfigs[persona] && (
                      <div className="mt-2 space-y-1.5">
                        {personaConfigs[persona].recommendations.map((rec, recIdx) => (
                          <button
                            key={recIdx}
                            onClick={() => handleRecommendationClick(rec)}
                            className="w-full text-left px-3 py-2 bg-page hover:bg-panel rounded-lg text-sm text-ink transition-colors border border-line"
                          >
                            {rec}
                          </button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                );
              })}
              {isLoading && (!messages[messages.length - 1]?.text || messages[messages.length - 1]?.isUser) && (
                <div className="flex justify-start items-start gap-2">
                  <div className="w-7 h-7 rounded-full flex-shrink-0 mt-0.5 overflow-hidden">
                    <img src="/ai_avatar.png" alt="AI" className="w-full h-full object-cover" />
                  </div>
                  <div className="bg-page px-3 py-2 rounded-xl rounded-tl-sm flex gap-1 items-center h-8 border border-line">
                      <span className="w-1 h-1 bg-muted rounded-full animate-bounce"></span>
                      <span className="w-1 h-1 bg-muted rounded-full animate-bounce delay-100"></span>
                      <span className="w-1 h-1 bg-muted rounded-full animate-bounce delay-200"></span>
                   </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form - Fixed at bottom */}
            <form onSubmit={handleSubmit} className="p-4 bg-panel flex-shrink-0">
              <div className="flex gap-2 bg-page rounded-full px-4 py-2.5 border border-line">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="How else can I help"
                  className="flex-1 bg-transparent outline-none text-sm placeholder-muted text-ink"
                  autoComplete="off"
                  spellCheck="false"
                />
                <button type="submit" disabled={!input.trim()} className="text-ink opacity-50 hover:opacity-100 transition-opacity disabled:opacity-30">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m22 2-7 20-4-9-9-4Z"/>
                    <path d="M22 2 11 13"/>
                  </svg>
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIChatWidget;