"use server";

import { signIn } from "@/auth";
import { loginSchema } from "../validators";
import { ServerActionResponse } from "@/types";
import { AuthError } from "next-auth";

export async function signInWithCredentials(
  formData: FormData
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
  console.log(validatedFields)

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