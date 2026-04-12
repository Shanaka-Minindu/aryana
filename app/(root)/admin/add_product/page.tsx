import React from "react";
import AddProductClient from "./add-product-client";
import {
  getAllProducts,
  getCategoryProduct,
} from "@/lib/actions/admin/admin.product.actions";


interface SearchParams{
  page?:string;
  category?: string
}

const AddProduct = async ({searchParams}:{searchParams:Promise<SearchParams>}) => {


  const query = await searchParams;

  const categoryData = await getCategoryProduct();
  const productDataBack = await getAllProducts({
    categorySlug: query.category || "all",
    page: query.page,
    size: 5,
  });
  const productData = productDataBack.data;
  if (!categoryData.success || !categoryData.data) {
    return;
  }
  if (!productDataBack.success || !productData) return;

  return (
    <AddProductClient
      categoryData={categoryData.data}
      productData={productData}
    />
  );
};

export default AddProduct;
