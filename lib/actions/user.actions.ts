"use server";

import { auth, signIn } from "@/auth";
import {
  addressInfoSchema,
  loginSchema,
  registrationSchema,
} from "../validators";
import { deliveryInfo, ServerActionResponse } from "@/types";
import { AuthError } from "next-auth";
import { prisma } from "@/db/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { Districts } from "../generated/prisma";

export async function signInWithCredentials(
  formData: FormData,
): Promise<ServerActionResponse<null>> {
  // 1. Extract data from FormData
  const email = formData.get("email");
  const password = formData.get("password");
  const callbackUrl = formData.get("callbackUrl") as string | null;

  // 2. Validate data using Zod
  const validatedFields = loginSchema.safeParse({
    email,
    password,
  });
  console.log(validatedFields);

  // 3. Return early if validation fails
  if (!validatedFields.success) {
    return {
      success: false,
      message: "Invalid input fields",
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    // 4. Call the Auth.js signIn function
    await signIn("credentials", {
      email: validatedFields.data.email,
      password: validatedFields.data.password,
      redirectTo: callbackUrl || "/", // Redirect back or to home
    });

    return {
      success: true,
      message: "Login successful",
    };
  } catch (error) {
    // 5. Handle NextAuth Errors
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return {
            success: false,
            message: "Invalid email or password.",
          };
        default:
          return {
            success: false,
            message: "Something went wrong. Please try again.",
          };
      }
    }
    throw error;
  }
}

export async function signUpWithCredentials(
  formData: FormData,
  localCartData?: string,
): Promise<ServerActionResponse<null>> {
  // 1. Extract and Validate Data
  const rawData = Object.fromEntries(formData.entries());
  const callbackUrl = (formData.get("callBackUrl") as string) || "/";

  const validatedFields = registrationSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      success: false,
      error: "Validation failed.",
      fieldErrors: validatedFields.error.flatten().fieldErrors,
      errorType: "ValidationError",
    };
  }

  const { name, email, password } = validatedFields.data;

  try {
    // 2. Check for existing user
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return {
        success: false,
        error: "User already exists with this email.",
        errorType: "UserExistsError",
      };
    }

    // 3. Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create User and Cart in a Transaction
    await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      });

      // 5. Handle Local Cart Data if provided
      if (localCartData) {
        try {
          const parsedCart: { variantId: string; quantity: number }[] =
            JSON.parse(localCartData);

          if (parsedCart.length > 0) {
            await tx.cart.create({
              data: {
                userId: newUser.id,
                items: {
                  createMany: {
                    data: parsedCart.map((item) => ({
                      variantId: item.variantId,
                      quantity: item.quantity,
                    })),
                  },
                },
              },
            });
          }
        } catch (e) {
          console.error("Failed to parse or save local cart data", e);
          // We continue even if cart fails, or you can throw to rollback
        }
      }
    });

    // 6. Trigger Sign In
    await signIn("credentials", {
      email,
      password,
      redirectTo: callbackUrl,
    });

    return {
      success: true,
      message: "Account created successfully!",
    };
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        success: false,
        error: "Account created but auto-login failed.",
        errorType: "AuthError",
      };
    }

    // Auth.js uses internal redirect errors to navigate; we must let them pass
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((error as any).digest?.includes("NEXT_REDIRECT")) {
      throw error;
    }

    console.error("Registration Error:", error);
    return {
      success: false,
      error: "Something went wrong during registration.",
      errorType: "DatabaseError",
    };
  }
}

export async function getUserAddressData(
  userId: string,
): Promise<ServerActionResponse<deliveryInfo>> {
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

    // 2. Fetch the user's address
    // We prioritize the default address, otherwise take the most recent one
    const address = await prisma.userAddress.findFirst({
      where: {
        userId: userId,
      },
      orderBy: [
        { isDefault: "desc" }, // True (1) comes before False (0)
        { updatedAt: "desc" }, // Most recently updated
      ],
    });

    // 3. Handle case where no address exists yet
    if (!address) {
      return {
        success: false,
        message: "No address found for this user.",
      };
    }

    // 4. Map DB fields to deliveryInfo interface
    const data: deliveryInfo = {
      id: address.id,
      fullName: address.fullName,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 ?? undefined,
      city: address.city,
      district: address.district,
      postalCode: address.postalCode ?? "",
      country: address.country,
    };

    return {
      success: true,
      message: "Address data retrieved successfully.",
      data,
    };
  } catch (error) {
    console.error("GET_USER_ADDRESS_ERROR:", error);
    return {
      success: false,
      message: "An error occurred while fetching address data.",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

interface crateAddress {
  formData: FormData;
  clientId: string;
}

export async function createOrUpdateUserAddress({
  clientId,
  formData,
}: crateAddress): Promise<ServerActionResponse<null>> {
  try {
    // 1. Authentication Check
    const session = await auth();
    if (!session || session.user?.id !== clientId) {
      return {
        success: false,
        message: "Unauthorized access.",
        errorType: "AUTHENTICATION_ERROR",
      };
    }

    // 2. Extract and Validate Data
    const rawData = Object.fromEntries(formData.entries());
    const validatedFields = addressInfoSchema.safeParse(rawData);

    if (!validatedFields.success) {
      return {
        success: false,
        message: "Invalid form data.",
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
    } = validatedFields.data;

    // 3. Find if the user already has an address
    const existingAddress = await prisma.userAddress.findFirst({
      where: { userId: clientId },
    });

    if (existingAddress) {
      // 4. Update existing address
      await prisma.userAddress.update({
        where: { id: existingAddress.id },
        data: {
          fullName,
          phone,
          addressLine1,
          addressLine2: addressLine2 || null,
          city,
          district: district as Districts,
          postalCode,
          country,
        },
      });
    } else {
      // 5. Create new address (Set as default since it's their first one)
      await prisma.userAddress.create({
        data: {
          userId: clientId,
          fullName,
          phone,
          addressLine1,
          addressLine2: addressLine2 || null,
          city,
          district: district as Districts,
          postalCode,
          country,
          isDefault: true,
        },
      });
    }
    revalidatePath("/user");

    return {
      success: true,
      message: "Address saved successfully.",
      data: null,
    };
  } catch (error) {
    console.error("CREATE_OR_UPDATE_ADDRESS_ERROR:", error);
    return {
      success: false,
      message: "An error occurred while saving the address.",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function deleteAddress(
  addId: string,
  userId: string,
): Promise<ServerActionResponse<null>> {
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

    // 2. Verify ownership and check if it's the default address
    const addressToDelete = await prisma.userAddress.findFirst({
      where: {
        id: addId,
        userId: userId,
      },
    });

    if (!addressToDelete) {
      return {
        success: false,
        message:
          "Address not found or you do not have permission to delete it.",
      };
    }

    // 3. Perform the deletion
    await prisma.userAddress.delete({
      where: {
        id: addId,
      },
    });

    // 4. (Optional) If the deleted address was the default,
    // set the most recent remaining address as the new default.
    if (addressToDelete.isDefault) {
      const nextAddress = await prisma.userAddress.findFirst({
        where: { userId: userId },
        orderBy: { updatedAt: "desc" },
      });

      if (nextAddress) {
        await prisma.userAddress.update({
          where: { id: nextAddress.id },
          data: { isDefault: true },
        });
      }
    }
    revalidatePath("/user");
    return {
      success: true,
      message: "Address deleted successfully.",
      data: null,
    };
  } catch (error) {
    console.error("DELETE_ADDRESS_ERROR:", error);
    return {
      success: false,
      message: "An error occurred while deleting the address.",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
