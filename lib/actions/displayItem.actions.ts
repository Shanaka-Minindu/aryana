"use server";

import { prisma } from "@/db/prisma";
import {
  DisplayItemsProps,
  selectedProduct,
  ServerActionResponse,
} from "@/types";
import { ProductImage } from "../generated/prisma";

export async function getDisplayItems(
  position: number,)
:Promise<ServerActionResponse<DisplayItemsProps>> {
  try {
    const displayItem = await prisma.displayItem.findUnique({
      where: {
        position: position,
        isActive: true,
      },
      include:{
        items:{
          orderBy: {
            position: "asc",
          },
          take: 8,
          include:{
            product:{
              include:{
                images:true,
                variants:true
              }
            }
          }
        }
      }
      
    });

    if (!displayItem) {
      return {
        success: false,
        message: "Display group not found",
      };
    }

    const formattedProducts: selectedProduct[] = displayItem.items.map(
      (junction) => {
        const product = junction.product;

        // 1. Extract Unique Colors
        // Use a Set to automatically remove duplicates from variants
        const uniqueColors = Array.from(
          new Set(product.variants.map((v) => v.color)),
        );

        // 2. Filter Images (1 Primary + 1 Other)
        const primaryImg =
          product.images.find((img) => img.isPrimary) || product.images[0];
        const secondaryImg =
          product.images.find((img) => img.id !== primaryImg?.id) || null;

        const finalImages: ProductImage[] = [];
        if (primaryImg) finalImages.push(primaryImg);
        if (secondaryImg) finalImages.push(secondaryImg);

        return {
          id: product.id,
          name: product.name,
          price: product.price,
          categorySlug:displayItem.slug,
          slug: product.slug,
          isActive: product.isActive,
          isSale: product.isSale,
          salePrice: product.salePrice || undefined,
          colors: uniqueColors,
          images: finalImages,
        };
      },
    );

    return {
      success: true,
      data: {
        id: displayItem.id,
        title: displayItem.title,
        categorySlug: displayItem.slug,
        categoryId: displayItem.categoryId,
        position: displayItem.position,
        isActive: displayItem.isActive,
        products: formattedProducts,
      },
    };
  } catch (error) {
    console.error("GET_DISPLAY_ITEMS_ERROR:", error);
    return {
      success: false,
      message: "Failed to fetch display items",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}



