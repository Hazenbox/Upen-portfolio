import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';

interface ImagePreviewProps {
  src: string;
  alt: string;
  isOpen: boolean;
  onClose: () => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ src, alt, isOpen, onClose }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 30 });
  const springY = useSpring(y, { stiffness: 300, damping: 30 });

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
      x.set(0);
      y.set(0);
    }
  }, [isOpen, x, y]);

  // Keyboard shortcuts: Escape to close, + to zoom in, - to zoom out
  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        setScale(prev => Math.min(prev + 0.25, 3));
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        setScale(prev => Math.max(prev - 0.25, 0.5));
      }
    };
    
    window.addEventListener('keydown', handleKeyDown, true); // Use capture phase to intercept
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    x.set(0);
    y.set(0);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!isOpen) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale(prev => Math.max(0.5, Math.min(3, prev + delta)));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || scale <= 1) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    setPosition({ x: newX, y: newY });
    x.set(newX);
    y.set(newY);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (scale <= 1 || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || scale <= 1 || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const newX = touch.clientX - dragStart.x;
    const newY = touch.clientY - dragStart.y;
    setPosition({ x: newX, y: newY });
    x.set(newX);
    y.set(newY);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={containerRef}
          className="fixed inset-0 z-[100] bg-page/95 backdrop-blur-md flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => {
            if (e.target === containerRef.current) {
              onClose();
            }
          }}
          onWheel={handleWheel}
        >
          {/* Close Button */}
          <motion.button
            onClick={onClose}
            className="absolute top-8 right-8 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-panel/80 backdrop-blur-sm text-ink hover:bg-panel transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Close"
          >
            <span className="material-symbols-rounded text-xl" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}>
              close
            </span>
          </motion.button>

          {/* Zoom Controls */}
          <div className="absolute top-8 left-8 z-10 flex flex-col gap-2">
            <motion.button
              onClick={handleZoomIn}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-panel/80 backdrop-blur-sm text-ink hover:bg-panel transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Zoom In"
            >
              <span className="material-symbols-rounded text-xl">add</span>
            </motion.button>
            <motion.button
              onClick={handleZoomOut}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-panel/80 backdrop-blur-sm text-ink hover:bg-panel transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Zoom Out"
            >
              <span className="material-symbols-rounded text-xl">remove</span>
            </motion.button>
            {scale !== 1 && (
              <motion.button
                onClick={handleReset}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-panel/80 backdrop-blur-sm text-ink hover:bg-panel transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Reset"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <span className="material-symbols-rounded text-xl">refresh</span>
              </motion.button>
            )}
          </div>

          {/* Image */}
          <motion.div
            className="relative max-w-[90vw] max-h-[90vh] overflow-hidden"
            style={{
              x: springX,
              y: springY,
              cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.img
              ref={imageRef}
              src={src}
              alt={alt}
              className="max-w-full max-h-[90vh] object-contain select-none"
              style={{
                scale,
                transformOrigin: 'center center',
              }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              draggable={false}
            />
          </motion.div>

          {/* Zoom Indicator */}
          {scale !== 1 && (
            <motion.div
              className="absolute bottom-8 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-panel/80 backdrop-blur-sm text-sm text-ink"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {Math.round(scale * 100)}%
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ImagePreview;
