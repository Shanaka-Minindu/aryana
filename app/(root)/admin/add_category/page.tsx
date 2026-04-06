import { auth } from "@/auth";
import { getCategory } from "@/lib/actions/admin/admin.category.actions";
import { UploadButton } from "@/lib/uploadthing";
import React from "react";
import AddCategoryClient from "./add-category-client";

const AddCategory = async () => {
  const session = await auth();
  if (!(session?.user.role === "ADMIN")) {
    return;
  }


  const categories = await getCategory();


  return <AddCategoryClient categories={categories.data || undefined} />;
};

export default AddCategory;
