import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { streamAIResponse, ChatMessage } from '../services/geminiService';
import { Persona, personaConfigs, personaSelectionOptions } from '../utils/personaRecommendations';

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

const ChatOrbButton: React.FC<{ isLoading: boolean; onClick: () => void }> = ({ isLoading, onClick }) => {
  const orbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = orbRef.current;
    if (!container) return;

    // Use local JSON file instead of embed ID
    container.setAttribute('data-us-project-src', '/orb-small.json');
    // Disable mouse tracking/interactivity
    container.setAttribute('data-us-disablemouse', 'true');
    container.style.width = '100px';
    container.style.height = '100px';

    // Function to initialize
    const initOrb = () => {
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
        } catch (error) {
          console.error('Error initializing Unicorn Studio:', error);
        }
      }
    };

    // Wait for SDK to load - try multiple times
    const tryInit = () => {
      if (window.UnicornStudio && window.UnicornStudio.init) {
        initOrb();
        return true;
      }
      return false;
    };

    // Try immediately
    if (!tryInit()) {
      // Poll for SDK
      const checkSDK = setInterval(() => {
        if (tryInit()) {
          clearInterval(checkSDK);
        }
      }, 100);

      // Cleanup after 10 seconds
      setTimeout(() => clearInterval(checkSDK), 10000);
    }
  }, []);

  return (
    <div 
      className="relative w-10 h-10 group cursor-pointer z-50 transition-transform duration-300 hover:scale-110 active:scale-95 overflow-visible" 
      onClick={onClick}
    >
      {/* Ambient Back Glow */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] rounded-full bg-accent/20 blur-xl transition-all duration-700 ${isLoading ? 'opacity-100 scale-110' : 'opacity-0 group-hover:opacity-40'}`}></div>
      
      {/* Unicorn Studio Orb - Fast Load */}
      <div
        ref={orbRef}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{ 
          width: '70px', 
          height: '70px',
          zIndex: 10
        }}
      />
    </div>
  );
};

const AIChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [persona, setPersona] = useState<Persona>(null);
  const [hasSelectedPersona, setHasSelectedPersona] = useState(false);
  const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>([
    { text: "Hi! I'm Upen's assistant. Mind telling me who you are?", isUser: false }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isPresentationMode, setIsPresentationMode] = useState(false);

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
    setMessages([{ text: "Hi! I'm Upen's assistant. Mind telling me who you are?", isUser: false }]);
    setInput('');
    if (idleTimeoutRef.current) {
      clearTimeout(idleTimeoutRef.current);
    }
  };

  // Reset state when chat closes
  useEffect(() => {
    if (!isOpen) {
      handleReset();
    }
  }, [isOpen]);

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

  // Proactive suggestion after idle time
  useEffect(() => {
    if (!isOpen || hasSelectedPersona || messages.length > 1) return;

    idleTimeoutRef.current = setTimeout(() => {
      if (!hasSelectedPersona && messages.length === 1) {
        // Show a proactive suggestion with a default recommendation
        setMessages(prev => [
          ...prev,
          { text: "Most people start here →", isUser: false }
        ]);
        // Auto-select friend persona for proactive suggestion
        setPersona('friend');
        setHasSelectedPersona(true);
      }
    }, 6000); // 6 seconds

    return () => {
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
      }
    };
  }, [isOpen, hasSelectedPersona, messages.length]);

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

  // Hide widget if presentation mode is active - use conditional rendering instead of early return
  if (isPresentationMode) {
    return null;
  }

  return (
    <div className="fixed bottom-11 right-12 z-40 flex flex-col items-end pointer-events-none">
      
      {/* Chat Window */}
      <div className="pointer-events-auto mb-4 origin-bottom-right">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.96 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 30,
                mass: 0.8
              }}
              className="w-72 md:w-80 bg-panel rounded-2xl overflow-hidden flex flex-col"
            >
            <div className="bg-panel text-ink px-4 py-3 flex justify-between items-center">
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
                    className="w-6 h-6 rounded-full flex items-center justify-center opacity-50 hover:opacity-100 hover:bg-gray-200 transition-all text-xs text-ink"
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
                  onClick={() => setIsOpen(false)} 
                  className="w-6 h-6 rounded-full flex items-center justify-center opacity-50 hover:opacity-100 hover:bg-page transition-all text-base text-ink"
                  title="Close chat"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="h-72 overflow-y-auto p-3 space-y-2 bg-panel font-sans text-xs scrollbar-thin scrollbar-thumb-line">
              {messages.map((msg, idx) => {
                const isLastMessage = idx === messages.length - 1;
                const isEmptyStreaming = isLastMessage && !msg.isUser && !msg.text && isLoading;
                const isPersonaSelectionMessage = msg.text.includes("Mind telling me who you are");
                const isRecommendationMessage = msg.text.includes("I can help") || msg.text.includes("Most people start here");
                
                // Don't render empty streaming messages - show loading indicator instead
                if (isEmptyStreaming) {
                  return null;
                }
                
                return (
                  <div key={idx}>
                    <div className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'} items-start gap-2`}>
                      {!msg.isUser && (
                        <div className="w-5 h-5 rounded-full flex-shrink-0 mt-0.5 overflow-hidden">
                          <img src="/ai_avatar.png" alt="AI" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className={`
                        max-w-[85%] px-3 py-2 rounded-xl leading-relaxed text-xs
                        ${msg.isUser 
                          ? 'bg-accent text-page rounded-tr-sm' 
                          : 'bg-page text-ink rounded-tl-sm border border-line'}
                      `}>
                        {msg.text}
                      </div>
                    </div>
                    
                    {/* Persona Selection Buttons */}
                    {isPersonaSelectionMessage && !hasSelectedPersona && (
                      <div className="mt-2 space-y-1.5">
                        {personaSelectionOptions.map((option) => (
                          <button
                            key={option.id}
                            onClick={() => handlePersonaSelect(option.persona)}
                            className="w-full text-left px-3 py-2 bg-page hover:bg-panel rounded-lg text-xs text-ink transition-colors border border-line"
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {/* Persona-specific Recommendations */}
                    {(isRecommendationMessage || msg.text.includes("Most people start here")) && persona && personaConfigs[persona] && (
                      <div className="mt-2 space-y-1.5">
                        {personaConfigs[persona].recommendations.map((rec, recIdx) => (
                          <button
                            key={recIdx}
                            onClick={() => handleRecommendationClick(rec)}
                            className="w-full text-left px-3 py-2 bg-page hover:bg-panel rounded-lg text-xs text-ink transition-colors border border-line"
                          >
                            {rec}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              {isLoading && (!messages[messages.length - 1]?.text || messages[messages.length - 1]?.isUser) && (
                <div className="flex justify-start items-start gap-2">
                  <div className="w-5 h-5 rounded-full flex-shrink-0 mt-0.5 overflow-hidden">
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

            <form onSubmit={handleSubmit} className="p-3 bg-panel">
              <div className="flex gap-2 bg-page rounded-full px-3 py-1.5 border border-line">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="How else can I help"
                  className="flex-1 bg-transparent outline-none text-xs placeholder-muted text-ink"
                  autoComplete="off"
                  spellCheck="false"
                />
                <button type="submit" disabled={!input.trim()} className="text-ink opacity-50 hover:opacity-100 transition-opacity disabled:opacity-30">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

      {/* Controls Row */}
      <div className="flex items-center gap-6 pointer-events-auto pr-2">
        <ChatOrbButton isLoading={isLoading} onClick={() => setIsOpen(!isOpen)} />
      </div>
    </div>
  );
};

export default AIChatWidget;