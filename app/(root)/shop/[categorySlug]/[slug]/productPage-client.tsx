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
        toast.error("something went wrong!!, Please try again", {
          id: toastId,
        });
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

          {/* Sold Out Badge */}
          {isSoldOut && (
            <div className="">
              <Badge
                variant="destructive"
                className="rounded-full uppercase text-[10px] tracking-widest px-4 py-3"
              >
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
                    isSoldOut && "opacity-30 cursor-not-allowed grayscale",
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
              className={cn(
                "w-full py-7 rounded-full uppercase font-bold tracking-widest transition-all flex items-center justify-center gap-2",
                "bg-[#25D366] text-white hover:bg-[#20ba5a] shadow-md hover:shadow-lg",
              )}
            >
              {/* WhatsApp Image from the public folder */}
              <Image
                src="/whatsapp-svg.svg"
                alt="WhatsApp"
                width={24}
                height={24}
                className="w-6 h-6 object-contain brightness-0 invert"
                priority
              />
              Contact via WhatsApp
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

<div className="pt-8 border-t border-zinc-100">
  <h4 className="font-bold uppercase text-xs tracking-widest mb-4 text-zinc-800">
    Social media handles
  </h4>
  
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
    {/* Facebook Link 1 */}
    <a 
      href="https://www.facebook.com/Aryana.Couture.Atelier" 
      target="_blank" 
      rel="noopener noreferrer"
      className="flex items-center gap-3 p-3 rounded-xl border border-zinc-100 bg-zinc-50/50 hover:bg-blue-50/40 hover:border-blue-200 transition-all duration-200 group"
    >
      <div className="relative w-6 h-6 shrink-0">
        <Image 
          src="/facebook-svg.svg" 
          alt="Facebook" 
          fill
          className="object-contain"
        />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 group-hover:text-blue-500 transition-colors">Facebook</span>
        <span className="text-sm font-medium text-zinc-700 group-hover:text-zinc-900 truncate">Aryana</span>
      </div>
    </a>

    {/* Facebook Link 2 */}
    <a 
      href="https://www.facebook.com/profile.php?id=61575153235407" 
      target="_blank" 
      rel="noopener noreferrer"
      className="flex items-center gap-3 p-3 rounded-xl border border-zinc-100 bg-zinc-50/50 hover:bg-blue-50/40 hover:border-blue-200 transition-all duration-200 group"
    >
      <div className="relative w-6 h-6 shrink-0">
        <Image 
          src="/facebook-svg.svg" 
          alt="Facebook" 
          fill
          className="object-contain"
        />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 group-hover:text-blue-500 transition-colors">Facebook</span>
        <span className="text-sm font-medium text-zinc-700 group-hover:text-zinc-900 truncate">aryanacollection.lk</span>
      </div>
    </a>

    {/* Instagram Link 1 */}
    <a 
      href="https://www.instagram.com/aryana_couture_atelier?igsh=MTRxcTI0eWt2MjFrNA%3D%3D&utm_source=qr" 
      target="_blank" 
      rel="noopener noreferrer"
      className="flex items-center gap-3 p-3 rounded-xl border border-zinc-100 bg-zinc-50/50 hover:bg-pink-50/40 hover:border-pink-200 transition-all duration-200 group"
    >
      <div className="relative w-6 h-6 shrink-0">
        <Image 
          src="/instagram.svg" 
          alt="Instagram" 
          fill
          className="object-contain"
        />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 group-hover:text-pink-500 transition-colors">Instagram</span>
        <span className="text-sm font-medium text-zinc-700 group-hover:text-zinc-900 truncate">aryana_couture_atelier</span>
      </div>
    </a>

    {/* Instagram Link 2 */}
    <a 
      href="https://www.instagram.com/aryana_collection.lk?igsh=MWQweGZneHJ5dTR5Mg%3D%3D&utm_source=qr" 
      target="_blank" 
      rel="noopener noreferrer"
      className="flex items-center gap-3 p-3 rounded-xl border border-zinc-100 bg-zinc-50/50 hover:bg-pink-50/40 hover:border-pink-200 transition-all duration-200 group"
    >
      <div className="relative w-6 h-6 shrink-0">
        <Image 
          src="/instagram.svg" 
          alt="Instagram" 
          fill
          className="object-contain"
        />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 group-hover:text-pink-500 transition-colors">Instagram</span>
        <span className="text-sm font-medium text-zinc-700 group-hover:text-zinc-900 truncate">aryana_collection.lk</span>
      </div>
    </a>
  </div>
</div>
      </div>
    </div>
  );
};

export default ProductPageClient;