"use client";

import React, { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "react-hot-toast";
import { Loader2, CheckCircle2 } from "lucide-react";

import { createCarousel } from "@/lib/actions/admin/admin.carousel";
import { carouselSchema } from "@/lib/validators";

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
import { useCarouselStore } from "@/store/use-carousel-store";

interface CreateCarouselProps {
  carouselCounts: number[];
  
}

type CarouselFormValues = z.infer<typeof carouselSchema>;

const CreateCarousel = ({ carouselCounts }: CreateCarouselProps) => {
  const [isPending, startTransition] = useTransition();

  const {setCarouselId} = useCarouselStore();

  const form = useForm<CarouselFormValues>({
    resolver: zodResolver(carouselSchema),
    defaultValues: {
      name: "",
      position: undefined,
    },
  });

  // 1. Check if positions are exhausted
  const isLimitReached = carouselCounts.length === 0;

  const onSubmit = (values: CarouselFormValues) => {
    startTransition(async () => {
      const res = await createCarousel({
        name: values.name,
        position: values.position.toString(),
      });

      if (res.success && res.data) {
        toast.success(res.message || "Carousel skeleton created");
        setCarouselId(res.data.carouselId)
        
        form.reset();
      } else {
        if (res.fieldErrors) {
          Object.entries(res.fieldErrors).forEach(([key, messages]) => {
            form.setError(key as keyof CarouselFormValues, {
              type: "server",
              message: messages?.[0],
            });
          });
        }
        toast.error(res.message || "Failed to create carousel");
      }
    });
  };

  // 2. Render empty state message
  if (isLimitReached) {
    return (
      <div className="p-10 bg-zinc-50 rounded-xl border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center text-center space-y-4">
        <div className="bg-white p-3 rounded-full shadow-sm border border-zinc-100">
          <CheckCircle2 className="h-8 w-8 text-green-500" />
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-zinc-800 text-lg">All Slots Occupied</h3>
          <p className="text-zinc-500 text-sm max-w-[300px]">
            You have already created all available carousel sections. Delete an existing one to add a new slot.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white ">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-500 font-semibold uppercase text-xs">
                    Name:
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter carousel name"
                      disabled={isPending}
                      {...field}
                      className="h-11 bg-zinc-50/50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-500 font-semibold uppercase text-xs">
                    Position
                  </FormLabel>
                  <Select
                    disabled={isPending}
                    onValueChange={field.onChange}
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger className="h-11 bg-zinc-50/50">
                        <SelectValue placeholder="Select a position" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {carouselCounts.map((count) => (
                        <SelectItem key={count} value={count.toString()}>
                          Position {count}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button
              type="submit"
              disabled={isPending}
              className="bg-black text-white hover:bg-zinc-800 px-8 h-11 transition-all"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Next"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CreateCarousel;