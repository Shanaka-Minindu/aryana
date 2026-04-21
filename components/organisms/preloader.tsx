"use client";

import React from 'react';
import Image from 'next/image';

const Preloader = () => {
  const dotCount = 16; // Adjusted for better spacing based on design
  const dots = Array.from({ length: dotCount }, (_, i) => i);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white overflow-hidden">
      <div className="w-full flex items-center justify-between px-4 md:px-10">
        
        {/* Left Side Dots - Reverse Delay moves inward toward logo */}
        <div className="flex flex-1 justify-evenly items-center">
          {dots.map((dot) => (
            <div
              key={`left-${dot}`}
              className="w-1 h-1 md:w-1.5 md:h-1.5 opacity-30 rounded-full bg-zinc-300 [animation:wave_1.5s_ease-in-out_infinite]"
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
            // --- ADDED BUMPY ANIMATION ---
            // This applies 'bump' animation defined below
            className="object-contain [animation:bump_3s_ease-in-out_infinite]"
            priority
          />
        </div>

        {/* Right Side Dots - Sequential Delay moves outward from logo */}
        <div className="flex flex-1 justify-evenly items-center">
          {dots.map((dot) => (
            <div
              key={`right-${dot}`}
              className="w-1 h-1 md:w-1.5 md:h-1.5 opacity-30 rounded-full bg-zinc-300 [animation:wave_1.5s_ease-in-out_infinite]"
              style={{ animationDelay: `${dot * 0.1}s` }}
            />
          ))}
        </div>
      </div>

      {/* --- ADDED BUMP KEYFRAME --- */}
      <style jsx global>{`
        /* Original smooth ease-in-out wave for dots */
        @keyframes wave {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.6); opacity: 1; }
        }

        /* Subtle 'bumpy' ease-in-out wave for logo */
        @keyframes bump {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); } /* Minimal scale for subtle look */
        }
      `}</style>
    </div>
  );
};

export default Preloader;