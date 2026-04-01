/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import React, { useEffect, useState } from "react";
import FilterBox from "@/components/molecules/filter-box";
import PaginationControls from "@/components/molecules/pagination-controls";
import { getFilterDataRes, selectedProduct } from "@/types";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import toast from "react-hot-toast";
import CategoryItemsDisplay from "@/components/molecules/category-items-display";
import PageColumns from "@/components/molecules/page-columns";
interface CategoryClientProps {
  products: selectedProduct[];
  currentPage: number;
  totalPage: number;
  isDisabled: boolean;
  filterData: getFilterDataRes;
  totalProducts: number;
  errorMessage?: string | null;
}
const CategoryClient = ({
  currentPage,
  isDisabled,
  filterData,
  totalProducts,
  products,
  totalPage,
  errorMessage,
}: CategoryClientProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [columnCount, setColumnCount] = useState(4);
  useEffect(() => {
    if (errorMessage) {
      toast.error(errorMessage);
    }
  }, [errorMessage]);

  // Helper to get array from URL
  const getArrayParam = (key: string) => {
    const val = searchParams.get(key);
    return val ? val.split(",") : [];
  };

  const updateFilters = (updates: Record<string, string[]>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, values]) => {
      if (values.length > 0) {
        if (key === "minPrice" || key === "maxPrice") {
          params.set(key, values[0]);
        } else {
          params.set(key, values.join(","));
        }
      } else {
        params.delete(key);
      }
    });

    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const pageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  console.log(products);
  return (
    <div className="max-w-[1600px] mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between border-b pb-4 px-7">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-xl border-zinc-900 px-6 py-5 font-bold uppercase tracking-widest transition-all hover:bg-zinc-900 hover:text-white"
        >
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
        <div className="flex gap-5 items-center " >
          <h3 className=" text-xs font-bold uppercase tracking-widest text-zinc-900">
            {totalProducts} products
          </h3>
          <PageColumns
            columnChange={setColumnCount}
            currentColumn={columnCount}
          />
        </div>
      </div>

      <div className="flex gap-8">
        <FilterBox
          filterData={filterData}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          onFilterUpdate={updateFilters}
          activeFilters={{
            size: getArrayParam("size"),
            inStock: getArrayParam("inStock"),
            color: getArrayParam("color"),
            minPrice: searchParams.get("minPrice"),
            maxPrice: searchParams.get("maxPrice"),
          }}
        />
        <CategoryItemsDisplay products={products} columns={columnCount} />
      </div>
      <div className="flex-1">
        {/* Product Grid */}
        <PaginationControls
          currentPage={currentPage}
          onPageChange={pageChange}
          totalPage={totalPage}
          isDisabled={isDisabled}
        />
      </div>
    </div>
  );
};

export default CategoryClient;
