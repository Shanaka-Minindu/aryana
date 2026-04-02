"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CartItemProps } from "@/types";

const CartItem = ({
  color,
  variantId,
  imageUrl,
  price,
  qty,
  removeItem,
  isSale,
  salePrice,
  stock,
  disableQtyBtn,
  slug,
  addQty,
  removeQty,
  size,
  title,
}: CartItemProps) => {
  const isOutOfStock = qty > stock;
  const currentPrice = isSale && salePrice ? salePrice : price;
  const totalPrice = currentPrice * qty;
  const hasMultipleQty = qty > 1;

  return (
    <div className="group flex flex-col overflow-hidden rounded-[2rem] border border-zinc-100 bg-white shadow-sm transition-all hover:shadow-md">
      {/* Main Item Row */}
      <div className="flex items-center gap-4 p-4 md:gap-6">
        {/* Product Image */}
        <div className="relative h-24 w-20 flex-shrink-0 overflow-hidden rounded-2xl bg-zinc-100 md:h-28 md:w-24">
          <Link href={`/shop/${slug}`}>
            <Image src={imageUrl} alt={title} fill className="object-cover" />
          </Link>
        </div>
        <div className="flex flex-col md:flex-row">
          {/* Details Section */}
          <div className="flex flex-1 flex-col justify-center gap-0.5">
            <Link
              href={`/shop/${slug}`}
              className="text-sm font-bold leading-tight text-zinc-900 transition-colors hover:text-zinc-600 md:text-base"
            >
              {title}
            </Link>
            <p className="text-xs font-medium text-zinc-500">
              {color} / {size}
            </p>

            {/* Logic Variant 1: Sale Price Display */}
            <div className="mt-1 flex items-center gap-2">
              <span
                className={cn(
                  "text-sm font-black",
                  isSale ? "text-rose-600" : "text-zinc-900",
                )}
              >
                Rs {currentPrice.toLocaleString()}.00
              </span>

              {isSale && (
                <span className="text-xs text-zinc-400 line-through decoration-zinc-400">
                  {price.toLocaleString()}.00
                </span>
              )}

              {isOutOfStock && (
                <Badge
                  variant="destructive"
                  className="h-5 rounded-full px-2 text-[9px] font-bold uppercase tracking-wider"
                >
                  Stock Out
                </Badge>
              )}
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-3">
            {/* Quantity Controller */}
            <div className="flex items-center rounded-2xl border border-zinc-200 p-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-xl hover:bg-zinc-100 disabled:opacity-30"
                onClick={() => removeQty(variantId)}
                disabled={disableQtyBtn || qty <= 1}
              >
                <Minus className="h-3 w-3" />
              </Button>

              <span className="w-8 text-center text-sm font-black text-zinc-900">
                {qty}
              </span>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-xl hover:bg-zinc-100 disabled:opacity-30"
                onClick={() => addQty(variantId)}
                disabled={disableQtyBtn || qty >= stock}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>

            {/* Desktop/Mobile Remove Button */}
            <div className="justify-end">
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-full border-zinc-100 text-zinc-400 hover:border-zinc-900 hover:bg-zinc-900 hover:text-white "
                onClick={() => removeItem(variantId)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Logic Variant 2: Multi-quantity Subtotal Banner */}
      {hasMultipleQty && (
        <div className="flex items-center justify-between border-t border-zinc-50 bg-zinc-50/50 px-6 py-3">
          <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-900">
            {title} <span className="text-zinc-400 mx-1">x</span> {qty}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-zinc-400">:</span>
            <span className="text-sm font-black text-zinc-900">
              RS {totalPrice.toLocaleString()}.00
            </span>
          </div>
        </div>
      )}

      {/* Logic Variant 3: Single quantity item remains minimal (no footer banner) */}
    </div>
  );
};

export default CartItem;
