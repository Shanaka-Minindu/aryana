"use client";

import React from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import CartItem from "@/components/molecules/cart-item"; // Adjust path as needed
import { CartItemsServerRes } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

interface OrderPageCartProps {
  items: CartItemsServerRes[];
  loading: boolean;
  processingId: string | null;
  handleRemove: (variantId: string) => void;
  handleUpdateQty: (variantId: string, newQty: number) => void;
  isPending: boolean;
}

const OrderPageCart = ({
  items,
  handleRemove,
  handleUpdateQty,
  isPending,
  loading,
  processingId,
}: OrderPageCartProps) => {
  
  // 1. Loading State
  if (loading) {
    return (
      <div className="w-full bg-white border border-zinc-100 rounded-xl p-8 shadow-sm space-y-4">
        <Skeleton className="h-8 w-32 mb-6" />
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-32 w-full rounded-[2rem]" />
        ))}
      </div>
    );
  }

  // 2. Empty State (Matches image_436703.png)
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white border border-zinc-100 rounded-xl shadow-sm">
        <div className="mb-4 text-zinc-900">
           {/* Custom Cart Icon to match design */}
          <ShoppingCart className="h-16 w-16 stroke-[1.5]" />
        </div>
        <h2 className="text-2xl font-bold text-zinc-900 mb-2">Your cart is empty</h2>
        <Link 
          href="/shop/shopAll" 
          className="text-sm font-medium text-zinc-500 underline underline-offset-4 hover:text-zinc-900 transition-colors"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  // 3. Cart Items List (Matches image_00b50f.png)
  return (
    <div className="w-full bg-white border border-zinc-100 rounded-xl p-6 md:p-8 shadow-sm">
      <div className="flex items-center justify-between border-b border-zinc-100 pb-2 mb-6">
        <h2 className="text-xl font-bold text-zinc-900 tracking-tight">
          Order Items
        </h2>
      </div>

      <div className="flex flex-col gap-4">
        {items.map((item) => (
          <CartItem
            key={item.variantId}
            {...item}
            disableQtyBtn={isPending || processingId === item.variantId}
            addQty={(id) => handleUpdateQty(id, item.qty + 1)}
            removeQty={(id) => handleUpdateQty(id, item.qty - 1)}
            removeItem={handleRemove}
          />
        ))}
      </div>
    </div>
  );
};

export default OrderPageCart;