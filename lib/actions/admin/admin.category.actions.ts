"use server";

import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { newCategoryValidator } from "@/lib/validators";
import { getCategoryProps, ServerActionResponse } from "@/types";
import { revalidatePath } from "next/cache";
import { UTApi } from "uploadthing/server";

export async function getCategory(): Promise<
  ServerActionResponse<getCategoryProps[]>
> {
  try {
    // 1. Admin Authorization Check
    const session = await auth();
    const isAdmin = session?.user.role === "ADMIN";

    if (!isAdmin) {
      return {
        success: false,
        message: "Unauthorized. Admin access required.",
        errorType: "AUTHENTICATION_ERROR",
      };
    }

    // 2. Fetch Parent categories and their immediate children
    const categoriesWithChildren = await prisma.category.findMany({
      where: {
        parentId: null, // Get Top-Level Parents
      },
      include: {
        children: {
          orderBy: {
            name: "asc",
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    // 3. Flatten the data into a single array
    // We put the parent first, then immediately follow it with its children
    const flatData: getCategoryProps[] = categoriesWithChildren.flatMap(
      (parent) => {
        const parentNode = {
          id: parent.id,
          name: parent.name,
          parentId: parent.parentId,
          image: parent.imageUrl,
          slug: parent.slug,
        };

        const childNodes = parent.children.map((child) => ({
          id: child.id,
          name: child.name,
          parentId: child.parentId,
          image: child.imageUrl,
          slug: child.slug,
        }));

        return [parentNode, ...childNodes];
      },
    );

    return {
      success: true,
      message: "Categories retrieved successfully.",
      data: flatData,
    };
  } catch (error) {
    console.error("GET_CATEGORY_ERROR:", error);
    return {
      success: false,
      message: "Failed to fetch categories.",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
interface createCategoryProps {
  name: string;
  slug: string;
  parentId?: string;
  imageUrl?: string;
}

export async function createCategory({
  name,
  slug,
  imageUrl,
  parentId,
}: createCategoryProps): Promise<ServerActionResponse<null>> {
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

    // 2. Validate with Zod
    // Note: your validator uses 'image', so we map 'imageUrl' to match it
    const validation = newCategoryValidator.safeParse({
      name,
      slug,
      parentId: parentId || null,
      image: imageUrl || null,
    });

    if (!validation.success) {
      return {
        success: false,
        message: "Invalid input data.",
        fieldErrors: validation.error.flatten().fieldErrors,
      };
    }

    // 3. Check if Slug already exists (Manual check for better error message)
    const existingCategory = await prisma.category.findUnique({
      where: { slug },
    });

    if (existingCategory) {
      return {
        success: false,
        message: "A category with this slug already exists.",
        fieldErrors: { slug: ["Slug must be unique."] },
      };
    }

    // 4. Create Category
    await prisma.category.create({
      data: {
        name: validation.data.name,
        slug: validation.data.slug,
        imageUrl: validation.data.image,
        parentId: validation.data.parentId || null,
      },
    });

    // 5. Revalidate cache to show the new category in the UI
    revalidatePath("/admin/categories");

    return {
      success: true,
      message: "Category created successfully.",
    };
  } catch (error) {
    console.error("CREATE_CATEGORY_ERROR:", error);
    return {
      success: false,
      message: "An unexpected error occurred while creating the category.",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function deleteUploadThingImage(url: string) {
  const utapi = new UTApi();
  // Extract key from URL: https://utfs.io/f/key
  const fileKey = url.split("/f/")[1];
  if (fileKey) {
    await utapi.deleteFiles(fileKey);
    return { success: true };
  }
  return { success: false };
}

export async function deleteCategory(
  id: string,
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

    // 2. Perform deletion in a transaction to handle cascading manually
    await prisma.$transaction(async (tx) => {
      // A. Find all child category IDs
      const childCategories = await tx.category.findMany({
        where: { parentId: id },
        select: { id: true },
      });

      const allCategoryIdsToDelete = [id, ...childCategories.map((c) => c.id)];

      // B. Delete all products belonging to these categories
      // Note: ProductImages and ProductVariants will auto-delete because
      // they have 'onDelete: Cascade' in your schema.
      await tx.product.deleteMany({
        where: {
          categoryId: { in: allCategoryIdsToDelete },
        },
      });

      // C. Delete the categories (Children first, then Parent)
      // Delete children
      await tx.category.deleteMany({
        where: {
          id: { in: childCategories.map((c) => c.id) },
        },
      });

      // Delete the actual parent category
      await tx.category.delete({
        where: { id },
      });
    });

    // 3. Update the UI cache
    revalidatePath("/admin/categories");

    return {
      success: true,
      message: "Category and all related data deleted successfully.",
      data: null,
    };
  } catch (error) {
    console.error("DELETE_CATEGORY_ERROR:", error);
    return {
      success: false,
      message:
        "Failed to delete category. Ensure it is not linked to active orders.",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

interface updateCategoryprops {
  formData: FormData;
  id: string;
}

export async function updateCategory({
  formData,
  id,
}: updateCategoryprops): Promise<ServerActionResponse<null>> {
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

    // 2. Extract and Validate Data
    const rawData = Object.fromEntries(formData.entries());
    
    const validation = newCategoryValidator.safeParse({
      name: rawData.name,
      slug: rawData.slug,
      parentId: rawData.parentId || null,
      image: rawData.imageUrl || null, // Mapping imageUrl from form to 'image' in Zod
    });

    if (!validation.success) {
      return {
        success: false,
        message: "Validation failed.",
        fieldErrors: validation.error.flatten().fieldErrors,
      };
    }

    const { name, slug, parentId, image } = validation.data;

    // 3. Logic Check: A category cannot be its own parent
    if (parentId === id) {
      return {
        success: false,
        message: "A category cannot be its own parent.",
        fieldErrors: { parentId: ["Invalid parent selection."] },
      };
    }

    // 4. Check for Slug Uniqueness (excluding current category)
    const slugExists = await prisma.category.findFirst({
      where: {
        slug,
        NOT: { id },
      },
    });

    if (slugExists) {
      return {
        success: false,
        message: "This slug is already taken by another category.",
        fieldErrors: { slug: ["Slug must be unique."] },
      };
    }

    // 5. Perform the Update
    await prisma.category.update({
      where: { id },
      data: {
        name,
        slug,
        imageUrl: image,
        parentId: parentId || null,
      },
    });

    // 6. Revalidate cache
    revalidatePath("/admin/categories");

    return {
      success: true,
      message: "Category updated successfully.",
      data: null,
    };
  } catch (error) {
    console.error("UPDATE_CATEGORY_ERROR:", error);
    return {
      success: false,
      message: "An error occurred while updating the category.",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}