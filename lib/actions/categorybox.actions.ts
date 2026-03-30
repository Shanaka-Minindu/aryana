"use server";

import { prisma } from "@/db/prisma";
import { getCategoryHomeData, ServerActionResponse } from "@/types";


export async function getCategoryHome(): Promise<
  ServerActionResponse<getCategoryHomeData[]>
> {
  try {
    // 1. Fetch all subcategories (parentId is not null)
    const subCategories = await prisma.category.findMany({
      where: {
        parentId: {
          not: null,
        },
      },
      select: {
        name: true,
        slug: true,
        imageUrl: true,
      },
    });

    if (subCategories.length === 0) {
      return {
        success: false,
        message: "No subcategories found in the database.",
      };
    }

    // 2. Shuffle the fetched items for randomness
    // Using the Fisher-Yates algorithm or a simple sort-random
    const shuffled = [...subCategories].sort(() => 0.5 - Math.random());

    // 3. Ensure we have exactly 8 items
    const finalItems: getCategoryHomeData[] = [];

    for (let i = 0; i < 8; i++) {
      // Use the modulo operator (%) to loop back to the start of the shuffled 
      // array if we have fewer than 8 unique items.
      const item = shuffled[i % shuffled.length];
      
      finalItems.push({
        name: item.name,
        slug: item.slug,
        imageUrl: item.imageUrl ?? "/placeholder-category.png", // Fallback for null imageUrl
      });
    }

    return {
      success: true,
      message: "Home categories fetched successfully",
      data: finalItems,
    };
  } catch (error) {
    console.error("GET_CATEGORY_HOME_ERROR:", error);
    return {
      success: false,
      message: "An error occurred while fetching categories.",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}