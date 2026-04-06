"use client";

import DeliveryInfoForm from "@/components/molecules/delivery-info-form";
import OrderSubmit from "@/components/molecules/order-submit";
import OrderPageCart from "@/components/organisms/order-page-cart";
import { useCartHook } from "@/hooks/use-cart-hook";
// Assuming these are your paths
import toast from "react-hot-toast";

import { Session } from "next-auth";
import React, { useEffect, useState, useTransition } from "react";
import { getShippingCost, placePendingOrder } from "@/lib/actions/order.action";

interface OrderClientPros {
  session?: Session;
}

const OrderClient = ({ session }: OrderClientPros) => {
  const [isPendingOrder, startOrderTransition] = useTransition();
  const [placeOrderActive, setPlaceOrderActive] = useState(false);
  const [shippingCost, setShippingCost] = useState<number | null>(null);
  const [savedFormData, setSavedFormData] = useState<FormData | null>(null);
  const [isEditable, setIsEditable] = useState(true); // New state to control input activity
  const {
    fetchCart,
    handleRemove,
    handleUpdateQty,
    isPending,
    items,
    loading,
    processingId,
  } = useCartHook(session);

  const clientId = session?.user.id;

  useEffect(() => {
    fetchCart(true);
  }, []);

  const formSubmit = async (formData: FormData) => {
    const district = formData.get("district") as string;

    if (!district) {
      toast.error("Please select a district to calculate shipping.");
      return;
    }

    try {
      const res = await getShippingCost(district);
      if (res.success && res.data) {
        setShippingCost(res.data.price);
        setSavedFormData(formData); // Save the form data for the final order
        setPlaceOrderActive(true);
        toast.success("Shipping cost updated!");
        setIsEditable(false);
      } else {
        toast.error(res.message || "Failed to get shipping cost.");
      }
    } catch (error) {
      toast.error("Something went wrong calculating shipping.");
    }
  };

  const placeOrder = async (finalPrice: number) => {
    if (!savedFormData || items.length === 0) return;

    startOrderTransition(async () => {
      const res = await placePendingOrder({
        orderItems: items,
        clientId: clientId,
        formData: savedFormData,
      });

      if (res.success) {
        // According to your requirements, just show the alert for now
        fetchCart(true);
        alert(
          `Order Placed Successfully! \nOrder id : ${res.data?.orderId}\nStatus: PENDING\nThank you for your order.`,
        );
        // You might want to redirect to a success page or clear local cart state here
      } else {
        toast.error(res.message || "Failed to place order.");
      }
    });
  };

  return (
    <div className="w-full p-4 md:p-10">
      <div className="max-w-4xl mx-auto mb-10">
        <OrderPageCart
          items={items}
          loading={loading}
          processingId={processingId}
          handleRemove={handleRemove}
          handleUpdateQty={handleUpdateQty}
          isPending={isPending}
        />
      </div>
      <div className="flex flex-col lg:flex-row gap-10 mx-auto max-w-7xl">
        <div className="lg:w-4/6">
          <DeliveryInfoForm
            isEditable={isEditable}
            session={session}
            formSubmit={formSubmit}
            update={() => {
              setPlaceOrderActive(false);
              setShippingCost(null);
              setIsEditable(true);
            }}
          />
        </div>
        <div className="lg:w-2/6 pt-5">
          <OrderSubmit
            items={items}
            placeOrder={placeOrder}
            shippingCost={shippingCost ?? 0} // Default to 0 if null
            active={placeOrderActive}
            isPending={isPendingOrder}
          />
        </div>
      </div>
    </div>
  );
};

export default OrderClient;
