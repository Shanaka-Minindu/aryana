"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { getCategoryHomeData } from "@/types";

interface CategoryBoxProps {
  categoryBox: getCategoryHomeData[];
}

const CategoryBox = ({ categoryBox }: CategoryBoxProps) => {
  return (
    /* Requirement 3: Removed horizontal padding to get full width */
    <section className="w-full py-0 bg-white">
      {/* Container Logic:
        - Mobile/MD: Flexbox scroll. 
        - MD: width logic ensures 2x2 visible area (w-[50%])
        - LG: Grid 4x2
      */}
      <div className="flex overflow-x-auto no-scrollbar lg:grid lg:grid-cols-4 lg:gap-0">
        {categoryBox.map((category,index) => (
          <Link
            key={index}
            href={`/shop/${category.slug}`}
            /* Requirement 2: Gap set to 0. 
               Requirement 4: MD screens show 2 items (50% width) 
            */
            className="relative flex-none w-[70vw] md:w-[50vw] lg:w-full aspect-square overflow-hidden group"
          >
            {/* Requirement 1: Enhanced Zoom Effect */}
            <motion.div
              className="relative w-full h-full"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }} // Smooth "expo" out ease
            >
              <Image
                src={category.imageUrl}
                alt={category.name}
                fill
                sizes="(max-width: 768px) 70vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover"
              />

              {/* Requirement 3: Black Overlay */}
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500" />
            </motion.div>

            {/* Category Name Label */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white text-sm md:text-lg font-bold uppercase tracking-[0.2em] drop-shadow-lg transition-transform duration-500 group-hover:scale-110">
                {category.name}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CategoryBox;
