"use client";

import React, { useState } from "react";
import StepsIndicator from "@/components/molecules/steps-indicator";
import { categoryProduct } from "@/types";
import ProductDetailsForm from "@/app/(root)/admin/add_product/add-product-forms/product-details";
import AddProductImage from "@/app/(root)/admin/add_product/add-product-forms/add-product-image";
import AddVariants from "@/app/(root)/admin/add_product/add-product-forms/add-variants";

interface props {
  categoryData: categoryProduct[];
}

const AddProductCard = ({ categoryData }: props) => {
  // Local state to manage the current step of the product creation process
  const [currentStep, setCurrentStep] = useState(1);

  const [proId, setProId] = useState("");

  const productStep1 = (data: string) => {
    setProId(data);
    console.log(data);
    setCurrentStep(2);
  };

  return (
    <div className="w-full bg-white border border-zinc-100 rounded-xl p-8 shadow-sm max-w-5xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col gap-6 mb-8">
        <h2 className="text-xl font-bold text-zinc-900 border-b border-zinc-50 pb-4">
          Add Product
        </h2>

        {/* Progress Indicator integration */}
        <div className="w-full py-4">
          <StepsIndicator totalSteps={3} step={currentStep} />
        </div>
      </div>
      {currentStep === 1 ? (
        <ProductDetailsForm
          categoryData={categoryData}
          isDoneAdding={productStep1}
        />
      ) : (
        <div></div>
      )}

      {currentStep === 2 ? (
        <AddProductImage
          isDoneAdding={() => setCurrentStep(3)}
          productId={proId}
        />
      ) : (
        <div></div>
      )}
      {currentStep === 3 ? (
        <AddVariants isDoneAdding={() => setCurrentStep(1)} productId={proId} />
      ) : (
        <div></div>
      )}
    </div>
  );
};

export default AddProductCard;
