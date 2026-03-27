"use server";

import { prisma } from "@/db/prisma";
import { carouselItem, ServerActionResponse } from "@/types";



export async function getCarousel(
  position: number
): Promise<ServerActionResponse<carouselItem[]>> {
  try {
    // 1. Find the Carousel that matches the position and is active
    const carousel = await prisma.carousel.findUnique({
      where: {
        position: position,
        isActive: true,
      },
      include: {
        items: {
          where: {
            isActive: true, // Only fetch active slides
          },
          orderBy: {
            position: "asc", // Ensure they appear in the correct order
          },
        },
      },
    });

    // 2. Handle case where carousel isn't found
    if (!carousel) {
      return {
        success: false,
        message: `Carousel at position ${position} not found.`,
      };
    }

    // 3. Map the Prisma data to your carouselItem interface
    const formattedItems: carouselItem[] = carousel.items.map((item) => ({
      id: item.id,
      imgUrl: item.imageUrl,
      heading: item.heading ?? "",
      subHeading: item.subHeading ?? "",
      linkUrl: item.linkUrl ?? "",
      buttonText: item.buttonText ?? "",
      textPosition: item.textPosition??"CENTER",
      position: item.position,
    }));

    return {
      success: true,
      message: "Carousel items fetched successfully",
      data: formattedItems,
    };
  } catch (error) {
    console.error("Error fetching carousel:", error);
    return {
      success: false,
      message: "Failed to fetch carousel data.",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}