"use client"
import AddItemsSelector from '@/components/molecules/add-items-selector'
import StepsIndicator from '@/components/molecules/steps-indicator'
import AddItemsForm from '@/components/organisms/add-items-form'
import DisplayItemsView from '@/components/organisms/display-items-view'
import { getProductCategory } from '@/lib/actions/admin/admin.displayItem.action'
import { useDisplayItemStore } from '@/store/display-item-store'
import { getCategoriesProps, getDisplayItemsRes, getProductCategoryRes, positionDataProps } from '@/types'
import React, { useEffect, useState } from 'react'


interface AddItemsClientProps{
    categories: getCategoriesProps[]
    position:positionDataProps
    displayItems: getDisplayItemsRes[]
    
}

const AddItemsClient = ({categories, position,displayItems}:AddItemsClientProps) => {

  //  const [getCatProducts,setCatProducts] =useState<getProductCategoryRes[]>([])

    const {savedItem,productSelect} = useDisplayItemStore();


  return (
    <div className="w-full bg-white border border-zinc-100 rounded-xl p-8 shadow-sm max-w-5xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col gap-6 mb-8">
        <h2 className="text-xl font-bold text-zinc-900 border-b border-zinc-50 pb-4">
          Add Carousel
        </h2>

        {/* Progress Indicator integration */}
        <div className="w-full py-4">
          <div className="mb-6">
            <StepsIndicator totalSteps={2} step={productSelect ? 1 : 2} />
          </div>

          {productSelect ? (
            <AddItemsForm categories={categories}  position={position}/>
          ) : (savedItem && <AddItemsSelector displayItemId={savedItem.id}/>)}
        </div>
      </div>

      <DisplayItemsView displayItems={displayItems}/>
    </div>
  
  )
}

export default AddItemsClient