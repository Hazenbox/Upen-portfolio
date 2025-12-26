import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface ImageStackProps {
  images: { id: number | string; src: string; alt: string }[];
}

const ImageStack: React.FC<ImageStackProps> = ({ images }) => {
  const [cards, setCards] = useState(images);

  const moveToEnd = (fromIndex: number) => {
    setCards((prevCards) => {
      const newCards = [...prevCards];
      const movedCard = newCards.splice(fromIndex, 1)[0];
      newCards.push(movedCard);
      return newCards;
    });
  };

  return (
    <div className="relative h-64 w-full flex items-center justify-center mb-10 mt-6 overflow-visible">
      <motion.div 
        className="relative w-48 h-36 sm:w-60 sm:h-44 md:w-72 md:h-52 cursor-pointer"
        whileHover="hover"
        initial="rest"
        animate="rest"
      >
        {cards.map((image, index) => {
          return (
            <Card
              key={image.id}
              image={image}
              index={index}
              total={cards.length}
              moveCard={() => moveToEnd(index)}
            />
          );
        })}
      </motion.div>
    </div>
  );
};

const Card = ({ image, index, total, moveCard }: any) => {
  const isFront = index === 0;
  
  // Calculate fan positions
  // Front card stays center
  // Others fan out alternating left/right
  const fanX = index === 0 ? 0 : (index % 2 === 0 ? 20 * index : -20 * index);
  const fanRotate = index === 0 ? 0 : (index % 2 === 0 ? 3 * index : -3 * index);
  
  return (
    <motion.div
      layout
      onClick={(e) => {
        e.stopPropagation();
        if (isFront) moveCard();
      }}
      variants={{
        rest: {
          scale: 1 - index * 0.05,
          y: index * 8,
          x: 0,
          rotate: index % 2 === 0 ? index * 2 : index * -2,
          transition: {
            type: "spring",
            stiffness: 300,
            damping: 20
          }
        },
        hover: {
          // Fan out behavior
          x: fanX,
          y: index * 5, // slight vertical offset still
          rotate: fanRotate,
          scale: 1, // Reset scale on fan out so they are visible
          transition: {
            type: "spring",
            stiffness: 300,
            damping: 20
          }
        }
      }}
      className="absolute inset-0 rounded-2xl shadow-xl overflow-hidden border-4 border-white dark:border-zinc-800 bg-white dark:bg-zinc-800"
      style={{
        zIndex: total - index,
        transformOrigin: 'bottom center',
      }}
    >
      <img 
        src={image.src} 
        alt={image.alt} 
        className="w-full h-full object-cover pointer-events-none select-none" 
      />
      {/* Overlay gradient for depth on back cards */}
      <motion.div 
        className="absolute inset-0 bg-black/10 pointer-events-none"
        variants={{
          rest: { opacity: isFront ? 0 : 1 },
          hover: { opacity: 0 } // Remove shadow on fan out
        }}
      />
    </motion.div>
  );
};

export default ImageStack;
