"use client";

import React, { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { getProductCategoryRes } from '@/types';
import { addDisplayItems, getProductCategory } from '@/lib/actions/admin/admin.displayItem.action';
import { useDisplayItemStore } from '@/store/display-item-store';
import { Button } from '@/components/ui/button';
import ProductCard from './product-card';

interface Props {
 
  displayItemId?: string;
}

const AddItemsSelector = ({ displayItemId }: Props) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  const [products,setCatProducts] =useState<getProductCategoryRes[]>([])

  // Get the displayItemId saved in the previous step from Zustand
  
  const clearSavedItem = useDisplayItemStore((state) => state.clearSavedItem);
  const savedItems = useDisplayItemStore((state)=>state.savedItem);
  const {setProductSelect}= useDisplayItemStore()

useEffect( ()=>{

   async function fatechData (){
        const data =  await getProductCategory(savedItems!.categoryId);
       const products = data.data
       console.log(products)
       if(!products) return
       setCatProducts(products)
    }
    fatechData();
    
},[savedItems,clearSavedItem])


  
  const toggleProduct = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id); // Deselect
      }
      if (prev.length >= 8) {
        toast.error("Maximum 8 products allowed");
        return prev;
      }
      return [...prev, id]; // Select and assign next position
    });
  };

  const handleDone = () => {
    console.log(displayItemId)
    if (!displayItemId) return toast.error("Display item context lost. Please restart.");
    //if (selectedIds.length < 4) return toast.error("Please select at least 4 products.");

    startTransition(async () => {
      // Map selected IDs to the required format: { productId, position }
      const productPositions = selectedIds.map((id, index) => ({
        productId: id,
        position: (index + 1).toString(),
      }));

      const res = await addDisplayItems({
        displayItemId: displayItemId,
        products: productPositions,
      });

      if (res.success) {
        toast.success(res.message!);
        setProductSelect(true)
        clearSavedItem(); // Clear Zustand store after success
        router.push("/admin/add_items");
      } else {
        toast.error(res.message!);
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Product Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {products.map((product) => {
          const selectedIndex = selectedIds.indexOf(product.id);
          return (
            <ProductCard
              key={product.id}
              image={product.image}
              name={product.name}
              price={product.price}
              position={selectedIndex !== -1 ? selectedIndex + 1 : null}
              onClick={() => toggleProduct(product.id)}
            />
          );
        })}
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between border-t pt-6">
        <p className="text-sm font-medium text-zinc-500">
          Selected: <span className="text-black font-bold">{selectedIds.length}</span> (Min 4, Max 8)
        </p>
        <div>
        <Button 
          onClick={()=>{setProductSelect(true)}}
          className="bg-black text-white hover:bg-zinc-800 h-12 px-10 rounded-lg shadow-lg font-bold"
        >
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Back
        </Button>
        <Button 
          onClick={handleDone}
          disabled={isPending }
          className="bg-black text-white hover:bg-zinc-800 h-12 px-10 rounded-lg shadow-lg font-bold"
        >
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Done
        </Button>
        </div>
      </div>
    </div>
  );
};

export default AddItemsSelector;