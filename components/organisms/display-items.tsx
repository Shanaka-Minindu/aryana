"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { DisplayItemsProps } from '@/types';
import Product from '../molecules/product';
import { Button } from '@/components/ui/button';

interface displayItemsProp {
  displayItems: DisplayItemsProps;
}

const DisplayItems = ({ displayItems }: displayItemsProp) => {
  const { products, title, categorySlug } = displayItems;
  
  const [startIndex, setStartIndex] = useState(0);
  const [itemsToShow, setItemsToShow] = useState(4);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setItemsToShow(1); // Mobile: 1 item
      } else if (window.innerWidth < 1024) {
        setItemsToShow(2); // Tablet: 2 items
      } else {
        setItemsToShow(4); // Desktop: 4 items
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const nextSlide = () => {
    // Slide by 1 item at a time
    if (startIndex + itemsToShow < products.length) {
      setStartIndex((prev) => prev + 1);
    }
  };

  const prevSlide = () => {
    if (startIndex > 0) {
      setStartIndex((prev) => prev - 1);
    }
  };

  return (
    <section className="w-full py-12 px-4 md:px-8 lg:px-12 bg-white overflow-hidden">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl md:text-2xl font-bold uppercase tracking-tight text-slate-900">
          {title}
        </h2>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={prevSlide}
            disabled={startIndex === 0}
            className="p-2 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-5 w-5 text-slate-600" />
          </button>
          <button 
            onClick={nextSlide}
            disabled={startIndex + itemsToShow >= products.length}
            className="p-2 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-5 w-5 text-slate-600" />
          </button>
        </div>
      </div>

      {/* Sliding Track Container */}
      <div className="relative">
        <motion.div 
          className="flex gap-6 md:gap-8"
          initial={false}
          animate={{ x: `calc(-${startIndex * (100 / itemsToShow)}% - ${startIndex * (32 / itemsToShow)}px)` }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }} // Smooth glide
        >
          {products.map((product) => (
            <div 
              key={product.id} 
              style={{ flex: `0 0 calc(${100 / itemsToShow}% - ${( (itemsToShow - 1) * 32) / itemsToShow}px)` }}
            >
              <Product product = {product} />
            </div>
          ))}
        </motion.div>
      </div>

      <div className="mt-12 flex justify-center">
        <Link href={`/shop/${categorySlug}`}>
          <Button 
            variant="outline" 
            className="rounded-full px-12 py-6 text-sm font-bold uppercase tracking-widest bg-black text-white hover:bg-zinc-800 transition-all flex items-center gap-2"
          >
            View All
            <span className="w-1.5 h-1.5 rounded-full bg-white ml-1" />
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default DisplayItems;