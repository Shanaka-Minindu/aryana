"use server";
import React from "react";
import ProductPageClient from "./productPage-client";
import { getProduct } from "@/lib/actions/product.actions";
import { auth } from "@/auth";
import { addItemToCart } from "@/lib/actions/cart.actions";

interface Params {
  slug: string;
}
const ProductPage = async ({ params }: { params: Promise<Params> }) => {
  const slug = await params;
  

  const session = await auth();

  const productData = await getProduct(slug.slug);

  if (productData.data?.variants === undefined) return;

  return (
    <ProductPageClient
      productData={productData.data}
      session={session ?? undefined}
    />
  );
};

export default ProductPage;
