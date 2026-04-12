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

export const registrationSchema = z
  .object({
    name: z.string().min(1, "Name is required."),

    email: z
      .string()
      .min(1, "Email is required.")
      .email("Please enter a valid email address."),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters long.")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
      .regex(/[0-9]/, "Password must contain at least one number."),

    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"], // Sets the error specifically on the confirmPassword field
  });

export const addressInfoSchema = z.object({
  fullName: z.string().min(1, "Full name is required."),

  phone: z
    .string()
    .length(10, "Phone number must be exactly 10 digits.")
    .regex(
      /^07\d{8}$/,
      "Phone number must start with '07' followed by 8 digits.",
    ),

  addressLine1: z.string().min(1, "Address Line 1 is required."),

  addressLine2: z.string().optional().or(z.literal("")),

  city: z.string().min(1, "City is required."),

  district: z.string().min(1, "District is required."),

  postalCode: z.string().min(1, "Postal code is required."),

  country: z.string().min(1, "Country is required."),
});

export const deliveryInfoSchema = addressInfoSchema.extend({
  optMessage: z.string().optional().or(z.literal("")),
  saveAsDefault: z.boolean(),

  confirmAllCorrect: z.boolean().refine((val) => val === true, {
    message: "You must check this box to proceed.",
  }),
});

export const newCategoryValidator = z.object({
  name: z
    .string()
    .min(1, "Category name is required.")
    .max(50, "Name is too long."),

  slug: z
    .string()
    .min(1, "Slug is required.")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens.",
    ),

  parentId: z
    .string()
    .uuid("Invalid parent category ID.")
    .or(z.literal("MAIN")) // Add this to allow the "MAIN" value from your Select
    .or(z.literal(""))
    .or(z.null())
    .optional(),
  image: z
    .string()
    .url("Please provide a valid image URL.")
    .optional()
    .or(z.literal(""))
    .or(z.null()),
});

export const addProductSchema = z
  .object({
    name: z.string().min(1, "Product name is required."),
    slug: z
      .string()
      .min(1, "Slug is required.")
      .regex(
        /^[a-z0-9-]+$/,
        "Slug must be lowercase and contain only letters, numbers, or hyphens.",
      ),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters long."),

    // Validates that the string contains only digits and is not empty
    price: z
      .string()
      .min(1, "Price is required.")
      .regex(/^\d+$/, "Price must be a whole number (digits only).")
      .refine((val) => parseInt(val) > 0, "Price must be greater than 0."),

    isSale: z.boolean().default(false),

    // salePrice is an optional string
    salePrice: z
      .string()
      .optional()
      .or(z.literal(""))
      .refine(
        (val) => !val || /^\d+$/.test(val),
        "Sale price must be a whole number.",
      ),

    category: z.string().min(1, "Please select a category."),
  })
  .refine(
    (data) => {
      // If isSale is true, salePrice must not be empty and must be > 0
      if (data.isSale) {
        return !!data.salePrice && parseInt(data.salePrice) > 0;
      }
      return true;
    },
    {
      message: "Sale price is required when the product is on sale.",
      path: ["salePrice"],
    },
  )
  .refine(
    (data) => {
      // Numerical comparison: Parse strings to integers for the check
      if (data.isSale && data.salePrice && data.price) {
        return parseInt(data.salePrice) < parseInt(data.price);
      }
      return true;
    },
    {
      message: "Sale price must be lower than the regular price.",
      path: ["salePrice"],
    },
  );

// Update your schema
export const addVariantSchema = z.object({
  size: z
    .string()
    .min(1, "Size is required (e.g., Small, 42, XL)."),

  color: z
    .string()
    .min(1, "Color is required (e.g., Red, Blue, #000000)."),

  stock: z
    .string()
    .min(1, "Stock quantity is required.")
    // \d+ ensures only digits 0-9 are allowed
    .regex(/^\d+$/, "Stock must be a whole number (no decimals or letters).")
    .refine((val) => parseInt(val, 10) >= 0, {
      message: "Stock cannot be a negative value.",
    }),
});
