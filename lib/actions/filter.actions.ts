/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { prisma } from "@/db/prisma";
import {
  getFilterDataRes,
  selectedProduct,
  ServerActionResponse,
} from "@/types";
import { ProductImage } from "../generated/prisma";

export async function getFilterData(): Promise<
  ServerActionResponse<getFilterDataRes>
> {
  try {
    // 1. Fetch Unique Sizes and Colors from Variants
    const variants = await prisma.productVariant.findMany({
      select: {
        size: true,
        color: true,
      },
    });

    // Use Sets to get unique values
    const uniqueSizes = Array.from(new Set(variants.map((v) => v.size))).sort();
    const uniqueColors = Array.from(
      new Set(variants.map((v) => v.color)),
    ).sort();

    // 2. Count In Stock vs Out of Stock based on Product.isActive
    const [inStockCount, outOfStockCount] = await Promise.all([
      prisma.product.count({ where: { isActive: true } }),
      prisma.product.count({ where: { isActive: false } }),
    ]);

    // 3. Get Price Range (Min and Max)
    const priceAggregation = await prisma.product.aggregate({
      _min: {
        price: true,
      },
      _max: {
        price: true,
      },
    });

    // 4. Construct the response
    const data: getFilterDataRes = {
      sizes: uniqueSizes,
      colors: uniqueColors,
      inStock: inStockCount,
      outOfStock: outOfStockCount,
      highPrice: priceAggregation._max.price || 0,
      lowPrice: priceAggregation._min.price || 0,
    };

    return {
      success: true,
      message: "Filter data retrieved successfully",
      data,
    };
  } catch (error) {
    console.error("GET_FILTER_DATA_ERROR:", error);
    return {
      success: false,
      message: "Failed to load filter options.",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

interface getFilteredCategoryDataProps {
  size?: string;
  inStock?: string;
  color?: string;
  minPrice?: string;
  categorySlug:string;
  maxPrice?: string;
  page?: string;
}

interface FilteredCategoryData {
  product: selectedProduct[];
  currentPage: number;
  totalPages: number;
  totalProducts: number;
}

export async function getFilteredCategoryData({
  color,
  inStock,
  maxPrice,
  minPrice,
  page,
  size,
  categorySlug,
}: getFilteredCategoryDataProps): Promise<ServerActionResponse<FilteredCategoryData>> {
  try {
    // 1. Setup Pagination & Conversions
    const limit = Number(process.env.PRODUCTS_PER_PAGE) || 20;
    const currentPage = Number(page) || 1;
    const skip = (currentPage - 1) * limit;

    const sizesArray = size ? size.split(",") : [];
    const colorsArray = color ? color.split(",") : [];
    const min = minPrice ? parseFloat(minPrice) : 0;
    const max = maxPrice ? parseFloat(maxPrice) : Infinity;

    // 2. Category Logic: Handle "shopAll", Parent Categories, and Child Categories
    let categoryIds: string[] = [];

    if (categorySlug !== "shopAll") {
      const category = await prisma.category.findUnique({
        where: { slug: categorySlug },
        include: { children: { select: { id: true } } },
      });

      if (!category) {
        return { success: false, message: "Category not found" };
      }

      // If it's a parent (parentId is null), include all children IDs
      categoryIds = [category.id, ...category.children.map((c) => c.id)];
    }

    // 3. Construct the Where Filter
    const where: any = {
      // Category Filter
      ...(categorySlug !== "shopAll" ? { categoryId: { in: categoryIds } } : {}),
      
      // Price Filter
      price: { gte: min, lte: max },
      
      // Stock/Active Filter
      ...(inStock === "in-stock" ? { isActive: true } : inStock === "out-of-stock" ? { isActive: false } : {}),

      // Variant Filters (Size & Color)
      variants: {
        some: {
          ...(sizesArray.length > 0 ? { size: { in: sizesArray } } : {}),
          ...(colorsArray.length > 0 ? { color: { in: colorsArray } } : {}),
        },
      },
    };

    // 4. Fetch Total Count & Paginated Products
    const [totalProducts, productsData] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: {
          category: { select: { slug: true } },
          images: true,
          variants: { select: { color: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    // 5. Transform to selectedProduct Interface
    const formattedProducts: selectedProduct[] = productsData.map((product) => {
      // Deduplicate colors
      const uniqueColors = Array.from(new Set(product.variants.map((v) => v.color)));

      // Image Logic: 1 Primary + 1 Other
      const primaryImg = product.images.find((img) => img.isPrimary) || product.images[0];
      const secondaryImg = product.images.find((img) => img.id !== primaryImg?.id) || null;
      
      const displayImages: ProductImage[] = [];
      if (primaryImg) displayImages.push(primaryImg);
      if (secondaryImg) displayImages.push(secondaryImg);

      return {
        id: product.id,
        name: product.name,
        price: product.price,
        isActive: product.isActive,
        isSale: product.isSale,
        slug: product.slug,
        categorySlug: product.category.slug,
        salePrice: product.salePrice || undefined,
        colors: uniqueColors,
        images: displayImages,
      };
    });

    return {
      success: true,
      data: {
        product: formattedProducts,
        currentPage,
        totalPages: Math.ceil(totalProducts / limit),
        totalProducts,
      },
    };
  } catch (error) {
    console.error("GET_FILTERED_CATEGORY_DATA_ERROR:", error);
    return {
      success: false,
      message: "Failed to fetch filtered products",
    };
  }
}