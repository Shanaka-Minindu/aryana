"use server";

import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { CartItemsServerRes, ServerActionResponse } from "@/types";

interface addCartProps {
  userId: string;
  variantId: string;
  quantity: number;
  cartIdFromClient: string;
}

export async function addItemToCart({
  quantity,
  userId,
  cartIdFromClient,
  variantId,
}: addCartProps): Promise<ServerActionResponse<undefined>> {
  try {
    const session = await auth();
    const cartId = session?.user.cartId;
    // 1. Authentication Check
    if (!session || session.user?.id !== userId) {
      return {
        success: false,
        message: "You must be logged in to perform this action.",
        errorType: "AUTHENTICATION_ERROR",
      };
    }

    if (cartId !== cartIdFromClient) {
      return {
        success: false,
        message: "Something wrong in a cart",
        errorType: "AUTHENTICATION_ERROR",
      };
    }

    // 2. Validate Product Variant Existence
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
    });

    if (!variant) {
      return {
        success: false,
        message: "The selected product variant does not exist.",
      };
    }

    // 3. Update or Create Cart Item
    // We use upsert to handle the unique constraint on [cartId, variantId]
    await prisma.cartItem.upsert({
      where: {
        cartId_variantId: {
          cartId: cartId,
          variantId: variantId,
        },
      },
      update: {
        quantity: {
          increment: quantity, // Adds the new quantity to the existing one
        },
      },
      create: {
        cartId: cartId,
        variantId: variantId,
        quantity: quantity,
      },
    });

    return {
      success: true,
      message: "Item added to cart successfully.",
    };
  } catch (error) {
    console.error("ADD_TO_CART_ERROR:", error);
    return {
      success: false,
      message: "Failed to add item to cart.",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

interface getCartItemsProps {
  userId: string;
  cartIdFromClient: string;
}

export async function getCartItemsAuthorized({
  cartIdFromClient,
  userId,
}: getCartItemsProps): Promise<ServerActionResponse<CartItemsServerRes[]>> {
  try {
    // 1. Authorization Check
    const session = await auth();
    if (!session || session.user?.id !== userId) {
      return {
        success: false,
        message: "Unauthorized access.",
        errorType: "AUTHENTICATION_ERROR",
      };
    }

    // 2. Fetch Cart with all related data
    const cart = await prisma.cart.findUnique({
      where: {
        id: cartIdFromClient,
        userId: userId, // Ensure the cart actually belongs to the user
      },
      include: {
        items: {
          orderBy: {
            id: "asc",
          },
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    category: {
                      select: { slug: true },
                    },
                    images: {
                      where: { isPrimary: true },
                      take: 1,
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!cart) {
      return {
        success: false,
        message: "Cart not found.",
      };
    }

    // 3. Format data to match CartItemsServerRes
    const formattedItems: CartItemsServerRes[] = cart.items.map((item) => {
      const product = item.variant.product;
      const variant = item.variant;

      // Ensure we have a fallback for the image if no primary is set
      const imageUrl = product.images[0]?.url || "/placeholder-product.png";

      // Construct the slug: /categorySlug/productSlug
      const fullSlug = `/${product.category.slug}/${product.slug}`;

      return {
        variantId: variant.id,
        imageUrl: imageUrl,
        title: product.name,
        color: variant.color,
        size: variant.size,
        stock: variant.stock,
        qty: item.quantity,
        price: product.price,
        isSale: product.isSale,
        salePrice: product.salePrice ?? undefined,
        slug: fullSlug,
      };
    });

    return {
      success: true,
      message: "Cart items retrieved successfully",
      data: formattedItems,
    };
  } catch (error) {
    console.error("GET_CART_ITEMS_ERROR:", error);
    return {
      success: false,
      message: "Failed to load cart items.",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

interface guestCartItem {
  variantId: string;
  quantity: number;
}

interface guestCart {
  cartItems?: guestCartItem[];
}

export async function getCartItemsNonAuthorized({
  cartItems,
}: guestCart): Promise<ServerActionResponse<CartItemsServerRes[]>> {
  try {
    // 1. Check if the cart is empty
    if (!cartItems || cartItems.length === 0) {
      return {
        success: true,
        data: [],
      };
    }

    // 2. Extract variant IDs to perform a bulk query
    const variantIds = cartItems.map((item) => item.variantId);

    // 3. Fetch all variant and product data in one go
    const dbVariants = await prisma.productVariant.findMany({
      where: {
        id: { in: variantIds },
      },
      orderBy: {
        id: "asc",
      },
      include: {
        product: {
          include: {
            category: { select: { slug: true } },
            images: {
              where: { isPrimary: true },
              take: 1,
            },
          },
        },
      },
    });

    // 4. Map the DB data back to the format needed for the Cart UI
    // We use the 'cartItems' passed from client to maintain the correct 'qty'
    const formattedItems: CartItemsServerRes[] = dbVariants.map((variant) => {
      const product = variant.product;

      // Find the quantity from the guestCart input matching this variantId
      const guestItem = cartItems.find((item) => item.variantId === variant.id);

      const imageUrl = product.images[0]?.url || "/placeholder-product.png";
      const fullSlug = `/${product.category.slug}/${product.slug}`;

      return {
        variantId: variant.id,
        imageUrl: imageUrl,
        title: product.name,
        color: variant.color,
        size: variant.size,
        stock: variant.stock,
        qty: guestItem ? guestItem.quantity : 0,
        price: product.price,
        isSale: product.isSale,
        salePrice: product.salePrice ?? undefined,
        slug: fullSlug,
      };
    });

    return {
      success: true,
      message: "Successfully synced with your last visit.",
      data: formattedItems,
    };
  } catch (error) {
    console.error("GET_GUEST_CART_ERROR:", error);
    return {
      success: false,
      message: "Failed to fetch guest cart details.",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

interface quantityData {
  userId: string;
  cartId: string;
  variantId: string;
  newQuantity: number;
}
export async function updateQty({
  cartId,
  newQuantity,
  variantId,
  userId,
}: quantityData): Promise<ServerActionResponse<null>> {
  try {
    // 1. Authentication Check
    const session = await auth();
    if (!session || session.user?.id !== userId) {
      return {
        success: false,
        message: "Unauthorized access.",
        errorType: "AUTHENTICATION_ERROR",
      };
    }

    // 2. Condition: newQuantity can't be less than 1
    if (newQuantity < 1) {
      return {
        success: false,
        message: "Quantity must be at least 1.",
      };
    }

    // 3. Check ProductVariant stock
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      select: { stock: true },
    });

    if (!variant) {
      return {
        success: false,
        message: "Product variant not found.",
      };
    }

    // 4. Condition: newQuantity can't exceed stock
    if (newQuantity > variant.stock) {
      return {
        success: false,
        message: `Only ${variant.stock} items available in stock.`,
      };
    }

    // 5. Perform the Update
    await prisma.cartItem.update({
      where: {
        cartId_variantId: {
          cartId,
          variantId,
        },
      },
      data: {
        quantity: newQuantity,
      },
    });

    return {
      success: true,
      message: "Quantity updated successfully.",
      data: null,
    };
  } catch (error) {
    console.error("UPDATE_QTY_ERROR:", error);
    return {
      success: false,
      message: "Failed to update quantity.",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

interface removeCartItemProps {
  userId: string;
  cartId: string;
  variantId: string;
}
export async function removeCartItem({
  cartId,
  userId,
  variantId,
}: removeCartItemProps): Promise<ServerActionResponse<null>> {
  try {
    // 1. Authentication Check
    const session = await auth();

    if (!session || session.user?.id !== userId) {
      return {
        success: false,
        message: "Unauthorized access.",
        errorType: "AUTHENTICATION_ERROR",
      };
    }

    // 2. Delete the item using the composite unique key
    // Prisma automatically creates 'cartId_variantId' based on your @@unique constraint
    await prisma.cartItem.delete({
      where: {
        cartId_variantId: {
          cartId: cartId,
          variantId: variantId,
        },
      },
    });

    return {
      success: true,
      message: "Item removed from cart.",
      data: null,
    };
  } catch (error) {
    console.error("REMOVE_CART_ITEM_ERROR:", error);

    // Handle case where item might have already been deleted
    return {
      success: false,
      message: "Failed to remove item. It may have already been deleted.",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
