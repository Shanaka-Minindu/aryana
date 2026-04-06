"use client";

import React from "react";
import { getCategoryProps } from "@/types";
import AdminCategoryItem from "../molecules/admin-category-item";
 // Adjust path as needed

interface props {
  categories?: getCategoryProps[];
}

const AdminAllCategory = ({ categories = [] }: props) => {
  return (
    <div className="w-full bg-white border border-zinc-100 rounded-xl p-8 shadow-sm max-w-4xl">
      <h2 className="text-xl font-bold text-zinc-900 mb-8 pb-4 border-b border-zinc-50">
        All Categories
      </h2>

      {categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-zinc-400">
          <p className="text-lg">No categories found.</p>
          <p className="text-sm">Start by adding a new category above.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          {categories.map((cat) => (
            <AdminCategoryItem
              key={cat.id}
              id={cat.id}
              category={cat.name}
              slug={cat.slug}
              image={cat.image}
              parentId={cat.parentId}
              categories={categories}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminAllCategory;