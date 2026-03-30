import React from "react";
import ProductPageClient from "./productPage-client";
import { getProduct } from "@/lib/actions/product.actions";

interface Params {
  slug: string;
}
const ProductPage = async ({ params }: { params: Promise<Params> }) => {
  const slug = await params;

  const productData = await getProduct(slug.slug);

  if (productData.data?.variants === undefined) return;

  return <ProductPageClient productData={productData.data} />;
};

export default ProductPage;
