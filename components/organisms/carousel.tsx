"use client";

import React, { useCallback, useEffect, useState } from "react"; // Added useState
import Image from "next/image";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { carouselItem } from "@/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils"; // Ensure you have this utility

interface CarouselItemsProp {
  items: carouselItem[];
}

const Carousel = ({ items }: CarouselItemsProp) => {
  const [selectedIndex, setSelectedIndex] = useState(0); // Track active slide

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5000, stopOnInteraction: false }),
  ]);

  // Function to update the index state
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  // Set up the listener for slide changes
  useEffect(() => {
    if (!emblaApi) return;
    onSelect(); // Set initial index
    emblaApi.on("select", onSelect); // Listen for manual or autoplay changes
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);

  return (
    <div className="relative overflow-hidden bg-zinc-100" ref={emblaRef}>
      <div className="flex">
        {items.map((item) => (
          <div key={item.id} className="relative min-w-full h-[500px] md:h-[600px] flex-[0_0_100%]">
            <Image
              src={item.imgUrl}
              alt={item.heading}
              fill
              priority
              className="object-cover"
            />
            
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/10 text-center px-4">
              <div className="max-w-4xl space-y-6">
                <h1 className="text-5xl md:text-8xl font-bold tracking-tighter text-white drop-shadow-md uppercase">
                  {item.heading}
                </h1>
                <p className="text-lg md:text-xl text-white font-medium drop-shadow-sm">
                  {item.subHeading}
                </p>
                <div className="pt-4">
                  <Link href={item.linkUrl}>
                    <Button 
                      size="lg" 
                      className="rounded-full bg-black hover:bg-zinc-800 text-white px-10 py-7 text-lg font-bold uppercase transition-transform hover:scale-105"
                    >
                      {item.buttonText}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Manual Controllers */}
      <button
        onClick={scrollPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-sm transition-all"
      >
        <ChevronLeft className="h-8 w-8" />
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-sm transition-all"
      >
        <ChevronRight className="h-8 w-8" />
      </button>

      {/* FIXED: Progress Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {items.map((_, index) => (
          <button 
            key={index} 
            onClick={() => scrollTo(index)}
            className={cn(
              "h-1.5 w-12 rounded-full transition-all duration-300",
              selectedIndex === index 
                ? "bg-white" // Active state
                : "bg-white/30 hover:bg-white/50" // Inactive state
            )}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;