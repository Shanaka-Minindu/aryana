"use server";

import { prisma } from "@/db/prisma";
import { ServerActionResponse } from "@/types";

export interface HeaderItem {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  // This allows the infinite nesting for your dropdowns/menus
  children: HeaderItem[];
}

export async function getHeaderItems(): Promise<
  ServerActionResponse<HeaderItem[]>
> {
  try {
    const categories = await prisma.category.findMany({
      where: {
        parentId: null, // Start with top-level categories only
      },
      include: {
        children: {
          include: {
            children: true, // Fetches up to 3 levels deep
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return {
      success: true,
      data: categories as HeaderItem[],
    };
  } catch (error) {
    console.error("[GET_HEADER_ITEMS]", error);
    return {
      success: false,
      error: "Failed to fetch navigation items",
    };
  }
}

interface leftDrawerPros {
  id: string;
  name: string;
  slug: string;
}

export async function leftDrawer(): Promise<ServerActionResponse<leftDrawerPros[]>> {
  try {
    // Fetch categories where parentId is NOT null
    const categories = await prisma.category.findMany({
      where: {
        parentId: {
          not: null,
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
      orderBy: {
        name: "asc", // Optional: keeps the drawer organized alphabetically
      },
    });

    return {
      success: true,
      message: "Categories fetched successfully",
      data: categories,
    };
  } catch (error) {
    console.error("Error fetching drawer categories:", error);
    
    return {
      success: false,
      message: "Failed to load categories for the drawer",
      error: error instanceof Error ? error.message : "Unknown database error",
    };
  }
}