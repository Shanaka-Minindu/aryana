import AddProductCard from "@/components/molecules/add-product-card";
import StepsIndicator from "@/components/molecules/steps-indicator";
import AdminAllProducts from "@/components/organisms/admin-all-products";
import {
  categoryProduct,
  filteredAdminProducts,
  ProductWithRelations,
} from "@/types";
import React from "react";

interface props {
  categoryData: categoryProduct[];
  productData: filteredAdminProducts;
}

const AddProductClient = ({ productData, categoryData }: props) => {

  return (
    <div className="m-3">
      <AddProductCard categoryData={categoryData} />
      <div className="mt-8">
        <AdminAllProducts
          productData={productData}
          categoryData={categoryData}
        />
      </div>
    </div>
  );
};

export default AddProductClient;
