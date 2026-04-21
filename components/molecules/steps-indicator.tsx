import React from "react";
import { Check } from "lucide-react"; // Import Check icon from lucide-react
import { cn } from "@/lib/utils"; // Assuming you have shadcn's cn utility

interface StepsIndicatorProps {
  step: number; // The current active step (1, 2, or 3)
  totalSteps:number
}

const StepsIndicator = ({ step,totalSteps=1 }: StepsIndicatorProps) => {


  return (
    <div className="flex items-center justify-center w-full max-w-sm mx-auto">
      {Array.from({ length: totalSteps }).map((_, index) => {
        const currentStepNumber = index + 1;
        const isCompleted = currentStepNumber < step;
        const isActive = currentStepNumber === step;
        const isLastStep = currentStepNumber === totalSteps;

        return (
          <React.Fragment key={currentStepNumber}>
            {/* Step Circle */}
            <div
              className={cn(
                "flex items-center justify-center rounded-full border-2 transition-colors duration-300 shadow-sm",
                // Size matches image aspect ratio approx
                "w-12 h-12", 
                {
                  // Completed Step: Filled circle, no border
                  "bg-zinc-900 border-zinc-900 text-white": isCompleted,
                  
                  // Active Step: Bordered circle, light fill (matches image_9.png circle 1)
                  "bg-zinc-50 border-zinc-500 text-zinc-600": isActive,
                  
                  // Upcoming Step: Light fill, light border (matches image_9.png circles 2, 3)
                  "bg-zinc-100/70 border-zinc-100 text-zinc-400": !isCompleted && !isActive,
                }
              )}
            >
              {isCompleted ? (
                // Show Checkmark for completed steps
                <Check className="w-6 h-6 stroke-[3]" />
              ) : (
                // Show Number for active and upcoming steps
                <span className="text-xl font-bold font-sans">
                  {currentStepNumber}
                </span>
              )}
            </div>

            {/* Connecting Line (don't show after the last step) */}
            {!isLastStep && (
              <div
                className={cn(
                  "flex-1 h-1 mx-1 rounded-full transition-colors duration-300",
                  {
                    // Line after a completed step is dark
                    "bg-zinc-900": isCompleted,
                    // Line before an uncompleted step is light (matches image_9.png lines)
                    "bg-zinc-100": !isCompleted,
                  }
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default StepsIndicator;