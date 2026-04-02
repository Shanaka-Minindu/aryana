/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useTransition, useMemo } from "react";
import { ShoppingBag, ShoppingCart as CartIcon, X } from "lucide-react";
import Link from "next/link";
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
import toast from "react-hot-toast";

import { Session } from "next-auth";
import { CartItemsServerRes } from "@/types";

// Import Server Actions
import {
  getCartItemsAuthorized,
  getCartItemsNonAuthorized,
  updateQty,
  removeCartItem,
} from "@/lib/actions/cart.actions";
import CartItem from "../molecules/cart-item";
import { useCartStore } from "@/store/use-cart-store";

interface ShoppingCartProps {
  session?: Session;
}

const ShoppingCart = ({ session }: ShoppingCartProps) => {
  const pathname = usePathname();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<CartItemsServerRes[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const { isOpen, onClose, onOpen, refreshKey, setCartCount } = useCartStore();

  const userId = session?.user.id;
  const cartId = session?.user.cartId;

  const fetchCart = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      let currentItems: CartItemsServerRes[] = [];
      if (userId && cartId) {
        const res = await getCartItemsAuthorized({
          userId,
          cartIdFromClient: cartId,
        });
        if (res.success) currentItems = res.data || [];
      } else {
        const localData = localStorage.getItem("guest-cart");
        const guestCartItems = localData ? JSON.parse(localData) : [];
        const res = await getCartItemsNonAuthorized({
          cartItems: guestCartItems,
        });
        if (res.success) currentItems = res.data || [];
      }
      setItems(currentItems);
      setCartCount(currentItems.length);
    } catch (error) {
      toast.error("Failed to load cart");
    } finally {
      setLoading(false);
      setProcessingId(null);
    }
  };

  useEffect(() => {
    fetchCart(true);
    const handleSync = () => {
      fetchCart();
      if (pathname !== "/cart") onOpen();
    };
    window.addEventListener("storage", handleSync);
    return () => window.removeEventListener("storage", handleSync);
  }, [userId, cartId, pathname, refreshKey]);

  const totalPrice = useMemo(() => {
    return items.reduce((acc, item) => {
      const price = item.isSale && item.salePrice ? item.salePrice : item.price;
      return acc + price * item.qty;
    }, 0);
  }, [items]);

  const handleRemove = async (variantId: string) => {
    setProcessingId(variantId);
    if (userId && cartId) {
      startTransition(async () => {
        const res = await removeCartItem({ userId, cartId, variantId });
        if (res.success) fetchCart();
      });
    } else {
      const localData = JSON.parse(localStorage.getItem("guest-cart") || "[]");
      const filtered = localData.filter((i: any) => i.variantId !== variantId);
      localStorage.setItem("guest-cart", JSON.stringify(filtered));
      fetchCart();
    }
  };

  const handleUpdateQty = async (variantId: string, newQty: number) => {
    const item = items.find((i) => i.variantId === variantId);
    if (!item || newQty < 1 || newQty > item.stock) return;
    setProcessingId(variantId);
    if (userId && cartId) {
      startTransition(async () => {
        const res = await updateQty({
          userId,
          cartId,
          variantId,
          newQuantity: newQty,
        });
        if (res.success) fetchCart();
        else setProcessingId(null);
      });
    } else {
      const localData = JSON.parse(localStorage.getItem("guest-cart") || "[]");
      const updated = localData.map((i: any) =>
        i.variantId === variantId ? { ...i, quantity: newQty } : i,
      );
      localStorage.setItem("guest-cart", JSON.stringify(updated));
      fetchCart();
    }
  };

  if (pathname === "/cart") return null;

  return (
    <Drawer
      direction="right"
      open={isOpen}
      onOpenChange={(val) => !val && onClose()}
    >
      <DrawerContent
        className="fixed inset-y-0 right-0 z-50 flex h-full flex-col border-none bg-transparent outline-none w-full sm:w-[550px]"
        style={{ maxWidth: "550px" ,minWidth:"360px"}}
      >
        <DrawerHeader className="flex flex-row justify-between border-b px-6 py-6">
          <DrawerTitle className="text-xl font-medium uppercase pt-2 pl-3 tracking-tight">
            Your Cart
          </DrawerTitle>
          <DrawerClose asChild >
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
              <Button
                variant="link"
                onClick={onClose}
                className="underline text-zinc-500"
              >
                Continue shopping
              </Button>
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

            <Button
              className="w-full bg-black mb-4 hover:bg-zinc-800 text-white rounded-full py-8 text-sm font-bold uppercase tracking-widest flex items-center gap-3 shadow-xl active:scale-[0.98] transition-all"
              onClick={() => console.log(items.map((i) => i.variantId + i.qty))}
            >
              <ShoppingBag size={20} />
              Checkout Now
            </Button>

           
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  );
};

const CartSkeletonList = () => (
  <div className="space-y-6">
    {[1, 2, 3].map((i) => (
      <div key={i} className="flex gap-4 items-center rounded-3xl border p-4">
        <Skeleton className="h-24 w-24 rounded-xl" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-8 w-32 rounded-lg" />
        </div>
      </div>
    ))}
  </div>
);

export default ShoppingCart;
