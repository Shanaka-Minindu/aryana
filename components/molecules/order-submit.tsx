"use client";

import React, { useState, useMemo } from "react";
import { CartItemsServerRes } from "@/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";

interface OrderSubmitProps {
  shippingCost: number;
  items: CartItemsServerRes[];
  placeOrder: (orderPrice: number) => void;
  active : boolean
  isPending?: boolean;
}

const OrderSubmit = ({ items, placeOrder, shippingCost,active=false }: OrderSubmitProps) => {
  const [agreed, setAgreed] = useState(false);

  // Calculate Subtotal for all items
  const subtotal = useMemo(() => {
    return items.reduce((acc, item) => {
      const price = item.isSale && item.salePrice ? item.salePrice : item.price;
      return acc + price * item.qty;
    }, 0);
  }, [items]);

  const totalFullPrice = subtotal + shippingCost;

  return (
    <div className="w-full space-y-6">
      <h2 className="text-xl font-bold text-zinc-900 tracking-tight">
        Your Order
      </h2>

      {/* Order Summary Box */}
      <div className="w-full bg-white border border-zinc-100 rounded-xl p-6 md:p-8 shadow-sm">
        <div className="flex justify-between items-center border-b border-zinc-100 pb-4 mb-4">
          <span className="text-sm font-black uppercase tracking-wider text-zinc-900">Product</span>
          <span className="text-sm font-black uppercase tracking-wider text-zinc-900">Subtotal</span>
        </div>

        {/* Individual Items */}
        <div className="space-y-5 mb-6">
          {items.map((item) => {
            const currentPrice = item.isSale && item.salePrice ? item.salePrice : item.price;
            const itemSubtotal = currentPrice * item.qty;

            return (
              <div key={item.variantId} className="flex justify-between items-start text-sm">
                <p className="text-zinc-600 font-medium max-w-[70%]">
                  {item.title} - {item.size} <span className="text-zinc-400 mx-1"></span> x {item.qty}
                </p>
                <span className="text-zinc-900 font-bold">
                  Rs. {itemSubtotal.toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>

        {/* Subtotal & Shipping */}
        <div className="border-t border-zinc-100 py-6 space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="font-black text-zinc-900">Subtotal</span>
            <span className="font-black text-zinc-900">Rs. {subtotal.toLocaleString()}</span>
          </div>

          <div className="flex justify-between py-4 items-start text-sm">
            <div className="space-y-1 w-full">
              <div className="flex justify-between">
                <span className="font-black text-zinc-900">Shipping</span>
                {active ? (
                  <span className="font-black text-zinc-900">Rs. {shippingCost.toLocaleString()}</span>
                ) : (
                  <span className="text-[10px] text-rose-500 font-medium">
                    Submit Delivery Info to calculate
                  </span>
                )}
              </div>
              {active && (
                <p className="text-[11px] text-zinc-400 py-2 leading-tight">
                  Domestic Courier (All Island)<br />
                  Estimated Delivery: 1-3 Working Days Colombo & Suburbs. 3-5 Working Days Outstation.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Total */}
        <div className="border-t border-zinc-100 pt-4 flex justify-between items-center">
          <span className="text-lg font-black text-zinc-900">Total</span>
          <span className="text-xl font-black text-rose-600">
            Rs. {totalFullPrice.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Policies and Terms */}
      <div className="space-y-6 px-2">
        <p className="text-xs text-zinc-500 leading-relaxed">
          Your personal data will only be used to process your order, support your experience throughout this website, and for other purposes described in our{" "}
          <Link href="/privacy-policy" className="text-sky-600 hover:underline">
            Privacy Policy
          </Link>.
        </p>

        <div className="flex items-center space-x-3">
          <Checkbox 
            id="terms" 
            checked={agreed} 
            onCheckedChange={(checked) => setAgreed(checked as boolean)}
            className="rounded-md border-zinc-300 data-[state=checked]:bg-zinc-900"
          />
          <label htmlFor="terms" className="text-sm font-medium text-zinc-600 leading-none cursor-pointer">
            I agree to website{" "}
            <Link href="/terms" className="text-rose-300 hover:underline">
              Terms of Service.*
            </Link>
          </label>
        </div>

        {/* Place Order Button */}
        <Button
          onClick={() => placeOrder(totalFullPrice)}
          disabled={!active || !agreed || items.length === 0}
          className="w-full bg-[#fbb03b] hover:bg-[#e59e32]  text-black h-14 rounded-full font-black uppercase tracking-widest text-base transition-all active:scale-[0.98] disabled:opacity-50"
        >
          Place Order
        </Button>
        {!active&& <p className="text-xs text-rose-600 leading-relaxed">
          Fill the Delivery Information and Save. Then you can submit the order.
          
        </p>}
      </div>
    </div>
  );
};

export default OrderSubmit;