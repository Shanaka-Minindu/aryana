"use server";

import { prisma } from "@/db/prisma";
import { ProductWithRelations, ServerActionResponse } from "@/types";
import { ProductVariant } from "../generated/prisma";

export async function getProduct(
  slug: string,
): Promise<ServerActionResponse<ProductWithRelations>> {
  try {
    // 1. Fetch the product by unique slug
    const product = await prisma.product.findUnique({
      where: {
        slug: slug,
        isActive: true, // Ensure we don't return "hidden" or deleted products
      },
      include: {
        images: {
          orderBy: {
            isPrimary: "desc", // Puts the primary image at index 0
          },
        },
        variants: true,
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    });

    // 2. Handle case where product doesn't exist
    if (!product) {
      return {
        success: false,
        message: "Product not found.",
      };
    }

    return {
      success: true,
      message: "Product fetched successfully",
      data: product as ProductWithRelations,
    };
  } catch (error) {
    console.error("GET_PRODUCT_ERROR:", error);
    return {
      success: false,
      message: "An error occurred while fetching the product.",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

interface getSizesProps {
  productId: string;
  color: string;
}

export async function getSizesRelatedToColor({
  color,
  productId,
}: getSizesProps): Promise<ServerActionResponse<ProductVariant[]>> {
  try {
    // 1. Validate inputs
    if (!productId || !color) {
      return {
        success: false,
        message: "Product ID and Color are required.",
      };
    }

    // 2. Fetch all variants matching both Product and Color
    const variants = await prisma.productVariant.findMany({
      where: {
        productId: productId,
        color: color,
      },
      orderBy: {
        size: "asc", // Keeps S, M, L somewhat organized
      },
    });

    // 3. Handle case where no variants exist for that color
    if (variants.length === 0) {
      return {
        success: false,
        message: "No sizes found for the selected color.",
      };
    }

    return {
      success: true,
      message: "Sizes fetched successfully",
      data: variants,
    };
  } catch (error) {
    console.error("GET_SIZES_BY_COLOR_ERROR:", error);
    return {
      success: false,
      message: "Failed to load size information.",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
