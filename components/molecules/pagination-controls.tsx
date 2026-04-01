import React from "react";
import { usePagination, DOTS } from "@/hooks/use-pagination";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationControlsProps {
  currentPage: number;
  totalPage: number;
  siblingCount?: number;
  onPageChange: (page: number) => void;
  isDisabled?: boolean;
}

const PaginationControls = ({
  currentPage,
  onPageChange,
  totalPage,
  isDisabled,
  siblingCount = 1,
}: PaginationControlsProps) => {
  const paginationRange = usePagination({
    currentPage,
    totalPage,
    siblingCount,
  });

  // If there are less than 2 pages in pagination range we shall not render the component
  if (currentPage === 0 || paginationRange.length < 2) {
    return null;
  }

  const onNext = () => {
    if (currentPage < totalPage) {
      onPageChange(currentPage + 1);
    }
  };

  const onPrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  return (
    <div className="flex items-center justify-center space-x-2 py-8">
      {/* Back Button */}
      <button
        disabled={currentPage === 1 || isDisabled}
        onClick={onPrevious}
        className={cn(
          "flex items-center gap-2 px-4 py-2 text-sm font-medium border border-zinc-200 rounded-md transition-all",
          "hover:bg-zinc-50 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
        )}
      >
        <ChevronLeft size={16} />
        Back
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-2">
        {paginationRange.map((pageNumber, index) => {
          // Render Dots
          if (pageNumber === DOTS) {
            return (
              <span
                key={`dots-${index}`}
                className="px-3 py-2 text-zinc-400"
              >
                &#8230;
              </span>
            );
          }

          // Render Page Number Button
          return (
            <button
              key={pageNumber}
              disabled={isDisabled}
              onClick={() => onPageChange(Number(pageNumber))}
              className={cn(
                "min-w-[40px] h-10 flex items-center justify-center text-sm font-bold border border-zinc-200 rounded-md transition-all",
                currentPage === pageNumber
                  ? "bg-black text-white border-black"
                  : "bg-white text-zinc-900 hover:border-black",
                isDisabled && "opacity-50 cursor-not-allowed"
              )}
            >
              {pageNumber}
            </button>
          );
        })}
      </div>

      {/* Next Button */}
      <button
        disabled={currentPage === totalPage || isDisabled}
        onClick={onNext}
        className={cn(
          "flex items-center gap-2 px-4 py-2 text-sm font-medium border border-zinc-200 rounded-md transition-all",
          "hover:bg-zinc-50 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
        )}
      >
        Next
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

export default PaginationControls;