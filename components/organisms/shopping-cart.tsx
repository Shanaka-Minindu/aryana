"use client";

import React, { useEffect } from "react";
import { ShoppingBag, ShoppingCart as CartIcon, X } from "lucide-react";

import { usePathname } from "next/navigation";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { Session } from "next-auth";

import CartItem from "../molecules/cart-item";
import { useCartStore } from "@/store/use-cart-store";
import { useCartHook } from "@/hooks/use-cart-hook";
import CartSkeletonList from "../molecules/CartSkeletonList";
import { Router } from "next/router";
import Link from "next/link";

interface ShoppingCartProps {
  session?: Session;
}

const ShoppingCart = ({ session }: ShoppingCartProps) => {
  const pathname = usePathname();

  const { isOpen, onClose, onOpen, refreshKey } = useCartStore();

  const {
    fetchCart,
    handleRemove,
    handleUpdateQty,
    items,
    loading,
    processingId,
    totalPrice,
    isPending,
  } = useCartHook(session);

  useEffect(() => {
    fetchCart(true);
    const handleSync = () => {
      fetchCart();
      if (pathname !== "/cart") onOpen();
    };
    window.addEventListener("storage", handleSync);
    return () => window.removeEventListener("storage", handleSync);
  }, [pathname, refreshKey]);

  if (pathname === "/order") return null;

  return (
    <Drawer
      direction="right"
      open={isOpen}
      onOpenChange={(val) => !val && onClose()}
    >
      <DrawerContent
        className="fixed inset-y-0 right-0 z-50 flex h-full flex-col border-none bg-transparent outline-none w-full sm:w-[550px]"
        style={{ maxWidth: "550px", minWidth: "360px" }}
      >
        <DrawerHeader className="flex flex-row justify-between border-b px-6 py-6">
          <DrawerTitle className="text-xl font-medium uppercase pt-2 pl-3 tracking-tight">
            Your Cart
          </DrawerTitle>
          <DrawerClose asChild>
            <Button
              variant="ghost"
              size="lg"
              className="h-10 w-10 rounded-full"
            >
              <X className="h-6 w-6" />
            </Button>
          </DrawerClose>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {loading ? (
            <CartSkeletonList />
          ) : items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center space-y-4">
              <div className="relative opacity-20">
                <CartIcon size={100} strokeWidth={1} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[2px] bg-black rotate-45" />
              </div>
              <h2 className="text-xl font-bold">Your cart is empty</h2>
              <Link href={"/shop/shopAll"}>
              <Button
                variant="link"
                onClick={onClose}
                className="underline text-zinc-500"
              >
                Continue shopping
              </Button>
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.variantId} className="relative">
                {isPending && processingId === item.variantId && (
                  <div className="absolute inset-0 z-10 bg-white/40 backdrop-blur-[2px] flex items-center justify-center rounded-3xl">
                    <Skeleton className="h-full w-full rounded-3xl" />
                  </div>
                )}
                <CartItem
                  {...item}
                  disableQtyBtn={isPending && processingId === item.variantId}
                  addQty={(id) => handleUpdateQty(id, item.qty + 1)}
                  removeQty={(id) => handleUpdateQty(id, item.qty - 1)}
                  removeItem={handleRemove}
                />
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <DrawerFooter className="border-t bg-zinc-50 p-6 space-y-4">
            <div className="flex items-end justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-zinc-500">
                  Total Amount
                </p>
                <p className="text-xs text-zinc-400">
                  Shipping calculated at checkout
                </p>
              </div>
              <p className="text-2xl font-black text-zinc-900">
                Rs {totalPrice.toLocaleString()}.00
              </p>
            </div>

            <Link onClick={()=>onClose()} href={"/order"}>
              <Button  className="w-full bg-black mb-4 hover:bg-zinc-800 text-white rounded-full py-8 text-sm font-bold uppercase tracking-widest flex items-center gap-3 shadow-xl active:scale-[0.98] transition-all">
                <ShoppingBag size={20} />
                Checkout Now
              </Button>
            </Link>
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  );
};

export default ShoppingCart;
