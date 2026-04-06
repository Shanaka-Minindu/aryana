/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { deliveryInfo } from "@/types";
import { addressInfoSchema } from "@/lib/validators";
import { Districts } from "@/lib/generated/prisma";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Import Select components
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import toast from "react-hot-toast";
import {
  createOrUpdateUserAddress,
  deleteAddress,
} from "@/lib/actions/user.actions";

interface UserAddressFormProps {
  data?: deliveryInfo;
  clientId: string;
  addAddressTrigger: () => void;
}

const UserAddressForm = ({ data, clientId, addAddressTrigger }: UserAddressFormProps) => {
  const [isPending, startTransition] = useTransition();
  const [isReadOnly, setIsReadOnly] = useState(!!data);

  const form = useForm<z.infer<typeof addressInfoSchema>>({
    resolver: zodResolver(addressInfoSchema),
    defaultValues: {
      fullName: data?.fullName || "",
      phone: data?.phone || "",
      country: data?.country || "Sri lanka",
      district: data?.district || "",
      addressLine1: data?.addressLine1 || "",
      addressLine2: data?.addressLine2 || "",
      city: data?.city || "",
      postalCode: data?.postalCode || "",
    },
  });

  // Helper to format: KANDY -> Kandy, NUWARA_ELIYA -> Nuwara Eliya
  const formatDistrictName = (name: string) => {
    return name
      .toLowerCase()
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const onSubmit = async (values: z.infer<typeof addressInfoSchema>) => {
    startTransition(async () => {
      addAddressTrigger();
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        formData.append(key, value || "");
      });

      const res = await createOrUpdateUserAddress({ clientId, formData });

      if (res.success) {
        setIsReadOnly(true);
        toast.success(res.message || "Updated Successfully");
      } else {
        toast.error(res.message || "Please try again later");
        if (res.fieldErrors) {
          Object.entries(res.fieldErrors).forEach(([field, messages]) => {
            form.setError(field as any, { message: messages?.[0] });
          });
        }
      }
    });
  };

  const handleDelete = async () => {
    if (!data?.id) return;

    startTransition(async () => {
      const res = await deleteAddress(data.id!, clientId);
      if (res.success) {
        toast.success(res.message || "Deleted Successfully");
        window.location.reload();
      } else {
        toast.error(res.message || "Please try again later");
      }
    });
  };

  const inputClasses =
    "rounded-lg border-zinc-200 m-2 p-4 focus-visible:ring-zinc-900 h-10 disabled:opacity-100 disabled:bg-zinc-50 disabled:text-zinc-500 transition-all";

  return (
    <div className="w-full bg-white border border-zinc-100 rounded-[2rem] p-8 shadow-sm">
      <div className="flex items-center justify-between border-b border-zinc-100 pb-6 mb-8">
        <h2 className="text-xl font-black text-zinc-900 tracking-tight">
          Default Delivery Information
        </h2>

        {data && isReadOnly && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsReadOnly(false)}
              className="rounded-md w-25 h-10 font-bold px-6"
            >
              Update
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="rounded-md w-25 h-10 font-bold px-6">
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your delivery address.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="px-4 py-4">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="px-4 py-4 bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Full Name & Phone - Keep Existing */}
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel className="text-zinc-500 font-bold">Full Name:</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isReadOnly || isPending} className={inputClasses} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel className="text-zinc-500 font-bold">Phone Number:</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isReadOnly || isPending} className={inputClasses} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Country */}
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-500 font-bold">Country:</FormLabel>
                  <FormControl>
                    <Input {...field} disabled className={inputClasses} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* District - CHANGED TO SELECT */}
            <FormField
              control={form.control}
              name="district"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-500 font-bold">District:</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isReadOnly || isPending}
                  >
                    <FormControl>
                      <SelectTrigger  className={inputClasses}>
                        <SelectValue  placeholder="Select a district" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent >
                      {Object.values(Districts).map((district) => (
                        <SelectItem className="h-13"  key={district} value={district}>
                          {formatDistrictName(district)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Other Fields - Keep Existing */}
            <FormField
              control={form.control}
              name="addressLine1"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel className="text-zinc-500 font-bold">Address line 1:</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isReadOnly || isPending} className={inputClasses} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="addressLine2"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel className="text-zinc-500 font-bold">Address line 2 (optional):</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isReadOnly || isPending} className={inputClasses} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-500 font-bold">City:</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isReadOnly || isPending} className={inputClasses} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="postalCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-500 font-bold">Postal Code:</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isReadOnly || isPending} className={inputClasses} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {!isReadOnly && (
            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={isPending}
                className="bg-black text-white px-10 py-6 rounded-xl font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-lg active:scale-95"
              >
                {isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
};

export default UserAddressForm;