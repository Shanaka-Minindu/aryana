import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email not valid.").min(4, "Email too short"),
  password: z.string().min(3, "Password too short"),
});

export const AddToCartSchema = z.object({
  color: z
    .string({
      error: "Select a color",
    })
    .min(1, { message: "Please select a color" }),

  size: z
    .string({
      error: "Size is required",
    })
    .min(1, { message: "Please select a size" }),

  // You likely also need these for a functional cart action:
  productId: z.string().uuid(),

  quantity: z.number().int().positive().default(1),
});
