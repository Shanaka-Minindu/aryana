import {
  Category,
  Prisma,
  Product,
  ProductImage,
  ProductVariant,
} from "@/lib/generated/prisma";

export type FieldErrors = Record<string, string[] | undefined>;

export interface ServerActionResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errorType?: string;
  fieldErrors?: FieldErrors;
}

export interface carouselItem {
  id: string;
  imgUrl: string;
  heading: string;
  subHeading: string;
  linkUrl: string;
  textPosition: "LEFT" | "RIGHT" | "CENTER";
  buttonText: string;
  position: number;
}

export interface selectedProduct {
  id: string;
  name: string;
  price: number;
  isActive: boolean;
  isSale: boolean;
  categorySlug: string;
  slug: string;
  salePrice?: number;
  colors: string[];
  images: ProductImage[];
}

export interface DisplayItemsProps {
  id: string;
  title: string;
  categorySlug: string;
  categoryId: string;
  position: number;
  isActive: boolean;
  products: selectedProduct[];
}

export interface getCategoryHomeData {
  name: string;
  slug: string;
  imageUrl: string;
}

export type ProductWithRelations = Prisma.ProductGetPayload<{
  include:{
    variants:true;
    images:true;
    category:{
      select:{
        name:true;
        slug:true
      }
    }
  }
}>


