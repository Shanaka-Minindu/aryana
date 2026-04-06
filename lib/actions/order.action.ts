"use server";

import { prisma } from "@/db/prisma";
import { CartItemsServerRes, ServerActionResponse } from "@/types";
import { Districts, OrderStatus } from "../generated/prisma"; // Adjust path to your Prisma types
import { deliveryInfoSchema } from "../validators";
import { revalidatePath } from "next/cache";

export async function getShippingCost(
  district: string,
): Promise<ServerActionResponse<{ price: number }>> {

    console.log(district)
  try {
    // 1. Validation
    if (!district) {
      return {
        success: false,
        message: "District is required to calculate shipping.",
      };
    }

    // 2. Fetch the cost from the database
    // We cast district as Districts to match your Prisma Schema unique constraint
    const shippingData = await prisma.shippingCost.findUnique({
      where: {
        district: district as Districts,
      },
      select: {
        cost: true,
      },
    });

    // 3. Handle cases where the district might not be in the shipping table
    if (!shippingData) {
      return {
        success: false,
        message: "Shipping is not available for the selected district.",
        data: { price: 0 },
      };
    }

    return {
      success: true,
      message: "Shipping cost retrieved.",
      data: {
        price: shippingData.cost,
      },
    };
  } catch (error) {
    console.error("GET_SHIPPING_COST_ERROR:", error);
    return {
      success: false,
      message: "An error occurred while calculating shipping.",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}


interface placePendingOrderProps {
  orderItems: CartItemsServerRes[];
  clientId?: string;
  formData: FormData;
}

export async function placePendingOrder({
  orderItems,
  clientId,
  formData,
}: placePendingOrderProps): Promise<ServerActionResponse<{ orderId: string }>> {
  try {
    // 1. Extract and Validate FormData using Zod
    const rawData = Object.fromEntries(formData.entries());
    
    // Note: If using standard HTML form submission, checkboxes usually send "on"
    // I've kept your "true" check, but verify if your frontend sends "true" or "on"
    const processedData = {
      ...rawData,
      saveAsDefault: rawData.saveAsDefault === "true",
      confirmAllCorrect: rawData.confirmAllCorrect === "true",
    };

    const validatedFields = deliveryInfoSchema.safeParse(processedData);

    if (!validatedFields.success) {
      return {
        success: false,
        message: "Validation failed. Please check your delivery information.",
        fieldErrors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const {
      fullName,
      phone,
      addressLine1,
      addressLine2,
      city,
      district,
      postalCode,
      country,
      optMessage,
    } = validatedFields.data;

    // 2. Calculate Total Amount and fetch Shipping Cost
    const shipping = await prisma.shippingCost.findUnique({
      where: { district: district as Districts },
    });

    if (!shipping) {
      return { success: false, message: "Invalid district selected." };
    }

    const itemsTotal = orderItems.reduce(
      (acc, item) => acc + (item.isSale ? item.salePrice || item.price : item.price) * item.qty,
      0
    );
    const finalTotal = itemsTotal + shipping.cost;

    // 3. DATABASE TRANSACTION
    // We assign the result of the transaction to a variable
    const result = await prisma.$transaction(async (tx) => {
      // A. Create the Main Order
      const order = await tx.order.create({
        data: {
          userId: clientId || null,
          status: OrderStatus.PENDING,
          totalAmount: finalTotal,
          shippingCost: shipping.cost,
          items: {
            create: orderItems.map((item) => ({
              variantId: item.variantId,
              quantity: item.qty,
              price: item.isSale ? item.salePrice || item.price : item.price,
            })),
          },
        },
      });

      // B. Create Delivery Info
      await tx.deliveryInfo.create({
        data: {
          orderId: order.id,
          fullName,
          phone,
          addressLine1,
          addressLine2: addressLine2 || null,
          city,
          district: district as Districts,
          postalCode,
          country,
          additionalNote: optMessage || null,
        },
      });

      // C. Clear the User's Cart if they are logged in
      if (clientId) {
        await tx.cartItem.deleteMany({
          where: { cart: { userId: clientId } },
        });
      }

      // Return the order ID from the transaction
      return { orderId: order.id };
    });
revalidatePath("/order");
    return {
      success: true,
      message: "Order placed successfully. Proceeding to payment.",
      data: { orderId: result.orderId }, // result is now available here
    };
  } catch (error) {
    console.error("PLACE_ORDER_ERROR:", error);
    return {
      success: false,
      message: "Failed to place order. Please try again.",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}