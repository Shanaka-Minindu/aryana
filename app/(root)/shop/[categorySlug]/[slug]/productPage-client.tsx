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

// --- 2. The Main Component ---
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
const { onOpen, triggerRefresh } = useCartStore();

const {onClose} = useCartStore();

  // Fix Hydration: Only run effects after mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    onClose();
    
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

  const handleAddToCart = async () => {
    const result = AddToCartSchema.safeParse({
      color: selectedColor,
      size: selectedSize,
      productId: productData.id,
      quantity: 1,
    });

    // 3. Handle Validation Errors
    if (!result || !result.success) {
      const formattedErrors = result?.error.format();
      setErrors({
        color: formattedErrors?.color?._errors[0],
        size: formattedErrors?.size?._errors[0],
      });
      // Optional: Add a toast error here for better UX

      return;
    }
    const toastId = toast.loading("Adding items to your bag...");
    // 1. Find the correct variant
    const variant = productData.variants.find(
      (v) =>
        v.color === selectedColor &&
        v.size === selectedSize &&
        v.productId === productData.id,
    );
    console.log(variant);

    if (!variant?.id) {
      toast.error("Something went wrong!!, Please try again", {
        id: toastId,
      });
      return;
    }

    const { quantity } = result.data;

    // 4. Integration Logic
    if (session?.user?.id && session.user.cartId) {
      // --- Authenticated User ---
      const response = await addItemToCart({
        cartIdFromClient: session?.user?.cartId,
        quantity,
        userId: session?.user?.id,
        variantId: variant.id,
      });

      if (response.success) {
        onOpen();          // Opens the drawer
        triggerRefresh();  // Tells the drawer to fetch the new data
        toast.success("Woo hoo it's in your bag now", { id: toastId });
      } else {
        toast.error("something went wrong!!, Please try again", {
          id: toastId,
        });
      }
    } else {
      // --- Unauthorized (Guest) User ---

      // Retrieve existing cart or initialize empty array
      const localCart = localStorage.getItem("guest-cart");
      const cartItems: { variantId: string; quantity: number }[] = localCart
        ? JSON.parse(localCart)
        : [];

      // Check if this specific variant is already in the cart
      const existingItemIndex = cartItems.findIndex(
        (item) => item.variantId === variant.id,
      );

      if (existingItemIndex !== -1) {
        // If it exists, increment the quantity
        cartItems[existingItemIndex].quantity += quantity;
      } else {
        // If it's new, add the object
        cartItems.push({ variantId: variant.id, quantity });
      }

      // Save back to LocalStorage
      localStorage.setItem("guest-cart", JSON.stringify(cartItems));

      onOpen();
      triggerRefresh();

      // Success Toast
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
      {/* Gallery Section (Left Side) */}
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
            {/* The Image Track - Remains flexible */}
            <div className="flex lg:grid lg:grid-cols-2 gap-2 overflow-x-auto lg:overflow-visible no-scrollbar snap-x snap-mandatory">
              <AnimatePresence mode="popLayout" initial={false}>
                {displayImages.map((img, idx) => (
                  <motion.div
                    key={img.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }} // Smooth transition for removal
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

            {/* View More Logic - Applied to both mobile and large screens */}
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
                      <ChevronRight size={18} className="lg:hidden" />{" "}
                      {/* Arrow points right on mobile */}
                      <ChevronLeft size={18} className="hidden lg:block" />{" "}
                      {/* Arrow points down on desktop */}
                      <span className="hidden lg:inline">
                        View All {images.length} Images
                      </span>
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
          <p className="text-zinc-400 text-xs uppercase tracking-widest font-semibold">
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
                  onClick={() => handleColorSelect(color)}
                  className={cn(
                    "w-9 h-9 rounded-full border-2 transition-all",
                    selectedColor === color
                      ? "border-black scale-110"
                      : "border-gray-300",
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
                  disabled={!sizesIsActive || !hasStock}
                  onClick={() => {
                    setSelectedSize(size);
                    setErrors((prev) => ({ ...prev, size: undefined }));
                  }}
                  className={cn(
                    "py-3 text-xs font-bold border transition-all relative overflow-hidden",
                    selectedSize === size
                      ? "bg-black text-white border-black"
                      : "bg-white text-zinc-900 border-zinc-200 hover:border-black",
                    (!sizesIsActive || !hasStock) &&
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
          <Button
            onClick={handleAddToCart}
            className="w-full py-7 rounded-full bg-black text-white uppercase font-bold tracking-widest"
          >
            Add to Cart
          </Button>
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
