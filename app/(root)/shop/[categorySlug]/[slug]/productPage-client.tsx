/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useGetProductSizes } from "@/hooks/use-get-product-sizes";
import { ProductWithRelations } from "@/types";
import { AddToCartSchema } from "@/lib/validators";
import ProductSkeleton from "@/components/organisms/product-skeleton";
import { Session } from "next-auth";
import toast from "react-hot-toast";
import { addItemToCart } from "@/lib/actions/cart.actions";
import { useCartStore } from "@/store/use-cart-store";
import { Badge } from "@/components/ui/badge"; // Ensure you have a badge component

interface props {
  productData: ProductWithRelations;
  session?: Session;
}

const ProductPageClient = ({ productData, session }: props) => {
  const { colors, getSizes, sizesIsActive, sizesNStock } = useGetProductSizes(
    productData.variants,
  );
  const [mounted, setMounted] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [showAllImages, setShowAllImages] = useState(false);
  const [errors, setErrors] = useState<{ color?: string; size?: string }>({});
  const { onOpen, triggerRefresh, onClose } = useCartStore();

  useEffect(() => {
    setMounted(true);
    onClose();
  }, []);

  const images = productData.images;
  const isSingleImage = images.length === 1;
  const displayImages = showAllImages ? images : images.slice(0, 4);
  
  // Logical check for sold out state
  const isSoldOut = productData.isActive === false;

  const handleColorSelect = (color: string) => {
    if (isSoldOut) return; // Disable selection
    setSelectedColor(color);
    setSelectedSize(null);
    setErrors((prev) => ({ ...prev, color: undefined }));
    getSizes(color, productData.id);
  };

  const handleAddToCart = async () => {
    if (isSoldOut) return; // Prevent action

    const result = AddToCartSchema.safeParse({
      color: selectedColor,
      size: selectedSize,
      productId: productData.id,
      quantity: 1,
    });

    if (!result || !result.success) {
      const formattedErrors = result?.error.format();
      setErrors({
        color: formattedErrors?.color?._errors[0],
        size: formattedErrors?.size?._errors[0],
      });
      return;
    }
    
    const toastId = toast.loading("Adding items to your bag...");
    const variant = productData.variants.find(
      (v) =>
        v.color === selectedColor &&
        v.size === selectedSize &&
        v.productId === productData.id,
    );

    if (!variant?.id) {
      toast.error("Something went wrong!!, Please try again", { id: toastId });
      return;
    }

    const { quantity } = result.data;

    if (session?.user?.id && session.user.cartId) {
      const response = await addItemToCart({
        cartIdFromClient: session?.user?.cartId,
        quantity,
        userId: session?.user?.id,
        variantId: variant.id,
      });

      if (response.success) {
        onOpen();
        triggerRefresh();
        toast.success("Woo hoo it's in your bag now", { id: toastId });
      } else {
        toast.error("something went wrong!!, Please try again", { id: toastId });
      }
    } else {
      const localCart = localStorage.getItem("guest-cart");
      const cartItems: { variantId: string; quantity: number }[] = localCart
        ? JSON.parse(localCart)
        : [];

      const existingItemIndex = cartItems.findIndex(
        (item) => item.variantId === variant.id,
      );

      if (existingItemIndex !== -1) {
        cartItems[existingItemIndex].quantity += quantity;
      } else {
        cartItems.push({ variantId: variant.id, quantity });
      }

      localStorage.setItem("guest-cart", JSON.stringify(cartItems));
      onOpen();
      triggerRefresh();
      toast.success("Added to local cart!", { id: toastId });
    }
  };

  if (!mounted) {
    return <ProductSkeleton />;
  }

  return (
    <div
      className="max-w-[1600px] mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-6 gap-12"
      suppressHydrationWarning
    >
      {/* Gallery Section */}
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
                    exit={{ opacity: 0 }}
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
              <div className="flex justify-center pt-6 lg:pt-8">
                <button
                  onClick={() => setShowAllImages(!showAllImages)}
                  className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 hover:text-black transition-all"
                >
                  {showAllImages ? (
                    <>
                      <ChevronUp size={18} />
                      <span className="hidden lg:inline">Show Less Images</span>
                      <span className="lg:hidden">Show Less</span>
                    </>
                  ) : (
                    <>
                      <ChevronRight size={18} className="lg:hidden" />
                      <ChevronLeft size={18} className="hidden lg:block" />
                      <span className="hidden lg:inline">View All {images.length} Images</span>
                      <span className="lg:hidden">View More</span>
                    </>
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
          
          {/* Sold Out Badge */}
          {isSoldOut && (
            <div className="">
              <Badge variant="destructive" className="rounded-full uppercase text-[10px] tracking-widest px-4 py-3">
                Sold Out
              </Badge>
            </div>
          )}

          <p className="text-zinc-400 text-xs uppercase tracking-widest font-semibold pt-2">
            {productData.category.name} — SKU: {productData.id.split("-")[0]}
          </p>
          <div className="pt-4">
            {productData.isSale && productData.salePrice ? (
              <div className="flex items-baseline gap-4">
                <span className="text-2xl font-bold text-red-600">
                  LKR {productData.salePrice.toLocaleString()}
                </span>
                <span className="text-lg text-zinc-400 line-through font-light">
                  LKR {productData.price.toLocaleString()}
                </span>
              </div>
            ) : (
              <span className="text-2xl font-bold text-zinc-900">
                LKR {productData.price.toLocaleString()}
              </span>
            )}
          </div>
        </header>

        <div className="space-y-8">
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest flex justify-between">
              Select Color:{" "}
              <span className="text-zinc-500">{selectedColor || "None"}</span>
            </span>
            <div className="flex gap-3">
              {colors.map((color) => (
                <button
                  key={color}
                  disabled={isSoldOut} // Deactivate selector
                  onClick={() => handleColorSelect(color)}
                  className={cn(
                    "w-9 h-9 rounded-full border-2 transition-all",
                    selectedColor === color
                      ? "border-black scale-110"
                      : "border-gray-300",
                    isSoldOut && "opacity-30 cursor-not-allowed grayscale"
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            {errors.color && (
              <p className="text-red-500 text-xs font-medium">{errors.color}</p>
            )}
          </div>

          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest flex justify-between">
              Select Size:{" "}
              <span className="text-zinc-500">{selectedSize || "None"}</span>
            </span>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {sizesNStock.map(([size, hasStock]) => (
                <button
                  key={size}
                  disabled={isSoldOut || !sizesIsActive || !hasStock} // Deactivate selector
                  onClick={() => {
                    setSelectedSize(size);
                    setErrors((prev) => ({ ...prev, size: undefined }));
                  }}
                  className={cn(
                    "py-3 text-xs font-bold border transition-all relative overflow-hidden",
                    selectedSize === size
                      ? "bg-black text-white border-black"
                      : "bg-white text-zinc-900 border-zinc-200 hover:border-black",
                    (isSoldOut || !sizesIsActive || !hasStock) &&
                      "opacity-40 cursor-not-allowed bg-zinc-50 border-dashed",
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
            {errors.size && (
              <p className="text-red-500 text-xs font-medium">{errors.size}</p>
            )}
          </div>
        </div>

        <div className="space-y-4 pt-4">
          {/* <Button
            onClick={handleAddToCart}
            disabled={isSoldOut} // Deactivate button
            className={cn(
              "w-full py-7 rounded-full uppercase font-bold tracking-widest transition-all",
              isSoldOut 
                ? "bg-zinc-200 text-zinc-400 cursor-not-allowed" 
                : "bg-black text-white"
            )}
          >
            {isSoldOut ? "Out of Stock" : "Add to Cart"}
          </Button> */}
          <a 
  href="https://wa.me/94763474981" // Note: Removed the '+' as per official WhatsApp link guidelines
  target="_blank" 
  rel="noopener noreferrer" 
  className="w-full block" // Ensures the link spans full width like the original button
>
  <Button
    disabled={isSoldOut}
    className={cn(
      "w-full py-7 rounded-full uppercase font-bold tracking-widest transition-all flex items-center justify-center gap-2",
      isSoldOut 
        ? "bg-zinc-200 text-zinc-400 cursor-not-allowed" 
        : "bg-[#25D366] text-white hover:bg-[#20ba5a] shadow-md hover:shadow-lg"
    )}
  >
    {/* WhatsApp SVG Icon */}
    <svg 
      className="w-6 h-6 fill-current" 
      viewBox="0 0 24 24" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.266 2.267 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.713-1.457L0 24zm6.59-4.846c1.66.986 3.288 1.447 5.35 1.448 5.4 0 9.792-4.393 9.795-9.795.002-2.618-1.013-5.079-2.86-6.929C17.028 2.026 14.57 1.01 11.96 1.01c-5.399 0-9.794 4.393-9.797 9.795-.001 2.032.547 3.63 1.545 5.23L2.708 21.3l5.148-1.353z" />
    </svg>
    
    {isSoldOut ? "Out of Stock" : "Contact via WhatsApp"}
  </Button>
</a>
        </div>

        <div className="pt-8 border-t border-zinc-100">
          <h4 className="font-bold uppercase text-xs tracking-widest mb-4">
            Description
          </h4>
          <p className="text-sm text-zinc-600 leading-relaxed">
            {productData.description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductPageClient;