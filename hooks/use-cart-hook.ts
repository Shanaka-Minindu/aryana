/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  getCartItemsAuthorized,
  getCartItemsNonAuthorized,
  removeCartItem,
  updateQty,
} from "@/lib/actions/cart.actions";
import { useCartStore } from "@/store/use-cart-store";
import { CartItemsServerRes } from "@/types";
import { Session } from "next-auth";

import { useMemo, useState, useTransition } from "react";
import toast from "react-hot-toast";

export const useCartHook = (session?: Session) => {
  const userId = session?.user.id;
  const cartId = session?.user.cartId;

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<CartItemsServerRes[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const { setCartCount } = useCartStore();

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
  return {
    items,
    loading,
    processingId,
    fetchCart,
    totalPrice,
    handleRemove,
    handleUpdateQty,
    isPending,
  };
};
