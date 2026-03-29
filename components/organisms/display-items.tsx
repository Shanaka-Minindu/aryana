"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setItemsToShow(2);
      } else {
        setItemsToShow(4);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const nextSlide = () => {
    if (startIndex + itemsToShow < products.length) {
      setDirection(1);
      setStartIndex((prev) => prev + 1);
    }
  };

  const prevSlide = () => {
    if (startIndex > 0) {
      setDirection(-1);
      setStartIndex((prev) => prev - 1);
    }
  };

  const visibleProducts = products.slice(startIndex, startIndex + itemsToShow);

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
            className="p-2 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4 text-slate-600" />
          </button>
          <button 
            onClick={nextSlide}
            disabled={startIndex + itemsToShow >= products.length}
            className="p-2 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4 text-slate-600" />
          </button>
        </div>
      </div>

      {/* Grid with Framer Motion Layout animations */}
      <div className={`grid gap-6 md:gap-8 ${
        itemsToShow === 2 ? "grid-cols-2" : "grid-cols-4"
      }`}>
        <AnimatePresence initial={false} mode="popLayout">
          {visibleProducts.map((product) => (
            <motion.div
              key={product.id}
              layout // Smoothly re-positions remaining items
              initial={{ opacity: 0, x: direction * 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -direction * 50 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 30,
                opacity: { duration: 0.2 } 
              }}
            >
              <Product product={product} />
            </motion.div>
          ))}
        </AnimatePresence>
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