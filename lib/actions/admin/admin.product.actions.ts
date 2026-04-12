/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import {
  categoryProduct,
  filteredAdminProducts,
  ProductWithRelations,
  selectedProduct,
  ServerActionResponse,
} from "@/types";
import { addProductSchema } from "@/lib/validators";
import { revalidatePath } from "next/cache";
import { Prisma, Product } from "@/lib/generated/prisma";

export async function upsertProduct(
  formData: FormData,
  productId?: string,
): Promise<ServerActionResponse<{ productId: string }>> {
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

    // 2. Extract Data from FormData
    const rawData = {
      name: formData.get("name"),
      slug: formData.get("slug"),
      description: formData.get("description"),
      price: formData.get("price"),
      isSale: formData.get("isSale") === "true",
      salePrice: formData.get("salePrice"),
      category: formData.get("category"),
    };

    // 3. Validate with Zod

    console.log(rawData)
    const validation = addProductSchema.safeParse(rawData);

    if (!validation.success) {
      return {
        success: false,
        message: "Validation failed. Please check the product details.",
        fieldErrors: validation.error.flatten().fieldErrors,
      };
    }

    const data = validation.data;
    const isUpdating = !!productId && productId !== "" && productId !== "null";

    // 4. Check for Slug Uniqueness
    // If updating, ignore the slug of the current product
    const existingProductWithSlug = await prisma.product.findFirst({
      where: {
        slug: data.slug,
        NOT: isUpdating ? { id: productId } : undefined,
      },
    });

    if (existingProductWithSlug) {
      return {
        success: false,
        message: "A product with this slug already exists.",
        fieldErrors: { slug: ["Slug must be unique."] },
      };
    }

    let finalProduct;

    if (isUpdating) {
      // 5. Update Existing Product
      finalProduct = await prisma.product.update({
        where: { id: productId },
        data: {
          name: data.name,
          slug: data.slug,
          description: data.description,
          price: +data.price,
          isSale: data.isSale,
          salePrice: data.isSale
            ? data.salePrice !== undefined
              ? Number(data.salePrice)
              : null
            : null,
          categoryId: data.category,
        },
      });
    } else {
      // 6. Create New Product
      finalProduct = await prisma.product.create({
        data: {
          name: data.name,
          slug: data.slug,
          description: data.description,
          price: +data.price,
          isSale: data.isSale,
          salePrice: data.isSale
            ? data.salePrice !== undefined
              ? Number(data.salePrice)
              : null
            : null,
          categoryId: data.category,
          isActive: true,
        },
      });
    }

    // 7. Revalidate relevant paths
    revalidatePath("/admin/products");
    revalidatePath("/shop");
    if (isUpdating) revalidatePath(`/shop/${data.slug}`);

    return {
      success: true,
      message: isUpdating
        ? "Product updated successfully."
        : "Product created successfully.",
      data: { productId: finalProduct.id },
    };
  } catch (error) {
    console.error("UPSERT_PRODUCT_ERROR:", error);
    return {
      success: false,
      message: "An unexpected error occurred while saving the product.",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

interface addProductImagesProps {
  productId: string;
  images: { url: string; isPrimary: boolean }[];
}

export async function upsertProductImages({
  productId,
  images,
}: addProductImagesProps): Promise<ServerActionResponse<null>> {
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

    // 2. Validation
    if (!productId) {
      return { success: false, message: "Product ID is required." };
    }

    // 3. Database Operation (Transaction)
    await prisma.$transaction(async (tx) => {
      // Step A: Delete existing images for this product
      // This "resets" the gallery so we can apply the new state
      await tx.productImage.deleteMany({
        where: { productId },
      });

      // Step B: If new images are provided, insert them
      if (images.length > 0) {
        await tx.productImage.createMany({
          data: images.map((img) => ({
            url: img.url,
            isPrimary: img.isPrimary,
            productId: productId,
          })),
        });
      }
    });

    // 4. Revalidate paths
    revalidatePath(`/admin/products/${productId}`);
    revalidatePath(`/shop/${productId}`);
    revalidatePath("/shop"); // Update thumbnails in the main shop view

    return {
      success: true,
      message: "Product gallery updated successfully.",
      data: null,
    };
  } catch (error) {
    console.error("UPSERT_IMAGES_ERROR:", error);
    return {
      success: false,
      message: "An error occurred while updating product images.",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

interface VariantInput {
  size: string;
  color: string;
  stock: string;
}

interface addProductVariantsProps {
  productId: string;
  variants: VariantInput[];
}

export async function upsertProductVariants({
  productId,
  variants,
}: addProductVariantsProps): Promise<ServerActionResponse<null>> {
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

    // 2. Database Operation: Transaction
    await prisma.$transaction(async (tx) => {
      // Step A: Find variants to delete
      // We delete variants that exist in the DB but are NOT in the incoming array
      // This is crucial for when an admin removes a size or color in the UI
      await tx.productVariant.deleteMany({
        where: {
          productId: productId,
          NOT: variants.map((v) => ({
            size: v.size,
            color: v.color,
          })),
        },
      });

      // Step B: Upsert the incoming variants
      // This handles both creating new combinations and updating stock for existing ones
      for (const variant of variants) {
        await tx.productVariant.upsert({
          where: {
            productId_size_color: {
              productId: productId,
              size: variant.size,
              color: variant.color,
            },
          },
          update: {
            stock: Number(variant.stock),
          },
          create: {
            productId: productId,
            size: variant.size,
            color: variant.color,
            stock: Number(variant.stock),
          },
        });
      }
    });

    // 3. Revalidate cache
    revalidatePath(`/admin/products/${productId}`);
    revalidatePath(`/shop/${productId}`);
    revalidatePath("/shop"); // To reflect "Out of Stock" status if stock reached 0

    return {
      success: true,
      message: "Product inventory synchronized successfully.",
      data: null,
    };
  } catch (error) {
    console.error("UPSERT_VARIANTS_ERROR:", error);
    return {
      success: false,
      message: "An error occurred while synchronizing product variants.",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function deleteProduct(
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

    // 2. Check if product exists and if it's linked to any orders
    // We want to prevent deleting products that are part of historical orders
    const productWithOrders = await prisma.product.findUnique({
      where: { id },
      include: {
        variants: {
          include: {
            _count: {
              select: { orderItems: true },
            },
          },
        },
      },
    });

    if (!productWithOrders) {
      return {
        success: false,
        message: "Product not found.",
      };
    }

    // Check if any variant has been ordered
    const hasBeenOrdered = productWithOrders.variants.some(
      (v) => v._count.orderItems > 0,
    );

    if (hasBeenOrdered) {
      // Instead of deleting, we should just deactivate it to preserve order history
      await prisma.product.update({
        where: { id },
        data: { isActive: false },
      });

      return {
        success: true,
        message:
          "Product has order history. It has been deactivated instead of deleted to preserve records.",
        data: null,
      };
    }

    // 3. Perform the Deletion
    // Cascade delete handles ProductImage and ProductVariant automatically
    await prisma.product.delete({
      where: { id },
    });

    // 4. Revalidate paths
    revalidatePath("/admin/products");
    revalidatePath("/shop");

    return {
      success: true,
      message: "Product deleted successfully.",
      data: null,
    };
  } catch (error) {
    console.error("DELETE_PRODUCT_ERROR:", error);
    return {
      success: false,
      message: "An error occurred while deleting the product.",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getCategoryProduct(): Promise<
  ServerActionResponse<categoryProduct[]>
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

    // 2. Fetch categories where parentId is NOT NULL
    const categories = await prisma.category.findMany({
      where: {
        parentId: {
          not: null,
        },
      },
      select: {
        id: true,
        name: true,
        slug:true
      },
      orderBy: {
        name: "asc",
      },
    });

    return {
      success: true,
      message: "Sub-categories retrieved successfully.",
      data: categories,
    };
  } catch (error) {
    console.error("GET_CATEGORY_PRODUCT_ERROR:", error);
    return {
      success: false,
      message: "An error occurred while fetching categories.",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getProductById(
  productId: string,
): Promise<ServerActionResponse<ProductWithRelations>> {
  try {
    // 1. Validation
    if (!productId) {
      return {
        success: false,
        message: "Product ID is required.",
      };
    }

    // 2. Fetch product with related images and variants
    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
      include: {
        images: true,
        variants: true,
        category: {
          select: {
            name: true,
          },
        },
      },
    });

    // 3. Handle product not found
    if (!product) {
      return {
        success: false,
        message: "Product not found.",
      };
    }

    return {
      success: true,
      message: "Product retrieved successfully.",
      data: product as any, // Cast to any if your Prisma 'Product' type doesn't include relations
    };
  } catch (error) {
    console.error("GET_PRODUCT_BY_ID_ERROR:", error);
    return {
      success: false,
      message: "An error occurred while fetching the product.",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

interface getAllProductsPros {
  size?: number;
  page?: string;
  categorySlug: string;
}

export async function getAllProducts({
  categorySlug,
  page = "1",
  size = 10,
}: getAllProductsPros): Promise<ServerActionResponse<filteredAdminProducts>> {
  try {
    const skip = (Number(page) - 1) * Number(size);
    const take = Number(size);

    // 1. Define Filter
    const whereClause: Prisma.ProductWhereInput =
      categorySlug !== "all" ? { category: { slug: categorySlug } } : {};

    // 2. Fetch Data with required Relations
    const [products, totalCount] = await prisma.$transaction([
      prisma.product.findMany({
        where: whereClause,
        skip,
        take,
        include: {
          variants: true,
          images: true,
          category: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.count({ where: whereClause }),
    ]);

    // 3. Return the data directly (no manual mapping needed)
    return {
      success: true,
      message: "Products retrieved successfully.",
      data: {
        product: products as ProductWithRelations[],
        currentPage: Number(page),
        totalPages: Math.ceil(totalCount / take),
        totalProducts: totalCount,
      },
    };
  } catch (error) {
    console.error("GET_ALL_PRODUCTS_ERROR:", error);
    return {
      success: false,
      message: "An error occurred while fetching products.",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}


export async function toggleProductStatus(productId: string, currentStatus: boolean) {
  try {
    const session = await auth();
    if (session?.user.role !== "ADMIN") return { success: false, message: "Unauthorized" };

    await prisma.product.update({
      where: { id: productId },
      data: { isActive: !currentStatus },
    });

    revalidatePath(`/admin/products/${productId}`);
    return { success: true, message: `Product ${!currentStatus ? 'activated' : 'deactivated'}` };
  } catch (error) {
    return { success: false, message: "Failed to update status" };
  }
}