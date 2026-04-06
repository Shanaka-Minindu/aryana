import AdminAllCategory from "@/components/organisms/admin-all-category";
import NewCategoryCard from "@/components/organisms/new-category-card";
import { getCategoryProps } from "@/types";
import React from "react";

interface props {
  categories?: getCategoryProps[];
}

const AddCategoryClient = ({ categories }: props) => {
  return (
    <div className="flex flex-col items-center gap-8 py-10">
      <NewCategoryCard categories={categories} />
      <AdminAllCategory categories={categories}/>
    </div>
  );
};

export default AddCategoryClient;
