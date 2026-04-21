"use client";

import React, { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

import { upsertDisplayItemSchema } from '@/lib/validators'; // Adjust path
import { upsertDisplayItem } from '@/lib/actions/admin/admin.displayItem.action';
import { useDisplayItemStore } from '@/store/display-item-store';
import { getCategoriesProps, positionDataProps } from '@/types';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AddItemsFormProps {
  categories: getCategoriesProps[];
  position: positionDataProps;
  
}

type FormValues = z.infer<typeof upsertDisplayItemSchema>;

const AddItemsForm = ({ categories, position, }: AddItemsFormProps) => {
  const [isPending, startTransition] = useTransition();
 // const setSavedItem = useDisplayItemStore((state) => state.setSavedItem);
 const {setSavedItem,setProductSelect,savedItem} = useDisplayItemStore();
  

  const form = useForm<FormValues>({
    resolver: zodResolver(upsertDisplayItemSchema),
    defaultValues: {
      name: "",
      position: undefined,
      categoryId: "",
    },
  });

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      // Note: Component expects position as number per schema, 
      // action expects string. We convert here.
      const res = await upsertDisplayItem({
        name: values.name,
        position: values.position.toString(),
        categoryId: values.categoryId,
        displayItemId : savedItem?.id
      });

      

      if (res.success && res.data) {

        const storeData ={
          id:res.data?.id ,
    name: res.data?.name,
    categoryId:values.categoryId,
        }

        setProductSelect(false)
        setSavedItem(storeData);
        toast.success(res.message!);
        form.reset();
      } else {
        toast.error(res.message || "Something went wrong");
      }
    });
  };

  return (
    <div className="p-6 bg-zinc-50/50 rounded-xl border border-zinc-200">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-500 font-semibold">Title:</FormLabel>
                  <FormControl>
                    <Input placeholder="Item name" {...field} className="bg-white" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category Field */}
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-500 font-semibold">Category:</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Position Field */}
            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-500 font-semibold">Position:</FormLabel>
                  <Select 
                    onValueChange={(val) => field.onChange(val)} 
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Order" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {position.availablePosition.map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={isPending}
              className="bg-black text-white hover:bg-zinc-800 px-10 h-12 rounded-lg font-bold"
            >
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Next
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AddItemsForm;