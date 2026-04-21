"use client";

import React, { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Trash2,
  Plus,
  CheckCircle2,
  Loader2,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { CarouselItem } from "@/lib/generated/prisma";
import { upsertCarouselItems } from "@/lib/actions/admin/admin.carousel";
import { addCarouselItemSchema } from "@/lib/validators";
import { UploadButton } from "@/lib/uploadthing";

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
import { deleteUploadThingImage } from "@/lib/actions/admin/admin.category.actions";
import { useCarouselStore } from "@/store/use-carousel-store";



type CarouselItemState = z.infer<typeof addCarouselItemSchema> & {
  id?: string;
  isActive?: boolean;
};

const AddCarouselItems = () => {
  const [isPending, startTransition] = useTransition();
  const [localItems, setLocalItems] = useState<CarouselItemState[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

const {carouselId,setCarouselId}= useCarouselStore()
const caroId=carouselId;
  
  const form = useForm<CarouselItemState>({
    resolver: zodResolver(addCarouselItemSchema),
    defaultValues: {
      heading: "",
      subHeading: "",
      buttonText: "",
      linkUrl: "",
      imageUrl: "",
      textPosition: "CENTER",
      position: "",
    },
  });

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const hasUnsavedImage = form.getValues("imageUrl");
      const hasQueuedItems = localItems.length > 0;
      
      if (hasUnsavedImage || hasQueuedItems) {
        e.preventDefault();
        e.returnValue = ""; 
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [form, localItems]);


  useEffect(() => {
    const abandonedImage = localStorage.getItem(`pending_upload_${caroId}`);
    
    if (abandonedImage) {
      const cleanupAbandoned = async () => {
        try {
          await deleteUploadThingImage(abandonedImage);
          localStorage.removeItem(`pending_upload_${caroId}`);
          console.log("Cleaned up orphaned image from previous session");
        } catch (err) {
          console.error("Failed to cleanup orphan", err);
        }
      };
      cleanupAbandoned();
    }
  }, [caroId]);


  // Update localStorage when image changes
  const currentImageUrl = form.watch("imageUrl");
  useEffect(() => {
    if (currentImageUrl) {
      localStorage.setItem(`pending_upload_${caroId}`, currentImageUrl);
    } else {
      localStorage.removeItem(`pending_upload_${caroId}`);
    }
  }, [currentImageUrl, caroId]);



  // Handle deleting image from UploadThing
const removeImage = async (url: string) => {
    setIsDeleting(true);
    try {
      const res = await deleteUploadThingImage(url);
      if (res.success) {
        form.setValue("imageUrl", "");
        localStorage.removeItem(`pending_upload_${caroId}`); // Clear tracking
        toast.success("Image removed");
      }
    } catch (error) {
      toast.error("Failed to delete image from server");
    } finally {
      setIsDeleting(false);
    }
  };

  const onAddItem = (values: CarouselItemState) => {
    const positionTaken = localItems.some((item) => item.position === values.position);
    if (positionTaken) return toast.error(`Position ${values.position} is already assigned locally.`);

    setLocalItems([...localItems, values]);
    form.reset({
      heading: "",
      subHeading: "",
      buttonText: "",
      linkUrl: "",
      imageUrl: "",
      textPosition: "CENTER",
      position: "",
    });
    toast.success("Item added to the list.");
  };

  // Remove queued item and delete its image
  const removeQueuedItem = async (index: number) => {
    const itemToRemove = localItems[index];
    if (itemToRemove.imageUrl) {
      setIsDeleting(true);
      await deleteUploadThingImage(itemToRemove.imageUrl);
      setIsDeleting(false);
    }
    setLocalItems(localItems.filter((_, i) => i !== index));
    toast.success("Item and image removed");
  };

  const handleDone = () => {
    if (localItems.length === 0) return toast.error("Please add at least one item.");

    startTransition(async () => {
      const formattedItems = localItems.map((item) => ({
        ...item,
        position: Number(item.position),
        id: item.id || "",
        isActive: item.isActive ?? true,
        carouselId: caroId,
        createdAt: new Date(),
      })) as CarouselItem[];

      const res = await upsertCarouselItems({ carouselId: caroId, items: formattedItems });
      if (res.success) {
        setLocalItems([]);
        setCarouselId("");
        toast.success(res.message!);}
      else toast.error(res.message!);
    });
  };

  return (
    <div className="space-y-10">
      <div className="p-6 bg-white rounded-xl border border-zinc-200 shadow-sm">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onAddItem)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {/* Heading & SubHeading Fields... */}
                <FormField control={form.control} name="heading" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase text-zinc-500">Heading</FormLabel>
                    <FormControl><Input placeholder="Main title" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="subHeading" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase text-zinc-500">Sub Heading</FormLabel>
                    <FormControl><Input placeholder="Smaller description" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                {/* Image Upload with X mark */}
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase text-zinc-500">Carousel Image</FormLabel>
                      <div className="flex flex-col items-center gap-4 p-4 border-2 border-dashed rounded-lg bg-zinc-50/50">
                        {field.value ? (
                          <div className="relative w-full aspect-video rounded-md overflow-hidden group">
                            <Image src={field.value} alt="Preview" fill className="object-cover" />
                            <button
                              type="button"
                              disabled={isDeleting}
                              onClick={() => removeImage(field.value)}
                              className="absolute top-2 left-2 p-1 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition-colors disabled:bg-zinc-400"
                            >
                              <X size={16} />
                            </button>
                            {isDeleting && (
                              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                <Loader2 className="animate-spin text-white" />
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center text-zinc-400 py-4">
                            <ImageIcon size={32} strokeWidth={1.5} />
                            <p className="text-[10px] mt-2 italic">Max 4MB</p>
                          </div>
                        )}
                        {!field.value && (
                          <UploadButton
                            endpoint="singleImageUploader"
                            onClientUploadComplete={(res) => {
                              field.onChange(res?.[0].url);
                              toast.success("Image uploaded");
                            }}
                            onUploadError={(error) => {
                              toast.error(`Upload failed: ${error.message}`);
                            }}
                          />
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Right Column (Button Text, Link, Position, etc.) */}
              <div className="space-y-4">
                {/* ... Other Fields ... */}
                <FormField control={form.control} name="buttonText" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase text-zinc-500">Button Text</FormLabel>
                    <FormControl><Input placeholder="Shop Now" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="linkUrl" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase text-zinc-500">To URL</FormLabel>
                    <FormControl><Input placeholder="https://..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="textPosition" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase text-zinc-500">Text Position</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Alignment" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="LEFT">Left</SelectItem>
                        <SelectItem value="CENTER">Center</SelectItem>
                        <SelectItem value="RIGHT">Right</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />
                {/* Updated Position Selector */}
<FormField
  control={form.control}
  name="position"
  render={({ field }) => {
    // 1. Get a list of positions already used in localItems
    const usedPositions = localItems.map((item) => item.position);
    
    // 2. Filter the available options (1-8)
    const availablePositions = ["1", "2", "3", "4", "5", "6", "7", "8"].filter(
      (pos) => !usedPositions.includes(pos)
    );

    return (
      <FormItem>
        <FormLabel className="text-xs font-bold uppercase text-zinc-500">
          Position ({availablePositions.length} available)
        </FormLabel>
        <Select onValueChange={field.onChange} value={field.value}>
          <FormControl>
            <SelectTrigger>
              <SelectValue placeholder="Select Order" />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {availablePositions.length > 0 ? (
              availablePositions.map((num) => (
                <SelectItem key={num} value={num}>
                  {num}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="none" disabled>
                All positions filled
              </SelectItem>
            )}
          </SelectContent>
        </Select>
        <FormMessage />
      </FormItem>
    );
  }}
/>
                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={isDeleting} className="bg-black text-white hover:bg-zinc-800 gap-2 h-11 px-8 shadow-md">
                    <Plus size={18} /> Add Item
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </Form>
      </div>

      {/* Added Items List with auto-delete image */}
      <div className="space-y-4">
        <h3 className="font-bold text-lg text-zinc-800">Queued Items ({localItems.length}/8)</h3>
        <div className="grid gap-4">
          {localItems.sort((a, b) => Number(a.position) - Number(b.position)).map((item, index) => (
            <div key={index} className="flex items-center gap-4 p-4 bg-white border rounded-xl shadow-sm group">
              <div className="relative w-24 aspect-video rounded-md overflow-hidden bg-zinc-100 shrink-0">
                <Image src={item.imageUrl} alt={item.heading || ""} fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-zinc-800 truncate">{item.heading}</h4>
                <div className="flex gap-2 mt-1">
                  <Badge className="text-[10px]">Pos: {item.position}</Badge>
                  <Badge className="text-[10px]">{item.textPosition}</Badge>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                disabled={isDeleting}
                className="text-zinc-400 hover:text-red-600 hover:bg-red-50"
                onClick={() => removeQueuedItem(index)}
              >
                {isDeleting ? <Loader2 className="animate-spin h-4 w-4" /> : <Trash2 size={18} />}
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end border-t pt-6">
        <Button onClick={handleDone} disabled={isPending || isDeleting || localItems.length === 0} className="bg-black text-white hover:bg-zinc-800 min-w-[160px] h-12 gap-2 shadow-lg">
          {isPending ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
          Done & Save
        </Button>
      </div>
    </div>
  );
};

export default AddCarouselItems;

const Badge = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <span className={`px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600 font-bold uppercase tracking-wider ${className}`}>
    {children}
  </span>
);