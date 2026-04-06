"use client";

import React, { useState, useTransition, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import { UploadCloud, X, Loader2 } from "lucide-react";

import { newCategoryValidator } from "@/lib/validators";
import { createCategory, deleteUploadThingImage } from "@/lib/actions/admin/admin.category.actions";
import { getCategoryProps } from "@/types";

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
import { UploadButton } from "@/lib/uploadthing";

interface props {
  categories?: getCategoryProps[];
}

const NewCategoryCard = ({ categories = [] }: props) => {
  const [isPending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Ref to trigger the hidden UploadButton input
  const uploadBtnRef = useRef<HTMLDivElement>(null);

  const form = useForm<z.infer<typeof newCategoryValidator>>({
    resolver: zodResolver(newCategoryValidator),
    defaultValues: {
      name: "",
      slug: "",
      parentId: "",
      image: "",
    },
  });

  const selectedParentId = form.watch("parentId");
  const isMainCategory = !selectedParentId || selectedParentId === "MAIN";

  useEffect(() => {
    const categoryName = form.watch("name");
    if (categoryName) {
      const generatedSlug = categoryName
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      form.setValue("slug", generatedSlug, { shouldValidate: true });
    }
  }, [form.watch("name")]);

  const mainCategoryCount = categories.filter((c) => !c.parentId).length;

  // Function to handle clicking the preview area
  const handlePreviewClick = () => {
    if (isMainCategory || uploading) return;
    // Find the input element inside UploadThing component and click it
    const input = uploadBtnRef.current?.querySelector('input[type="file"]') as HTMLInputElement;
    input?.click();
  };

  // Helper to remove image from UI and Storage
  const handleImageRemove = async (e?: React.MouseEvent) => {
    e?.stopPropagation(); // Prevent triggering the upload click
    const currentImageUrl = form.getValues("image");
    
    if (currentImageUrl) {
      const res = await deleteUploadThingImage(currentImageUrl);
      if (res.success) {
        setImagePreview(null);
        form.setValue("image", "");
      }
    }
  };

const onSubmit = async (values: z.infer<typeof newCategoryValidator>) => {
  startTransition(async () => {
    // Change null to undefined to satisfy the Server Action type
    const parentIdValue = (values.parentId === "MAIN" || !values.parentId) 
      ? undefined 
      : values.parentId;

    const res = await createCategory({
      name: values.name,
      slug: values.slug,
      // Apply the same logic to image if your action expects string | undefined
      imageUrl: values.image || undefined, 
      parentId: parentIdValue, 
    });

    if (res.success) {
      toast.success("Category created!");
      form.reset();
      setImagePreview(null);
    } else {
      toast.error(res.message || "Something went wrong");
    }
  });
};

  const Clear =()=>{
    handleImageRemove();
    form.reset()
  }

  return (
    <div className="w-full bg-white border border-zinc-100 rounded-xl p-8 shadow-sm max-w-4xl">
      <h2 className="text-xl font-bold text-zinc-900 mb-8 pb-4 border-b border-zinc-50">
        New Category
      </h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Left Side: Fields */}
            <div className="space-y-6">
              {/* Name, Slug, and Parent Category FormFields stay the same as your original code... */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-500 font-bold">Name:</FormLabel>
                    <FormControl><Input {...field} placeholder="e.g. T-Shirts" className="rounded-lg border-zinc-200 h-12" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-500 font-bold">Slug:</FormLabel>
                    <FormControl><Input {...field} className="rounded-lg border-zinc-200 h-12" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="parentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-500 font-bold">Parent Category:</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger className="rounded-lg border-zinc-200 h-12">
                          <SelectValue placeholder="Select Parent Category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="MAIN" disabled={mainCategoryCount >= 4} className="font-bold text-sky-600 bg-sky-50/50">
                          Main Category {mainCategoryCount >= 4 && "(Limit Reached)"}
                        </SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id} className={!cat.parentId ? "bg-zinc-50 font-semibold" : ""}>
                            {cat.name} {!cat.parentId && "•"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Right Side: Image Upload */}
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-100 rounded-xl p-6 bg-zinc-50/30">
              <div 
                onClick={handlePreviewClick}
                className={`relative w-full aspect-square max-w-[240px] bg-white rounded-lg border border-zinc-200 flex items-center justify-center overflow-hidden mb-4 shadow-inner transition-all ${!isMainCategory && !uploading ? 'cursor-pointer hover:border-zinc-400' : 'cursor-not-allowed'}`}
              >
                {uploading && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80">
                    <Loader2 className="w-10 h-10 text-gray-600 animate-spin" />
                    <p className="text-xs font-bold mt-2 text-gray-600">Uploading...</p>
                  </div>
                )}

                {imagePreview ? (
                  <>
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={handleImageRemove}
                      className="absolute top-2 right-2 z-20 p-1 bg-white rounded-full shadow-md hover:text-rose-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <div className="text-center p-4">
                    <UploadCloud className={`w-10 h-10 mx-auto mb-2 ${isMainCategory ? 'text-zinc-200' : 'text-zinc-300'}`} />
                    <p className="text-xs text-zinc-400">Image size must be less than 4MB</p>
                  </div>
                )}
              </div>

              <div ref={uploadBtnRef} className={isMainCategory ? "opacity-50 pointer-events-none" : ""}>
                <UploadButton
                  endpoint="singleImageUploader"
                  onUploadBegin={async () => {
                    // Remove old image from storage before starting new upload if it exists
                    const oldUrl = form.getValues("image");
                    if (oldUrl) await deleteUploadThingImage(oldUrl);
                    setUploading(true);
                  }}
                  onClientUploadComplete={(res) => {
                    setUploading(false);
                    const url = res?.[0].url;
                    if (url) {
                      setImagePreview(url);
                      form.setValue("image", url, { shouldValidate: true });
                      toast.success("Upload complete");
                    }
                  }}
                  onUploadError={(error: Error) => {
                    setUploading(false);
                    toast.error(`Upload failed: ${error.message}`);
                  }}
                  content={{
                    button() {
                      if (uploading) return "Uploading...";
                      if (imagePreview) return "Update Image";
                      return "Select Image";
                    },
                  }}
                  appearance={{
                    button: "bg-black hover:bg-gray-400 text-white rounded-lg px-8 py-2 text-sm font-medium transition-all w-full",
                    allowedContent: "hidden", // Hide the "Image 4MB" text under button since we have it in preview
                  }}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-6">
            
            <Button
              type="submit"
              disabled={isPending || uploading}
              className="bg-black text-white px-12 py-6 rounded-lg font-semibold uppercase tracking-widest hover:bg-zinc-500 transition-all shadow-lg min-w-[160px]"
            >
              {isPending ? <Loader2 className="animate-spin mr-2" /> : null}
              {isPending ? "Saving..." : "Save"}
            </Button>
            <Button
              type="button"
              disabled={isPending || uploading}
              onClick={Clear}
              className="bg-black text-white px-12 py-6 rounded-lg font-semibold uppercase tracking-widest hover:bg-zinc-500 transition-all shadow-lg min-w-[160px]"
            >
              {isPending ? <Loader2 className="animate-spin mr-2" /> : null}
              Clear
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default NewCategoryCard;