"use client";

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

const Preloader = () => {
  const dotCount = 15;
  const dots = Array.from({ length: dotCount }, (_, i) => i);

  return (
    // motion.div handles the smooth entry and exit of the entire screen
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-white overflow-hidden"
    >
      <div className="w-full flex items-center justify-between px-4 md:px-10">
        
        {/* Left Side Dots */}
        <div className="flex flex-1 justify-evenly items-center">
          {dots.map((dot) => (
            <div
              key={`left-${dot}`}
              className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-zinc-300 [animation:wave_1.5s_ease-in-out_infinite]"
              style={{ animationDelay: `${(dotCount - dot) * 0.1}s` }}
            />
          ))}
        </div>

        {/* Centered Bumpy Logo */}
        <div className="relative flex-shrink-0 px-8">
          <Image
            src="/logo.png"
            alt="Aryana Logo"
            width={180}
            height={80}
            className="object-contain [animation:bump_3s_ease-in-out_infinite]"
            priority
          />
        </div>

        {/* Right Side Dots */}
        <div className="flex flex-1 justify-evenly items-center">
          {dots.map((dot) => (
            <div
              key={`right-${dot}`}
              className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-zinc-300 [animation:wave_1.5s_ease-in-out_infinite]"
              style={{ animationDelay: `${dot * 0.1}s` }}
            />
          ))}
        </div>
      </div>

      <style jsx global>{`
        @keyframes wave {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.6); opacity: 1; }
        }
        @keyframes bump {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
      `}</style>
    </motion.div>
  );
};

export default Preloader;