"use client";

import React, { useState, useTransition, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Trash2, Plus, Power, Save, RotateCcw, Pipette } from "lucide-react";
import { toast } from "react-hot-toast";

import { ProductWithRelations } from "@/types";
import { addVariantSchema } from "@/lib/validators";
import {
  upsertProductVariants,
  toggleProductStatus,
} from "@/lib/actions/admin/admin.product.actions";
import { cn } from "@/lib/utils";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";

interface AdminProVariantEditProps {
  product: ProductWithRelations;
}

type VariantState = z.infer<typeof addVariantSchema>;

const AdminProVariantEdit = ({ product }: AdminProVariantEditProps) => {
  const [isPending, startTransition] = useTransition();

  // Local state for UI modifications before saving
  const [localVariants, setLocalVariants] = useState<VariantState[]>(
    product.variants.map((v) => ({
      size: v.size,
      color: v.color,
      stock: v.stock.toString(),
    })),
  );

  // 1. Calculate stock from DATABASE (product.variants) to control Activation button
  const databaseStock = useMemo(() => {
    return product.variants.reduce((acc, curr) => acc + curr.stock, 0);
  }, [product.variants]);

  // 2. Calculate stock from LOCAL state for the display badge
  const localTotalStock = useMemo(() => {
    return localVariants.reduce(
      (acc, curr) => acc + parseInt(curr.stock || "0"),
      0,
    );
  }, [localVariants]);

  const form = useForm<VariantState>({
    resolver: zodResolver(addVariantSchema),
    defaultValues: { size: "", color: "", stock: "" },
  });

  const onAddVariant = (values: VariantState) => {
    const exists = localVariants.some(
      (v) =>
        v.size.toLowerCase() === values.size.toLowerCase() &&
        v.color.toLowerCase() === values.color.toLowerCase(),
    );

    if (exists) return toast.error("This variant already exists.");

    setLocalVariants([...localVariants, values]);
    form.reset();
  };

  const handleSave = () => {
    startTransition(async () => {
      const res = await upsertProductVariants({
        productId: product.id,
        variants: localVariants,
      });
      if (res.success) toast.success(res.message || "Successfully Updated!");
      else toast.error(res.message || "Something went wrong!");
    });
  };

  const handleToggleStatus = () => {
    startTransition(async () => {
      const res = await toggleProductStatus(product.id, product.isActive);
      if (res.success) toast.success(res.message);
      else toast.error(res.message);
    });
  };

  return (
    <div className="space-y-8">
      {/* Status Management */}
      <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl border border-zinc-200">
        <div className="space-y-1">
          <h3 className="font-bold text-zinc-800">Product Availability</h3>
          <div className="flex items-center gap-2">
            <Badge variant={product.isActive ? "default" : "destructive"}>
              {product.isActive ? "Active" : "Inactive"}
            </Badge>
            <span className="text-xs text-zinc-500">
              Saved Stock: {databaseStock}
            </span>
          </div>
        </div>
        
        <Button
          variant="outline"
          onClick={handleToggleStatus}
          /** * Logic Change: 
           * Button is disabled if:
           * 1. Action is pending
           * 2. Product is currently Inactive AND the Database has 0 stock.
           */
          disabled={isPending || (!product.isActive && databaseStock === 0)}
          className={cn(
            "gap-2",
            product.isActive
              ? "text-red-600 border-red-200 hover:bg-red-50"
              : "text-green-600 border-green-200 hover:bg-green-50",
          )}
        >
          <Power size={16} />
          {product.isActive ? "Mark Out of Stock" : "Re-activate Item"}
        </Button>
      </div>

      {/* Add Variant Form */}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onAddVariant)}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end p-5 border rounded-xl bg-white shadow-sm"
        >
          <FormField
            control={form.control}
            name="size"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold uppercase text-zinc-500">Size</FormLabel>
                <FormControl><Input placeholder="XL, 42..." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold uppercase text-zinc-500">Color</FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                    <div className="relative flex-1">
                      <Input placeholder="#000000 or Red" {...field} className="pr-10" />
                      <div
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-zinc-200"
                        style={{ backgroundColor: field.value || "transparent" }}
                      />
                    </div>
                  </FormControl>
                  <div className="relative overflow-hidden w-10 h-10 rounded-md border border-zinc-200 shrink-0">
                    <Pipette size={14} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-zinc-400" />
                    <input
                      type="color"
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      value={field.value.startsWith("#") ? field.value : "#000000"}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold uppercase text-zinc-500">Stock</FormLabel>
                <FormControl><Input type="text" placeholder="0" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="bg-black text-white hover:bg-zinc-800 gap-2 h-10">
            <Plus size={18} /> Add Variant
          </Button>
        </form>
      </Form>

      {/* List Display */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg">Inventory Variants</h3>
            <span className="text-xs font-medium text-zinc-400 italic">
                Unsaved total stock: {localTotalStock}
            </span>
        </div>
        <div className="space-y-2">
          {localVariants.map((variant, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-white border rounded-xl shadow-sm">
              <div className="flex gap-12 flex-1 items-center">
                <p className="text-sm font-medium">
                  <span className="text-zinc-400 uppercase text-[10px] block">Size</span>
                  {variant.size}
                </p>
                <div className="text-sm font-medium">
                  <span className="text-zinc-400 uppercase text-[10px] block">Color</span>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full border border-zinc-100" style={{ backgroundColor: variant.color }} />
                    {variant.color}
                  </div>
                </div>
                <p className="text-sm font-medium">
                  <span className="text-zinc-400 uppercase text-[10px] block">Stock</span>
                  {variant.stock}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-zinc-400 hover:text-red-600 h-8 w-8"
                onClick={() => setLocalVariants(localVariants.filter((_, i) => i !== index))}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-end gap-3 pt-6 border-t">
        <Button
          variant="outline"
          disabled={isPending}
          onClick={() =>
            setLocalVariants(
              product.variants.map((v) => ({
                size: v.size,
                color: v.color,
                stock: v.stock.toString(),
              })),
            )
          }
        >
          <RotateCcw size={16} className="mr-2" /> Reset
        </Button>
        <Button
          className="bg-black text-white hover:bg-zinc-800 min-w-[140px]"
          disabled={isPending}
          onClick={handleSave}
        >
          {isPending ? "Saving..." : <><Save size={16} className="mr-2" /> Save Changes</>}
        </Button>
      </div>
    </div>
  );
};

export default AdminProVariantEdit;