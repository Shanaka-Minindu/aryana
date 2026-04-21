"use server";
import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { upsertDisplayItemSchema } from "@/lib/validators";
import { getCategoriesProps, getDisplayItemsRes, getProductCategoryRes, positionDataProps, ServerActionResponse } from "@/types";
import { revalidatePath } from "next/cache";




  export async function getCategories(): Promise<
    ServerActionResponse<getCategoriesProps[]>
  > {
    try {
      // 1. Fetch all categories from the database
      // We select only the specific fields required by the interface
      const categories = await prisma.category.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
        },
        orderBy: {
          name: "asc", // Alphabetical sorting is usually best for category lists
        },
      });
  
      // 2. Return the success response
      return {
        success: true,
        message: "Categories retrieved successfully.",
        data: categories,
      };
    } catch (error) {
      console.error("GET_CATEGORIES_ERROR:", error);
      return {
        success: false,
        message: "An error occurred while fetching categories.",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }


  
  
  export async function positionData(): Promise<
    ServerActionResponse<positionDataProps>
  > {
    try {
      // 1. Admin Authorization Check
      const session = await auth();
      if (session?.user.role !== "ADMIN") {
        return {
          success: false,
          message: "Unauthorized access.",
          errorType: "AUTHENTICATION_ERROR",
        };
      }
  
      // 2. Define the total range of positions (1 to 8)
      const masterPositions = [1, 2, 3, 4, 5, 6, 7, 8];
  
      // 3. Fetch currently occupied positions from DisplayItem
      const occupiedItems = await prisma.displayItem.findMany({
        select: {
          position: true,
        },
      });
  
      // 4. Extract position numbers into a flat array
      const occupiedPositions = occupiedItems.map((item) => item.position);
  
      // 5. Calculate available positions
      // Keep only the numbers from masterPositions that are NOT in occupiedPositions
      const available = masterPositions.filter(
        (pos) => !occupiedPositions.includes(pos)
      );
  
      return {
        success: true,
        message: "Available display positions retrieved successfully.",
        data: {
          availablePosition: available,
        },
      };
    } catch (error) {
      console.error("GET_POSITION_DATA_ERROR:", error);
      return {
        success: false,
        message: "An error occurred while fetching position data.",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }


  interface upsertDisplayItemProps {
    displayItemId?: string;
    name: string;
    position: string;
    categoryId: string;
  }
  
  interface upsertDisplayItemItemRes {
    id: string;
    name: string;
  }
  export async function upsertDisplayItem({
    displayItemId,
    categoryId,
    name,
    position,
  }: upsertDisplayItemProps): Promise<ServerActionResponse<upsertDisplayItemItemRes>> {
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
  
      // 3. Validation
      const validation = upsertDisplayItemSchema.safeParse({ name, position, categoryId });
  
      if (!validation.success) {
        return {
          success: false,
          message: "Validation failed.",
          fieldErrors: validation.error.flatten().fieldErrors,
        };
      }
  
      const validatedData = validation.data;
      const isUpdating = !!displayItemId && displayItemId !== "" && displayItemId !== "null";
  
      // 4. Fetch the Category to get its slug
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
        select: { slug: true },
      });
  
      if (!category) {
        return {
          success: false,
          message: "The selected category does not exist.",
        };
      }
  
      // 5. Check for Position Uniqueness
      const existingPosition = await prisma.displayItem.findFirst({
        where: {
          position: parseInt(validatedData.position),
          NOT: isUpdating ? { id: displayItemId } : undefined,
        },
      });
  
      if (existingPosition) {
        return {
          success: false,
          message: `Position ${validatedData.position} is already occupied.`,
          fieldErrors: { position: ["Position must be unique."] },
        };
      }
  
      let result;
  
      if (isUpdating) {
        // 6. Update existing record
        result = await prisma.displayItem.update({
          where: { id: displayItemId },
          data: {
            title: validatedData.name,
            position: parseInt(validatedData.position),
            categoryId: validatedData.categoryId,
            slug: category.slug, // Mirroring category slug
          },
        });
      } else {
        // 7. Create new record
        result = await prisma.displayItem.create({
          data: {
            title: validatedData.name,
            position: parseInt(validatedData.position),
            categoryId: validatedData.categoryId,
            slug: category.slug, // Mirroring category slug
          },
        });
      }
  
      // 8. Revalidate paths
      revalidatePath("/");
      revalidatePath("/admin/display-items");
  
      return {
        success: true,
        message: `Display item ${isUpdating ? "updated" : "created"} successfully.`,
        data: {
          id: result.id,
          name: result.title,
        },
      };
    } catch (error) {
      console.error("UPSERT_DISPLAY_ITEM_ERROR:", error);
      return {
        success: false,
        message: "An unexpected error occurred while saving the display item.",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }



  
  export async function getProductCategory(
    categoryId: string
  ): Promise<ServerActionResponse<getProductCategoryRes[]>> {
    try {
      // 1. Fetch products related to the categoryId
      // We only fetch active products and include their images
      const products = await prisma.product.findMany({
        where: {
          categoryId: categoryId,
         
        },
        include: {
          images: {
            orderBy: {
              isPrimary: "desc", // Ensures primary image is first in the array
            },
            take: 1, // We only need the top image for this specific response
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
  
      // 2. Map the data to the getProductCategoryRes interface
      const mappedProducts: getProductCategoryRes[] = products.map((product) => ({
        id: product.id,
        name: product.name,
        // Convert Int price to String as requested
        price: product.price.toString(),
        // Handle the case where a product might not have any images yet
        image: product.images[0]?.url || "",
      }));
  
      return {
        success: true,
        message: `Successfully retrieved ${mappedProducts.length} products.`,
        data: mappedProducts,
      };
    } catch (error) {
      console.error("GET_PRODUCT_CATEGORY_ERROR:", error);
      return {
        success: false,
        message: "An error occurred while fetching category products.",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  interface productPosition {
    productId: string;
    position: string;
  }
  
  interface addDisplayItemsProps {
    displayItemId: string;
    products: productPosition[];
  }
  
  export async function addDisplayItems({
    displayItemId,
    products,
  }: addDisplayItemsProps): Promise<ServerActionResponse<null>> {
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
  
      if (!displayItemId) {
        return {
          success: false,
          message: "Display Item ID is required.",
        };
      }
  
      // 2. Database Operation: Transaction
      await prisma.$transaction(async (tx) => {
        // Step A: Clear existing products in this specific DisplayItem
        // This allows for a full refresh of the selection and ordering
        await tx.displayItemProduct.deleteMany({
          where: { displayItemId },
        });
  
        // Step B: Insert the new set of products
        if (products.length > 0) {
          await tx.displayItemProduct.createMany({
            data: products.map((p) => ({
              displayItemId: displayItemId,
              productId: p.productId,
              position: Number(p.position), // Convert string position to Int
            })),
          });
        }
      });
  
      // 3. Revalidate the homepage and admin paths
      revalidatePath("/");
      revalidatePath("/admin/display-items");
      revalidatePath(`/admin/display-items/${displayItemId}`);
  
      return {
        success: true,
        message: "Collection items updated successfully.",
        data: null,
      };
    } catch (error) {
      console.error("ADD_DISPLAY_ITEMS_ERROR:", error);
      return {
        success: false,
        message: "An error occurred while updating the collection products.",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }





  
  export async function getDisplayItems(): Promise<
    ServerActionResponse<getDisplayItemsRes[]>
  > {
    try {
      // 1. Fetch all display items
      // We order them by position so they appear in the correct sequence in the UI
      const displayItems = await prisma.displayItem.findMany({
        select: {
          id: true,
          title: true,
          position: true,
          isActive:true,
        },
        orderBy: {
          position: "asc",
        },
      });
  
      // 2. Map data to match the interface (converting position to string)
      const mappedData: getDisplayItemsRes[] = displayItems.map((item) => ({
        id: item.id,
        title: item.title,
        position: item.position.toString(),
        isActive : item.isActive
      }));
  
      return {
        success: true,
        message: "Display items retrieved successfully.",
        data: mappedData,
      };
    } catch (error) {
      console.error("GET_DISPLAY_ITEMS_ERROR:", error);
      return {
        success: false,
        message: "An error occurred while fetching display items.",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }




  export async function deleteDisplayItem(id: string) {
    try {
      const session = await auth();
      if (session?.user.role !== "ADMIN") return { success: false, message: "Unauthorized" };
  
      // Cascade delete in schema handles DisplayItemProduct automatically
      await prisma.displayItem.delete({
        where: { id },
      });
  
      revalidatePath("/admin/display-items");
      return { success: true, message: "Display item deleted successfully" };
    } catch (error) {
      return { success: false, message: "Failed to delete item" };
    }
  }
  
  export async function toggleDisplayItemStatus(id: string, currentStatus: boolean) {
    try {
      const session = await auth();
      if (session?.user.role !== "ADMIN") return { success: false, message: "Unauthorized" };
  
      await prisma.displayItem.update({
        where: { id },
        data: { isActive: !currentStatus },
      });
  
      revalidatePath("/admin/display-items");
      return { success: true, message: "Status updated" };
    } catch (error) {
      return { success: false, message: "Failed to update status" };
    }
  }