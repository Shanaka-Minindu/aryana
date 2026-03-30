"use client";
import { useState, useMemo } from "react";
import { ProductVariant } from "@/lib/generated/prisma";
import { getSizesRelatedToColor } from "@/lib/actions/product.actions";

export const useGetProductSizes = (initialVariants: ProductVariant[]) => {
  // 1. Generate unique initial colors
  const colors = useMemo(() => {
    const uniqueColors = Array.from(
      new Set(initialVariants.map((v) => v.color)),
    );
    return uniqueColors;
  }, [initialVariants]);

  // State for dynamic values
  const [sizesNStock, setSizesNStock] = useState<[string, boolean][]>(() => {
    // 2. Initial call: all unique sizes from initialVariants, marked as true
    const uniqueSizes = Array.from(new Set(initialVariants.map((v) => v.size)));
    return uniqueSizes.map((size) => [size, true]);
  });

  const [sizesIsActive, setSizesIsActive] = useState<boolean>(false);

  // 4. getSizes function
  const getSizes = async (color: string, productId: string) => {
    try {
      const response = await getSizesRelatedToColor({ color, productId });

      if (response.success && response.data) {
        // Transform the variants into [size, hasStock] format
        // size: string, stock: boolean (true if stock > 0)
        const newSizes: [string, boolean][] = response.data.map((variant) => [
          variant.size,
          variant.stock > 0,
        ]);

        setSizesNStock(newSizes);
        setSizesIsActive(true);
      } else {
        // Optional: Handle error case (e.g., clear sizes or keep old ones)
        console.error(response.message);
        setSizesIsActive(false);
      }
    } catch (error) {
      console.error("Error fetching sizes:", error);
      setSizesIsActive(false);
    }
  };

  return {
    colors, // Static list of available colors
    sizesNStock, // Dynamic list of [size, inStock]
    sizesIsActive, // Becomes true after a specific color is picked
    getSizes,
  };
};
