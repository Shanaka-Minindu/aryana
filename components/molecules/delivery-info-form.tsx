"use client";

import React, { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Session } from "next-auth";
import { deliveryInfoSchema } from "@/lib/validators";
import {
  createOrUpdateUserAddress,
  getUserAddressData,
} from "@/lib/actions/user.actions";
import { Districts } from "@/lib/generated/prisma";
import toast from "react-hot-toast";
import { UserCircle } from "lucide-react";

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
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

interface DeliveryInfoFormProps {
  formSubmit: (formData: FormData) => void;
  session?: Session;
  update: () => void;
  isEditable:boolean;
}

const DeliveryInfoForm = ({
  formSubmit,
  session,
  update,
  isEditable
}: DeliveryInfoFormProps) => {
  const [isPending, startTransition] = useTransition();
  const [hasExistingAddress, setHasExistingAddress] = useState(false);
 
  const clientId = session?.user?.id;

  const form = useForm<z.infer<typeof deliveryInfoSchema>>({
    resolver: zodResolver(deliveryInfoSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      country: "Sri lanka",
      district: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      postalCode: "",
      optMessage: "",
      confirmAllCorrect: false,
      saveAsDefault: false,
    },
  });

  useEffect(() => {
    const checkAddress = async () => {
      if (clientId) {
        const res = await getUserAddressData(clientId);
        if (res.success && res.data) {
          setHasExistingAddress(true);
        }
      }
    };
    checkAddress();
  }, [clientId]);

  const handleFetchDefaultInfo = async () => {
    if (!clientId) return;

    startTransition(async () => {
      const res = await getUserAddressData(clientId);
      if (res.success && res.data) {
        form.reset({
          ...form.getValues(),
          fullName: res.data.fullName,
          phone: res.data.phone,
          addressLine1: res.data.addressLine1,
          addressLine2: res.data.addressLine2 || "",
          city: res.data.city,
          district: res.data.district,
          postalCode: res.data.postalCode,
          country: res.data.country,
        });
        toast.success("Address info loaded!");
      } else {
        toast.error(res.message || "Failed to load info");
      }
    });
  };

  const formatDistrictName = (name: string) => {
    return name
      .toLowerCase()
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const onSubmit = async (values: z.infer<typeof deliveryInfoSchema>) => {
    startTransition(async () => {
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        formData.append(key, String(value));
      });

      if (clientId && values.saveAsDefault) {
        const res = await createOrUpdateUserAddress({ clientId, formData });
        if (!res.success) {
          toast.error(res.message || "Failed to save default address");
          return;
        }
      }

      
      formSubmit(formData);
    });
  };

  const handleUpdateClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
  //  setIsEditable(true); // Reactivate fields
    update(); // Trigger the update function passed via props
  };

  const inputClasses =
    "rounded-sm border-zinc-200 focus-visible:ring-zinc-900 h-12 transition-all";

  return (
    <div className="w-full bg-white border border-zinc-100 rounded-xl p-8 shadow-sm">
      <div className="flex items-center justify-between border-b border-zinc-100 pb-6 mb-8">
        <h2 className="text-xl font-b text-zinc-900 tracking-tight">
          Delivery Information
        </h2>

        {clientId && hasExistingAddress && isEditable && (
          <Button
            type="button"
            variant="outline"
            onClick={handleFetchDefaultInfo}
            disabled={isPending}
            className="rounded-lg border-zinc-200 text-xs font-semibold p-4 hover:bg-zinc-50"
          >
            <UserCircle className="w-4 h-4 mr-2" />
            Use Default info
          </Button>
        )}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* fieldset disabled={!isEditable} automatically deactivates all nested inputs */}
          <fieldset
            key={isEditable ? "editable" : "locked"}
            disabled={!isEditable}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="text-zinc-500 font-bold">
                      Full Name:
                    </FormLabel>
                    <FormControl>
                      <Input {...field} className={inputClasses} />
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
                    <FormLabel className="text-zinc-500 font-bold">
                      Phone Number:
                    </FormLabel>
                    <FormControl>
                      <Input {...field} className={inputClasses} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-500 font-bold">
                      Country:
                    </FormLabel>
                    <FormControl>
                      <Input {...field} disabled className={inputClasses} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="district"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-500 font-bold">
                      District:
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className={inputClasses}>
                          <SelectValue placeholder="Select a district" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(Districts).map((d) => (
                          <SelectItem key={d} value={d}>
                            {formatDistrictName(d)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="addressLine1"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="text-zinc-500 font-bold">
                      Address line 1:
                    </FormLabel>
                    <FormControl>
                      <Input {...field} className={inputClasses} />
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
                    <FormLabel className="text-zinc-500 font-bold">
                      Address line 2 (optional):
                    </FormLabel>
                    <FormControl>
                      <Input {...field} className={inputClasses} />
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
                    <FormLabel className="text-zinc-500 font-bold">
                      City:
                    </FormLabel>
                    <FormControl>
                      <Input {...field} className={inputClasses} />
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
                    <FormLabel className="text-zinc-500 font-bold">
                      Postal Code:
                    </FormLabel>
                    <FormControl>
                      <Input {...field} className={inputClasses} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="optMessage"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="text-zinc-500 font-bold">
                      Additional Notes (optional): 
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        className="rounded-sm border-zinc-200 min-h-[120px]"
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
                name="confirmAllCorrect"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-medium text-zinc-500">
                        I agree these all information are correct
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              {clientId && (
                <FormField
                  control={form.control}
                  name="saveAsDefault"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-medium text-zinc-500">
                          Save this delivery information as default
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              )}
            </div>
          </fieldset>

          <div className="flex justify-end pt-4">
            {isEditable ? (
              <Button
                type="submit"
                disabled={isPending}
                className="bg-black text-white px-10 py-6 rounded-xl font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-lg active:scale-95 min-w-[160px]"
              >
                {isPending ? "Processing..." : "Save"}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleUpdateClick}
                className="bg-black text-white px-10 py-6 rounded-xl font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-lg active:scale-95 min-w-[160px]"
              >
                Update
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
};

export default DeliveryInfoForm;
