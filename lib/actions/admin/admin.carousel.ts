"use server";
import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { CarouselItem } from "@/lib/generated/prisma";
import { addCarouselItemSchema, carouselSchema } from "@/lib/validators";
import { carouselData, ServerActionResponse } from "@/types";
import { revalidatePath } from "next/cache";
import z from "zod";
import { deleteUploadThingImage } from "./admin.category.actions";

interface createCarouselProps {
  name: string;
  position: string;
}

export async function createCarousel({
  name,
  position,
}: createCarouselProps): Promise<ServerActionResponse<{ carouselId: string }>> {
  try {
    // 2. Admin Authorization Check
    const session = await auth();
    if (session?.user.role !== "ADMIN") {
      return {
        success: false,
        message: "Unauthorized. Admin access required.",
        errorType: "AUTHENTICATION_ERROR",
      };
    }

    // 3. Validation with Zod
    const validation = carouselSchema.safeParse({ name, position });

    if (!validation.success) {
      return {
        success: false,
        message: "Invalid input data.",
        fieldErrors: validation.error.flatten().fieldErrors,
      };
    }

    const validatedData = validation.data;
    const positionInt = parseInt(validation.data.position, 10);

    // 4. Enforce the limit and position uniqueness
    // Check if the specific position is already taken
    const existingPosition = await prisma.carousel.findUnique({
      where: { position: positionInt },
    });

    if (existingPosition) {
      return {
        success: false,
        message: `Position ${validatedData.position} is already occupied.`,
        fieldErrors: { position: ["This position is already in use."] },
      };
    }

    // Double check total count just in case
    const totalCount = await prisma.carousel.count();
    if (totalCount >= 3) {
      return {
        success: false,
        message: "The maximum limit of 3 carousels has been reached.",
      };
    }

    // 5. Create the Carousel
    const newCarousel = await prisma.carousel.create({
      data: {
        name: validatedData.name,
        position: positionInt,
      },
    });

    // 6. Revalidate homepage/admin paths
    revalidatePath("/");
    revalidatePath("/admin/carousel");

    return {
      success: true,
      message: "Carousel created successfully.",
      data: { carouselId: newCarousel.id },
    };
  } catch (error) {
    console.error("CREATE_CAROUSEL_ERROR:", error);
    return {
      success: false,
      message: "An unexpected error occurred.",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getAvailableCarouselSlots(): Promise<
  ServerActionResponse<number[]>
> {
  try {
    // 1. Admin Authorization Check
    const session = await auth();
    if (session?.user.role !== "ADMIN") {
      return {
        success: false,
        message: "Unauthorized.",
      };
    }

    // 2. Define the absolute slots allowed (1, 2, 3)
    const totalAllowedSlots = [1, 2, 3];

    // 3. Fetch currently occupied positions
    const occupiedCarousels = await prisma.carousel.findMany({
      select: {
        position: true,
      },
    });

    const occupiedPositions = occupiedCarousels.map((c) => c.position);

    // 4. Filter to find which slots are still free
    const availableSlots = totalAllowedSlots.filter(
      (slot) => !occupiedPositions.includes(slot),
    );

    return {
      success: true,
      message: "Available slots retrieved.",
      data: availableSlots,
    };
  } catch (error) {
    console.error("GET_SLOTS_ERROR:", error);
    return {
      success: false,
      message: "Failed to fetch available slots.",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

interface upsertCarouselItemsProps {
  items: CarouselItem[];
  carouselId: string;
}

export async function upsertCarouselItems({
  items,
  carouselId,
}: upsertCarouselItemsProps): Promise<ServerActionResponse<null>> {
  try {
    // 1. Admin Authorization Check
    const session = await auth();
    if (session?.user.role !== "ADMIN") {
      return {
        success: false,
        message: "Unauthorized. Admin access required.",
        errorType: "AUTHENTICATION_ERROR",
      };
    }

    if (!carouselId) {
      return {
        success: false,
        message: "Carousel ID is required to update items.",
      };
    }

    // 2. Data Validation
    // We validate every item in the array against your schema
    type CarouselItemInput = z.infer<typeof addCarouselItemSchema>;

    const validatedItems: CarouselItemInput[] = [];
    for (const item of items) {
      const validation = addCarouselItemSchema.safeParse({
        ...item,
        position: String(item.position), // Ensure position is string for Zod regex
      });

      if (!validation.success) {
        return {
          success: false,
          message: `Validation failed for item at position ${item.position}`,
          fieldErrors: validation.error.flatten().fieldErrors,
        };
      }
      validatedItems.push(validation.data);
    }

    // 3. Database Operation: Transaction
    await prisma.$transaction(async (tx) => {
      // Step A: Find and Delete items that are no longer in the list
      const incomingIds = items
        .filter((item) => item.id && item.id.length > 10)
        .map((item) => item.id);

      await tx.carouselItem.deleteMany({
        where: {
          carouselId: carouselId,
          id: {
            notIn: incomingIds as string[],
          },
        },
      });

      // Step B: Upsert the validated items
      for (let i = 0; i < items.length; i++) {
        const rawItem = items[i];
        const validated = validatedItems[i];

        await tx.carouselItem.upsert({
          where: {
            id: rawItem.id || "new-item",
          },
          update: {
            textPosition: validated.textPosition,
            imageUrl: validated.imageUrl,
            heading: validated.heading,
            subHeading: validated.subHeading,
            linkUrl: validated.linkUrl,
            buttonText: validated.buttonText,
            position: Number(validated.position),
            isActive: rawItem.isActive ?? true,
          },
          create: {
            carouselId: carouselId,
            textPosition: validated.textPosition,
            imageUrl: validated.imageUrl,
            heading: validated.heading,
            subHeading: validated.subHeading,
            linkUrl: validated.linkUrl,
            buttonText: validated.buttonText,
            position: Number(validated.position),
            isActive: rawItem.isActive ?? true,
          },
        });
      }
    });

    // 4. Revalidate paths
    revalidatePath("/");
    revalidatePath("/admin/carousel");

    return {
      success: true,
      message: "Carousel items synchronized successfully.",
      data: null,
    };
  } catch (error) {
    console.error("UPSERT_CAROUSEL_ITEMS_ERROR:", error);
    return {
      success: false,
      message: "An error occurred while saving carousel items.",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}



export async function getCarousels(): Promise<
  ServerActionResponse<carouselData[]>
> {
  try {
    // 1. Fetch carousels with their items
    // We order by position to ensure the layout matches your admin settings
    const carousels = await prisma.carousel.findMany({
      
      include: {
        items: {
          where: {
            isActive: true,
          },
          orderBy: {
            position: "asc",
          },
          take: 1, // We only need one image for the returned interface
        },
      },
      orderBy: {
        position: "asc",
      },
    });

    // 2. Map the data to the carouselData interface
    const mappedData: carouselData[] = carousels.map((carousel) => {
      return {
        id:carousel.id,
        name: carousel.name,
        isActive: carousel.isActive,
        // Fallback to an empty string or a placeholder if no items exist
        img: carousel.items[0]?.imageUrl || "",
      };
    });

    return {
      success: true,
      message: "Carousels retrieved successfully.",
      data: mappedData,
    };
  } catch (error) {
    console.error("GET_CAROUSELS_ERROR:", error);
    return {
      success: false,
      message: "An error occurred while fetching carousel data.",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function deleteCarousel(
  carouselId: string,
): Promise<ServerActionResponse<null>> {
  try {
    // 1. Admin Authorization Check
    const session = await auth();
    if (session?.user.role !== "ADMIN") {
      return {
        success: false,
        message: "Unauthorized. Admin access required.",
        errorType: "AUTHENTICATION_ERROR",
      };
    }

    // 2. Fetch Carousel Items to get Image URLs before deleting from DB
    const carousel = await prisma.carousel.findUnique({
      where: { id: carouselId },
      include: { items: { select: { imageUrl: true } } },
    });

    if (!carousel) {
      return {
        success: false,
        message: "Carousel not found.",
      };
    }

    // 3. Delete Images from UploadThing
    // We use Promise.all to run these deletions in parallel for better performance
    if (carousel.items.length > 0) {
      const deletePromises = carousel.items.map((item) =>
        deleteUploadThingImage(item.imageUrl),
      );
      await Promise.all(deletePromises);
    }

    // 4. Delete Carousel from Database
    // Cascade delete handles CarouselItems automatically in Prisma
    await prisma.carousel.delete({
      where: { id: carouselId },
    });

    // 5. Revalidate paths
    revalidatePath("/");
    revalidatePath("/admin/carousel");

    return {
      success: true,
      message: "Carousel and all associated images deleted successfully.",
      data: null,
    };
  } catch (error) {
    console.error("DELETE_CAROUSEL_ERROR:", error);
    return {
      success: false,
      message: "An error occurred while deleting the carousel.",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}


export async function toggleCarouselStatus(
  carouselId: string
): Promise<ServerActionResponse<{ isActive: boolean }>> {
  try {
    // 1. Admin Authorization Check
    const session = await auth();
    if (session?.user.role !== "ADMIN") {
      return {
        success: false,
        message: "Unauthorized. Admin access required.",
        errorType: "AUTHENTICATION_ERROR",
      };
    }

    // 2. Fetch current status
    const currentCarousel = await prisma.carousel.findUnique({
      where: { id: carouselId },
      select: { isActive: true },
    });

    if (!currentCarousel) {
      return {
        success: false,
        message: "Carousel not found.",
      };
    }

    // 3. Toggle the boolean
    const updatedCarousel = await prisma.carousel.update({
      where: { id: carouselId },
      data: {
        isActive: !currentCarousel.isActive,
      },
    });

    // 4. Revalidate cache
    // Revalidating the homepage ensures the carousel appears/disappears instantly
    revalidatePath("/");
    revalidatePath("/admin/carousel");

    return {
      success: true,
      message: `Carousel ${updatedCarousel.isActive ? "activated" : "deactivated"} successfully.`,
      data: { isActive: updatedCarousel.isActive },
    };
  } catch (error) {
    console.error("TOGGLE_CAROUSEL_ERROR:", error);
    return {
      success: false,
      message: "An error occurred while updating the carousel status.",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}