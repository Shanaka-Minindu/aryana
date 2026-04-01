import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface PageColumnsProps {
  columnChange: (size: number) => void;
  currentColumn: number; // Added to highlight the active state
}

const PageColumns = ({ columnChange, currentColumn }: PageColumnsProps) => {
  // Config for the column icons (number of bars)
  const columnOptions = [
    { id: 2, bars: 2 },
    { id: 3, bars: 3 },
    { id: 4, bars: 4 },
    { id: 5, bars: 5 },
  ];

  return (
    <div className="hidden md:flex items-center border-x border-zinc-200">
      {columnOptions.map((option) => (
        <button
          key={option.id}
          onClick={() => columnChange(option.id)}
          // Tablet logic: Hide 5-column button on medium screens, show on large
          className={cn(
            "px-4 h-10 border-r border-zinc-200 flex items-center justify-center transition-colors hover:bg-zinc-50",
            option.id === 5 && "md:hidden lg:flex",
            currentColumn === option.id ? "bg-zinc-100" : "bg-transparent"
          )}
        >
          <div className="flex gap-[2px]">
            {/* Generate the vertical bars dynamically */}
            {Array.from({ length: option.bars }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-[3px] h-4 rounded-full",
                  currentColumn === option.id ? "bg-zinc-900" : "bg-zinc-300"
                )}
              />
            ))}
          </div>
        </button>
      ))}
    </div>
  );
};

export default PageColumns;