import React, { useState } from "react";
import StepsIndicator from "../molecules/steps-indicator";
import CreateCarousel from "../molecules/create-carousel";
import AddCarouselItems from "../molecules/add-carousel-items";
import { useCarouselStore } from "@/store/use-carousel-store";

interface AddCarouselProps {
  carouselCounts: number[];
}

const AddCarousel = ({ carouselCounts }: AddCarouselProps) => {
  const { carouselId } = useCarouselStore();

  return (
    <div className="w-full bg-white border border-zinc-100 rounded-xl p-8 shadow-sm max-w-5xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col gap-6 mb-8">
        <h2 className="text-xl font-bold text-zinc-900 border-b border-zinc-50 pb-4">
          Add Carousel
        </h2>

        {/* Progress Indicator integration */}
        <div className="w-full py-4">
          <div className="mb-6">
            <StepsIndicator totalSteps={2} step={carouselId === "" ? 1 : 2} />
          </div>

          {carouselId === "" ? (
            <CreateCarousel carouselCounts={carouselCounts} />
          ) : (
            <AddCarouselItems />
          )}
        </div>
      </div>
    </div>
  );
};

export default AddCarousel;
