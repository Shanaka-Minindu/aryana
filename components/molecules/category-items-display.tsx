import { selectedProduct } from "@/types";
import React from "react";

import { cn } from "@/lib/utils";
import Product from "./product";

interface CategoryItemsDisplayProps {
  products: selectedProduct[];
  columns: number;
}

const CategoryItemsDisplay = ({ products, columns=2 }: CategoryItemsDisplayProps) => {
  // Mapping columns to Tailwind classes
  const gridConfig: Record<number, string> = {
    2: "grid-cols-2",
    3: "grid-cols-2 md:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
    5: "grid-cols-2 md:grid-cols-3 lg:grid-cols-5",
  };

  return (
    <div
      className={cn(
        "grid gap-x-4 gap-y-10 transition-all duration-300 w-full",
        gridConfig[columns] || "grid-cols-2 md:grid-cols-4 " // Fallback
      )}
    >
      {products.length > 0 ? (
        products.map((product) => (
          <Product key={product.id} product={product} />
        ))
      ) : (
        <div className="col-span-full py-20 text-center">
          <p className="text-zinc-500 font-medium">No products found matching your filters.</p>
        </div>
      )}
    </div>
  );
};

export default CategoryItemsDisplay;