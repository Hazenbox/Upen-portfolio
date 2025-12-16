import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TopBarProps {
  location?: string;
  email?: string;
  isVisible?: boolean;
  isChatOpen?: boolean;
}

const TopBar: React.FC<TopBarProps> = ({ 
  location = 'Upen',
  email = 'upendra.uxr@gmail.com',
  isVisible = false,
  isChatOpen = false
}) => {
  const [emailCopied, setEmailCopied] = useState(false);
  const [emailChars, setEmailChars] = useState<string[]>([]);
  const [locationChars, setLocationChars] = useState<string[]>([]);

  // Animate location characters
  useEffect(() => {
    const chars = location.split('');
    setLocationChars(chars);
  }, [location]);

  // Animate email characters
  useEffect(() => {
    const chars = email.split('');
    setEmailChars(chars);
  }, [email]);

  const copyEmail = () => {
    navigator.clipboard.writeText(email);
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          className={`fixed z-[60] max-w-2xl mx-auto overflow-hidden w-full top-8 left-0 px-6 transition-all duration-300 ${isChatOpen ? 'md:right-[400px]' : 'right-0'}`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
      <div className="topbar-container overflow-hidden rounded-full w-full px-4 bg-black/5 backdrop-blur-md flex min-h-[40px] items-center justify-between text-xs">
        {/* Location */}
        <div className="relative h-6 min-w-[80px] flex-1 flex items-center">
          <div className="absolute left-0 block whitespace-nowrap font-display text-base">
            {locationChars.map((char, index) => (
              <motion.span
                key={index}
                className="inline-block"
                initial={{ opacity: 0, transform: 'translateY(10px)' }}
                animate={{ opacity: 1, transform: 'translateY(0)' }}
                transition={{
                  delay: index * 0.015,
                  duration: 0.2,
                  ease: [0.4, 0, 0.2, 1]
                }}
              >
                {char}
              </motion.span>
            ))}
          </div>
        </div>

        {/* Status and Email */}
        <div className="text-xs">
          <div className="flex items-center">
            {/* Status Indicator */}
            <div 
              className="w-2 h-2 aspect-square rounded-full bg-green-500 border border-white transition-colors duration-700"
              title="Available"
            />
            
            {/* Email */}
            <div 
              title={emailCopied ? "Copied!" : "Click to copy email"}
              className="inline-block text-xs cursor-pointer ml-1"
              onClick={copyEmail}
            >
              <div className="flex scale-100 cursor-default overflow-hidden py-2">
                {emailChars.map((char, index) => (
                  <motion.span
                    key={index}
                    className="font-mono text-xs"
                    style={{ fontFamily: 'Geist Mono, monospace' }}
                    initial={{ opacity: 0, transform: 'translateY(10px)' }}
                    animate={{ opacity: 1, transform: 'translateY(0)' }}
                    transition={{
                      delay: index * 0.015,
                      duration: 0.2,
                      ease: [0.4, 0, 0.2, 1]
                    }}
                  >
                    {char}
                  </motion.span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TopBar;

