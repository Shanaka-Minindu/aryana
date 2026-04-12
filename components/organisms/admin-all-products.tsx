"use client";

import { categoryProduct, filteredAdminProducts } from "@/types";
import React from "react";
import PaginationControls from "../molecules/pagination-controls";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import AdminProductItem from "../molecules/admin-product-item";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface props {
  productData: filteredAdminProducts;
  categoryData: categoryProduct[];
}

const AdminAllProducts = ({ productData, categoryData }: props) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  console.log(categoryData)
  // Get current category from URL or default to "all"
  const currentCategory = searchParams.get("category") || "all";

  const updateURL = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    
    // If we change category, we should reset to page 1
    if (key === "category") {
      params.set("page", "1");
    }
    
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handlePageChange = (page: number) => {
    updateURL("page", page.toString());
  };

  const handleCategoryChange = (value: string) => {
    updateURL("category", value);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* 1. Header & Filter Section */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-zinc-100 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
            Our Product list
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Managing {productData.totalProducts} total products
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-zinc-600">Category:</span>
          <Select value={currentCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-[180px] bg-white border-zinc-200 rounded-lg">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {categoryData.map((cat) => (
                <SelectItem key={cat.id} value={cat.slug}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 2. Products List */}
      <div className="space-y-4 min-h-[400px]">
        {productData.product.length > 0 ? (
          productData.product.map((item) => (
            <AdminProductItem key={item.id} Product={item} categoryData={categoryData}/>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-zinc-100 rounded-2xl">
            <p className="text-zinc-400 font-medium">No products found in this category.</p>
          </div>
        )}
      </div>

      {/* 3. Pagination Controls */}
      {productData.totalPages > 1 && (
        <div className="pt-4">
          <PaginationControls
            currentPage={productData.currentPage}
            onPageChange={handlePageChange}
            totalPage={productData.totalPages}
            isDisabled={false}
          />
        </div>
      )}
    </div>
  );
};

export default AdminAllProducts;