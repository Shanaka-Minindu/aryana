"use client";

import React, { useState } from "react";
import { UploadButton } from "@/lib/uploadthing";
import { upsertProductImages } from "@/lib/actions/admin/admin.product.actions";
import { toast } from "react-hot-toast";
import { X, CheckCircle2, UploadCloud } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { deleteUploadThingImage } from "@/lib/actions/admin/admin.category.actions";

interface AddProductImageProps {
  productId: string | null; // Allow null to handle the disabled state
  isDoneAdding:()=>void
  
}

interface ImageFile {
  url: string;
  isPrimary: boolean;
}

const AddProductImage = ({ productId,isDoneAdding }: AddProductImageProps) => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Handle Image Deletion
  const handleDelete = async (url: string) => {
    const res = await deleteUploadThingImage(url);
    if (res.success) {
      setImages((prev) => prev.filter((img) => img.url !== url));
      toast.success("Image removed");
    } else {
      toast.error("Failed to delete image");
    }
  };

  // 2. Handle Primary Selection
  const togglePrimary = (url: string) => {
    setImages((prev) =>
      prev.map((img) => ({
        ...img,
        isPrimary: img.url === url,
      }))
    );
  };

  // 3. Final Submission Logic
  const handleNext = async () => {
    if (!productId) return;
    
    const hasPrimary = images.some((img) => img.isPrimary);
    if (!hasPrimary) return toast.error("Please select a primary image.");

    setIsSubmitting(true);
    const res = await upsertProductImages({ productId, images });
    setIsSubmitting(false);

    if (res.success) {
        isDoneAdding();
      toast.success(res.message || "Images saved successfully");
    } else {
      toast.error(res.message || "Something went wrong!");
    }
  };

  // Disable "Next" if: missing ID, no images, or in-flight request
  const isNextDisabled = !productId || images.length === 0 || isSubmitting;

  return (
    <div className="space-y-8">
      {/* Styled Upload Area */}
      <div className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 rounded-xl bg-zinc-50/50 p-12 transition-colors hover:bg-zinc-100/50">
        <UploadCloud className="w-10 h-10 text-zinc-400 mb-4" />
        <UploadButton
          endpoint="multiImageUploader"
          content={{
            
            button({ ready }) {
              if (ready) return "Choose File(s)";
              
              return "Loading...";
            },
            allowedContent({ ready, fileTypes, isUploading }) {
              if (isUploading) return "Uploading...";
              if (ready) return `Images up to 8MB, max 8`;
              return "";
            },
          }}
          appearance={{
            button: "bg-transparent text-blue-600 font-semibold hover:text-blue-700 transition-all after:content-['or_drag_it_here.'] after:ml-1 after:text-zinc-600 after:font-normal",
            allowedContent: "text-zinc-400 text-md mt-2",
            container: "w-full focus-within:ring-0",
          }}
          onClientUploadComplete={(res) => {
            setIsSubmitting(false);
            const newImages = res.map((file) => ({
              url: file.url,
              isPrimary: false,
            }));
            setImages((prev) => [...prev, ...newImages]);
            toast.success("Upload complete");
          }}
          onUploadError={(error: Error) => {
            setIsSubmitting(false);
            toast.error(`Upload Error: ${error.message}`);
          }}
        />
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {images.map((img) => (
            <div
              key={img.url}
              className={`group relative aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                img.isPrimary ? "border-blue-500 ring-2 ring-blue-500/20" : "border-zinc-100 hover:border-zinc-300"
              }`}
              onClick={() => togglePrimary(img.url)}
            >
              <Image
                src={img.url}
                alt="Product Preview"
                fill
                className="object-cover"
              />

              {/* Delete Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(img.url);
                }}
                className="absolute top-2 right-2 bg-white shadow-sm hover:bg-red-500 hover:text-white rounded-full p-1.5 transition-all opacity-0 group-hover:opacity-100"
              >
                <X size={14} strokeWidth={3} />
              </button>

              {/* Primary Checkmark */}
              {img.isPrimary && (
                <div className="absolute bottom-2 left-2 text-blue-600 bg-white rounded-full shadow-sm">
                  <CheckCircle2 size={20} fill="currentColor" className="text-white fill-blue-600" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Action Footer */}
      <div className="flex justify-end pt-6 border-t border-zinc-100">
        <Button
          onClick={handleNext}
          disabled={isNextDisabled}
          className={`px-12 py-6 rounded-lg font-bold transition-all ${
            isNextDisabled 
              ? "bg-zinc-200 text-zinc-400 cursor-not-allowed" 
              : "bg-black text-white hover:bg-zinc-800 active:scale-95"
          }`}
        >
          {isSubmitting ? "Saving..." : "Next"}
        </Button>
      </div>
    </div>
  );
};

export default AddProductImage;