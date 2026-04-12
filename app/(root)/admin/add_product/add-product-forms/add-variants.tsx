"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { upsertProductVariants } from "@/lib/actions/admin/admin.product.actions";
import { addVariantSchema } from "@/lib/validators";



interface Props {
  productId: string;
  isDoneAdding:()=>void
}

const AddVariants = ({ productId ,isDoneAdding}: Props) => {
  type variantInput = z.input<typeof addVariantSchema>
  const [variants, setVariants] = useState<variantInput[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 2. Initialize Form


  const form = useForm<variantInput>({
    resolver: zodResolver(addVariantSchema),
    defaultValues: {
      size: "",
      color: "#000000",
      stock: "",
    },
  });

  // 3. Add to local list
  const onAddVariant = (data: variantInput) => {
    // Check for duplicates in local state
    const isDuplicate = variants.some(
      (v) => v.size === data.size && v.color === data.color
    );

    if (isDuplicate) {
      return toast.error("This size and color combination already exists.");
    }

    setVariants((prev) => [...prev, data]);
    form.reset({ size: "", color: "#000000", stock: "" });
    toast.success("Variant added to list");
  };

  // 4. Delete from local list
  const removeVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  // 5. Save to Server
  const onSave = async () => {
    if (variants.length === 0) {
      return toast.error("Please add at least one variant before saving.");
    }

    try {
      setIsSubmitting(true);
      const res = await upsertProductVariants({ productId, variants });
      
      if (res.success) {
        isDoneAdding();
        form.reset();
        toast.success(res.message|| "Variants Added successfully");
        setVariants([]); // Clear list on success
      } else {
        toast.error(res.message ||"Something went wrong please try again");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <Form {...form}>
        <form 
          onSubmit={form.handleSubmit(onAddVariant)} 
          className="flex flex-wrap items-end gap-4 p-6 border rounded-xl bg-zinc-50/30 shadow-sm"
        >
          <FormField
            control={form.control}
            name="size"
            render={({ field }) => (
              <FormItem className="flex-1 min-w-[120px]">
                <FormLabel>Size</FormLabel>
                <FormControl>
                  <Input placeholder="XL, 42, etc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem className="flex-1 min-w-[120px]">
                <FormLabel>Color</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-2">
                    <Input type="color" className="w-12 p-1 h-10 cursor-pointer" {...field} />
                    <Input placeholder="#000000" {...field} className="font-mono" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem className="flex-1 min-w-[120px]">
                <FormLabel>Stock</FormLabel>
                <FormControl>
                  <Input placeholder="0"  {...field}  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="bg-black text-white hover:bg-zinc-800 px-8 h-10 font-bold">
            Add
          </Button>
        </form>
      </Form>

      {/* Variants List Section */}
      <div className="space-y-4">
        <h3 className="font-bold text-lg">Variants</h3>
        <div className="space-y-3">
          {variants.length === 0 ? (
            <p className="text-zinc-500 text-sm italic">No variants added yet.</p>
          ) : (
            variants.map((v, index) => (
              <div 
                key={`${v.size}-${v.color}`}
                className="flex items-center justify-between p-4 border rounded-xl bg-white shadow-sm transition-all hover:border-zinc-300"
              >
                <div className="flex flex-wrap items-center gap-8 text-sm text-zinc-600">
                  <p><span className="font-medium text-black">Size:</span> {v.size}</p>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-black">Color:</span>
                    <div 
                      className="w-8 h-4 rounded-full border border-zinc-200" 
                      style={{ backgroundColor: v.color }} 
                    />
                    <span className="font-mono text-xs">{v.color}</span>
                  </div>
                  <p><span className="font-medium text-black">Stock:</span> {v.stock}</p>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="h-8 w-[1px] bg-zinc-200" />
                  <button 
                    onClick={() => removeVariant(index)}
                    className="text-zinc-400 hover:text-red-500 transition-colors p-1"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer Save Button */}
      <div className="flex justify-end pt-6 border-t">
        <Button 
          onClick={onSave}
          disabled={isSubmitting || variants.length === 0}
          className="bg-black text-white hover:bg-zinc-800 px-12 py-6 rounded-lg font-bold"
        >
          {isSubmitting ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
};

export default AddVariants;