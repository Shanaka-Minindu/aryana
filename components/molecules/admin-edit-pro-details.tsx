"use client";

import React, { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "react-hot-toast";

import { ProductWithRelations, categoryProduct } from "@/types";
import { upsertProduct } from "@/lib/actions/admin/admin.product.actions";
import { addProductSchema } from "@/lib/validators"; // Ensure this matches your project structure

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Switch } from "../ui/switch";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface AdminEditProDetailsProps {
  product: ProductWithRelations;
  categoryData: categoryProduct[];
}

type ProductFormValues = z.input<typeof addProductSchema>;

const AdminEditProDetails = ({ product, categoryData }: AdminEditProDetailsProps) => {
  const [isPending, startTransition] = useTransition();

const form = useForm<ProductFormValues>({
    resolver: zodResolver(addProductSchema),
    defaultValues: {
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price.toString(),
      isSale: product.isSale, // Prisma booleans are strict, matching z.input
      salePrice: product.salePrice?.toString() || "",
      category: product.categoryId,
    },
  });

  // 1. Automatic Slug Generation Logic
  const watchName = form.watch("name");

  useEffect(() => {
    if (watchName) {
      const generatedSlug = watchName
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, "") // Remove special characters
        .replace(/\s+/g, "-")       // Replace spaces with "-"
        .replace(/-+/g, "-");       // Remove double hyphens
      
      form.setValue("slug", generatedSlug, { shouldValidate: true });
    }
  }, [watchName, form]);

const onSubmit = async (values: ProductFormValues) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("slug", values.slug);
      formData.append("description", values.description);
      formData.append("price", values.price);
      // Values.isSale might be undefined in the type, so handle it safely
      formData.append("isSale", String(!!values.isSale));
      
      if (values.salePrice) {formData.append("salePrice", values.salePrice)}else{
        formData.append("salePrice","")
      }
      formData.append("category", values.category);

      const res = await upsertProduct(formData, product.id);

      if (res.success) {
        toast.success(res.message || "Updated successfully");
      } else {
        toast.error(res.message || "Something went wrong.");
      }
    });
  };

  const handleReset = () => {
    form.reset();
    toast.success("Form reset to original product details.");
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-600 font-semibold">Name:</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Product Name" className="bg-white" />
                  </FormControl>
                  <FormMessage className="text-xs font-medium text-red-500" /> {/* Validation Error */}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-600 font-semibold">Slug:</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="product-slug" className="bg-white" />
                  </FormControl>
                  <FormMessage className="text-xs font-medium text-red-500" /> {/* Validation Error */}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-600 font-semibold">Description:</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Enter product description..." 
                      className="min-h-[120px] bg-white" 
                    />
                  </FormControl>
                  <FormMessage className="text-xs font-medium text-red-500" /> {/* Validation Error */}
                </FormItem>
              )}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-600 font-semibold">Price:</FormLabel>
                  <FormControl>
                    <Input {...field} type="text" placeholder="Regular Price" className="bg-white" />
                  </FormControl>
                  <FormMessage className="text-xs font-medium text-red-500" /> {/* Validation Error */}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isSale"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-white">
                  <FormLabel className="text-zinc-600 font-semibold">Is Sale:</FormLabel>
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
                <FormItem className={!form.watch("isSale") ? "opacity-50" : ""}>
                  <FormLabel className="text-zinc-600 font-semibold">Sale Price:</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      disabled={!form.watch("isSale")} 
                      placeholder="Discounted Price" 
                      className="bg-white"
                    />
                  </FormControl>
                  <FormMessage className="text-xs font-medium text-red-500" /> {/* Validation Error */}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-600 font-semibold">Category:</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categoryData?.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs font-medium text-red-500" /> {/* Validation Error */}
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100">
          <Button 
            type="submit" 
            disabled={isPending}
            className="bg-black text-white hover:bg-zinc-800 min-w-[100px]"
          >
            {isPending ? "Updating..." : "Update"}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleReset}
            className="border-black text-black hover:bg-zinc-50 min-w-[100px]"
          >
            Reset
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AdminEditProDetails;