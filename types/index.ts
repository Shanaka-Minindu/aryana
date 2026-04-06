import { Prisma, ProductImage } from "@/lib/generated/prisma";

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
  salePrice?: number | null;
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
  include: {
    variants: true;
    images: true;
    category: {
      select: {
        name: true;
        slug: true;
      };
    };
  };
}>;

export interface getFilterDataRes {
  sizes: string[];
  colors: string[];
  inStock: number;
  outOfStock: number;
  lowPrice: number;
  highPrice: number;
}

export interface filterType {
  size: string[];
  inStock: string[];
  color: string[];
  minPrice: string | null;
  maxPrice: string | null;
}

export interface CartItemProps {
  variantId: string;
  imageUrl: string;
  title: string;
  color: string;
  size: string;
  stock: number;
  qty: number;
  price: number;
  isSale: boolean;
  salePrice?: number;
  disableQtyBtn: boolean;
  addQty: (id: string) => void;
  removeQty: (id: string) => void;
  slug: string;
  removeItem: (id: string) => void;
}

export type CartItemsServerRes = Omit<
  CartItemProps,
  "addQty" | "removeQty" | "removeItem" | "disableQtyBtn"
>;




export interface deliveryInfo{
  id:string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  district: string;
  postalCode: string;
  country: string;
}

export interface getCategoryProps {
  id: string;
  name: string;
  parentId?: string | null;
  image?:string | null;
  slug:string
}