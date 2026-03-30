"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useGetProductSizes } from "@/hooks/use-get-product-sizes";
import { ProductWithRelations } from "@/types";

// --- 1. The Skeleton Component ---
const ProductSkeleton = () => (
  <div className="max-w-[1600px] mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-6 gap-12 animate-pulse">
    {/* Left Side: Image Gallery Placeholder */}
    <div className="lg:col-span-4 space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        <div className="bg-zinc-100 aspect-[3/4] w-full" />
        <div className="bg-zinc-100 aspect-[3/4] w-full hidden lg:block" />
        <div className="bg-zinc-100 aspect-[3/4] w-full hidden lg:block" />
        <div className="bg-zinc-100 aspect-[3/4] w-full hidden lg:block" />
      </div>
    </div>

    {/* Right Side: Details Placeholder */}
    <div className="lg:col-span-2 space-y-10 px-8">
      <div className="space-y-4">
        <div className="h-10 bg-zinc-100 w-3/4" />
        <div className="h-4 bg-zinc-100 w-1/4" />
        <div className="h-8 bg-zinc-100 w-1/2 mt-6" />
      </div>

      <div className="space-y-6 pt-10">
        <div className="h-4 bg-zinc-100 w-1/3" />
        <div className="flex gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-9 h-9 rounded-full bg-zinc-100" />
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <div className="h-4 bg-zinc-100 w-1/3" />
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-zinc-100" />
          ))}
        </div>
      </div>

      <div className="h-16 bg-zinc-100 rounded-full w-full mt-10" />
    </div>
  </div>
);

// --- 2. The Main Component ---
interface props {
  productData: ProductWithRelations;
}

const ProductPageClient = ({ productData }: props) => {
  const { colors, getSizes, sizesIsActive, sizesNStock } = useGetProductSizes(productData.variants);
  const [mounted, setMounted] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [showAllImages, setShowAllImages] = useState(false);
  const [errors, setErrors] = useState<{ color?: string; size?: string }>({});

// Fix Hydration: Only run effects after mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);
  const images = productData.images;
  const isSingleImage = images.length === 1;
  const displayImages = showAllImages ? images : images.slice(0, 4);

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    setSelectedSize(null);
    setErrors((prev) => ({ ...prev, color: undefined }));
    getSizes(color, productData.id);
  };

  const handleAddToCart = () => {
    const result = AddToCartSchema.safeParse({
      color: selectedColor,
      size: selectedSize,
      productId: productData.id,
      quantity: 1,
    });

    if (!result.success) {
      const formattedErrors = result.error.format();
      setErrors({
        color: formattedErrors.color?._errors[0],
        size: formattedErrors.size?._errors[0],
      });
      return;
    }
    alert(JSON.stringify(result.data, null, 2));
  };

  // --- 3. Return Skeleton instead of empty div ---
  if (!mounted) {
    return <ProductSkeleton />;
  }

  return (
    <div 
      className="max-w-[1600px] mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-6 gap-12"
      suppressHydrationWarning
    >
      {/* Left Side: Images */}
      <div className="lg:col-span-4 space-y-4">
        {isSingleImage ? (
          <div className="relative w-full aspect-[4/5] bg-zinc-50 overflow-hidden">
            <Image
              src={images[0].url}
              alt={productData.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 66vw"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="relative group">
            <div className="flex lg:grid lg:grid-cols-2 gap-2 overflow-x-auto lg:overflow-visible no-scrollbar snap-x snap-mandatory">
              <AnimatePresence mode="popLayout" initial={false}>
                {displayImages.map((img, idx) => (
                  <motion.div
                    key={img.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="relative aspect-[3/4] min-w-[90vw] lg:min-w-0 bg-zinc-50 snap-center"
                  >
                    <Image
                      src={img.url}
                      alt={`${productData.name} ${idx}`}
                      fill
                      sizes="(max-width: 1024px) 90vw, 33vw"
                      className="object-cover"
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {images.length > 4 && (
              <div className="hidden lg:flex justify-center pt-6">
                <button
                  onClick={() => setShowAllImages(!showAllImages)}
                  className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 hover:text-black transition-all"
                >
                  {showAllImages ? (
                    <><ChevronUp size={18} /> Show Less</>
                  ) : (
                    <><ChevronDown size={18} /> View All {images.length} Images</>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Side: Details */}
      <div className="lg:col-span-2 space-y-10 px-8 sticky top-12 h-fit">
        <header className="space-y-2">
          <h1 className="text-3xl font-medium tracking-tight text-zinc-900 leading-tight">
            {productData.name}
          </h1>
          <p className="text-zinc-400 text-xs uppercase tracking-widest font-semibold">
            {productData.category.name} — SKU: {productData.id.split("-")[0]}
          </p>
          <div className="pt-4">
            {productData.isSale && productData.salePrice ? (
              <div className="flex items-baseline gap-4">
                <span className="text-2xl font-bold text-red-600">LKR {productData.salePrice.toLocaleString()}</span>
                <span className="text-lg text-zinc-400 line-through font-light">LKR {productData.price.toLocaleString()}</span>
              </div>
            ) : (
              <span className="text-2xl font-bold text-zinc-900">LKR {productData.price.toLocaleString()}</span>
            )}
          </div>
        </header>

        <div className="space-y-8">
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest flex justify-between">
              Select Color: <span className="text-zinc-500">{selectedColor || "None"}</span>
            </span>
            <div className="flex gap-3">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => handleColorSelect(color)}
                  className={cn(
                    "w-9 h-9 rounded-full border-2 transition-all",
                    selectedColor === color ? "border-black scale-110" : "border-gray-300"
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            {errors.color && <p className="text-red-500 text-xs font-medium">{errors.color}</p>}
          </div>

          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest flex justify-between">
              Select Size: <span className="text-zinc-500">{selectedSize || "None"}</span>
            </span>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {sizesNStock.map(([size, hasStock]) => (
                <button
                  key={size}
                  disabled={!sizesIsActive || !hasStock}
                  onClick={() => {
                    setSelectedSize(size);
                    setErrors((prev) => ({ ...prev, size: undefined }));
                  }}
                  className={cn(
                    "py-3 text-xs font-bold border transition-all relative overflow-hidden",
                    selectedSize === size ? "bg-black text-white border-black" : "bg-white text-zinc-900 border-zinc-200 hover:border-black",
                    (!sizesIsActive || !hasStock) && "opacity-40 cursor-not-allowed bg-zinc-50 border-dashed"
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
            {errors.size && <p className="text-red-500 text-xs font-medium">{errors.size}</p>}
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <Button 
            onClick={handleAddToCart}
            className="w-full py-7 rounded-full bg-black text-white uppercase font-bold tracking-widest"
          >
            Add to Cart
          </Button>
        </div>

        <div className="pt-8 border-t border-zinc-100">
           <h4 className="font-bold uppercase text-xs tracking-widest mb-4">Description</h4>
           <p className="text-sm text-zinc-600 leading-relaxed">{productData.description}</p>
        </div>
      </div>
    </div>
  );
};

const AddToCartSchema = z.object({
  color: z.string().min(1, { message: "Please select a color" }),
  size: z.string().min(1, { message: "Please select a size" }),
  productId: z.string().uuid(),
  quantity: z.number().int().positive().default(1),
});

export default ProductPageClient;