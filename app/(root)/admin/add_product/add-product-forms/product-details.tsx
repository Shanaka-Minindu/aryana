"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { categoryProduct } from "@/types";
import { addProductSchema } from "@/lib/validators"; 
import { upsertProduct } from "@/lib/actions/admin/admin.product.actions";
import { toast } from "react-hot-toast";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface ProductDetailsFormProps {
  categoryData: categoryProduct[];
  productId?: string;
  isDoneAdding:(productId:string)=>void
}

// 1. Define the Input type strictly from the schema
type ProductFormInput = z.input<typeof addProductSchema>;

const ProductDetailsForm = ({ categoryData, productId,isDoneAdding }: ProductDetailsFormProps) => {
  // 2. Pass the Input type to useForm to satisfy the Resolver
  const form = useForm<ProductFormInput>({
    resolver: zodResolver(addProductSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      price: "",
      isSale: false,
      salePrice: "",
      category: "",
    },
  });

  const productName = form.watch("name");
  const isSaleEnabled = form.watch("isSale");

  useEffect(() => {
    if (productName) {
      const generatedSlug = productName
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "");
      
      form.setValue("slug", generatedSlug, { shouldValidate: true });
    }
  }, [productName, form]);

  const onSubmit = async (values: ProductFormInput) => {
    const formData = new FormData();
    
    Object.entries(values).forEach(([key, value]) => {
      // Ensure we don't append "undefined" as a string to FormData
      if (value !== undefined) {
        formData.append(key, value.toString());
      }
    });

    const res = await upsertProduct(formData, productId);
    
    if (res.success) {
        form.reset();
        isDoneAdding(res.data!.productId)
      toast.success(res.message || "");
    } else {
      toast.error(res.message ||"");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium text-zinc-600">Name:</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter product name" {...field} className="bg-zinc-50/50" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium text-zinc-600">Slug:</FormLabel>
                  <FormControl>
                    <Input placeholder="product-url-slug" {...field} className="bg-zinc-50/50" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium text-zinc-600">Description:</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter detailed description..." 
                      className="min-h-[150px] bg-zinc-50/50 resize-none" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium text-zinc-600">Price:</FormLabel>
                  <FormControl>
                    <Input placeholder="0" {...field} className="bg-zinc-50/50" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isSale"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-zinc-50/30">
                  <FormLabel className="font-medium text-zinc-600">Is Sale:</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="salePrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={`font-medium ${!isSaleEnabled ? "text-zinc-300" : "text-zinc-600"}`}>
                    Sale Price:
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="0" 
                      {...field} 
                      disabled={!isSaleEnabled}
                      className={!isSaleEnabled ? "bg-zinc-100 opacity-50 cursor-not-allowed" : "bg-zinc-50/50"}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium text-zinc-600">Category:</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-zinc-50/50">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categoryData.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" className="bg-black text-white hover:bg-zinc-800 px-8 py-6 rounded-lg font-bold">
            Next
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProductDetailsForm;