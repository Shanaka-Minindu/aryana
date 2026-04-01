import React from "react";
import CategoryClient from "./category-client";
import { getFilterData, getFilteredCategoryData } from "@/lib/actions/filter.actions";
import { notFound } from "next/navigation";

interface Params {
  categorySlug: string;
}

interface SearchParams {
  size?: string;
  inStock?: string; // This comes from your FilterBox key "stock"
  color?: string;
  minPrice?: string;
  maxPrice?: string;
  page?: string;
}

const CategoryPage = async ({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}) => {
  const slug = await params;
  const query = await searchParams;

  // 1. Fetch both Filter Metadata and Filtered Products in parallel
  const [filterRes, productsRes] = await Promise.all([
    getFilterData(),
    getFilteredCategoryData({
      categorySlug: slug.categorySlug,
      size: query.size,
      color: query.color,
      minPrice: query.minPrice,
      maxPrice: query.maxPrice,
      inStock: query.inStock, // Mapping your URL "stock" to action "inStock"
      page: query.page,
    }),
  ]);

  // 2. Handle Critical Failures (e.g., Category doesn't exist)
  if (!filterRes.success || !filterRes.data) {
    return notFound();
  }

  // 3. Prepare error message for Toast if product fetch failed
  const errorMessage = !productsRes.success ? productsRes.message : null;

  return (
    <div>
      <CategoryClient
        currentPage={productsRes.data?.currentPage || 1}
        totalPage={productsRes.data?.totalPages || 1}
        totalProducts={productsRes.data?.totalProducts||1}
        filterData={filterRes.data}
        products={productsRes.data?.product || []}
        isDisabled={false}
        errorMessage={errorMessage} // Pass this to trigger toast
      />
    </div>
  );
};

export default CategoryPage;