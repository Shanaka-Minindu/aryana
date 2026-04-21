"use server"
import React from "react";
import AddItemsClient from "./add-items-client";
import {
  getCategories,
 
  getDisplayItems,
 
  positionData,
} from "@/lib/actions/admin/admin.displayItem.action";

const AddItems = async () => {
  const categories = await getCategories();
  const position = await positionData();

  const disItems = await getDisplayItems();


 

  if (!categories.success || !categories.data || !position.data) return;
  return (
    <div>
      <AddItemsClient
        categories={categories.data}
        displayItems = {disItems.data ??[]}
        position={position.data}
      />
    </div>
  );
};

export default AddItems;
