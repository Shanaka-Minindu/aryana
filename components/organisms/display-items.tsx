"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { DisplayItemsProps, selectedProduct } from '@/types';
import Product from '../molecules/product';
import { Button } from '@/components/ui/button';


interface displayItemsProp {
  displayItems: {
    products: selectedProduct[];
    title: string;
    categorySlug: string;
  };
}

const DisplayItems = ({ displayItems }: displayItemsProp) => {
  const { products, title, categorySlug } = displayItems;
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Update button states based on scroll position
  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    const node = scrollRef.current;
    if (node) {
      node.addEventListener('scroll', checkScroll);
      // Initial check
      checkScroll();
      return () => node.removeEventListener('scroll', checkScroll);
    }
  }, [products]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' 
        ? scrollRef.current.scrollLeft - clientWidth 
        : scrollRef.current.scrollLeft + clientWidth;
      
      scrollRef.current.scrollTo({
        left: scrollTo,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="w-full py-16 px-4 md:px-8 lg:px-12 bg-white">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex items-end justify-between mb-10">
          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-zinc-900">
              {title}
            </h2>
            <div className="h-1 w-12 bg-zinc-900" />
          </div>
          
          {/* Navigation Controls - Hidden on very small screens if preferred, 
              but usually good to keep for accessibility */}
          <div className="hidden sm:flex items-center gap-3">
            <button 
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className="p-3 rounded-full border border-zinc-200 hover:bg-zinc-900 hover:text-white transition-all disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-zinc-400"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button 
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className="p-3 rounded-full border border-zinc-200 hover:bg-zinc-900 hover:text-white transition-all disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-zinc-400"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Sliding Track */}
        <div 
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {products.map((product) => (
            <motion.div 
              key={product.id} 
              className="min-w-[85%] sm:min-w-[45%] lg:min-w-[23%] snap-start"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <Product product={product} />
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
        <div className="mt-14 flex justify-center">
          <Link href={`/shop/${categorySlug}`}>
            <Button 
              className="group relative overflow-hidden rounded-full bg-zinc-900 px-10 py-7 text-sm font-bold uppercase tracking-[0.2em] text-white transition-all hover:bg-zinc-800"
            >
              <span className="relative z-10 flex items-center gap-3">
                Explore Collection
                <div className="h-1.5 w-1.5 rounded-full bg-white transition-transform group-hover:scale-150" />
              </span>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default DisplayItems;