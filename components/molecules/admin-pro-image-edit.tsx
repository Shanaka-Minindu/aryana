"use client";

import React, { useState, useTransition } from "react";
import Image from "next/image";
import { X, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

import { ProductWithRelations } from "@/types";
import { UploadButton } from "@/lib/uploadthing";
import { upsertProductImages } from "@/lib/actions/admin/admin.product.actions";
import { deleteUploadThingImage } from "@/lib/actions/admin/admin.category.actions";
import { cn } from "@/lib/utils";

// Shadcn UI Components
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

interface AdminProImageEditProps {
  product: ProductWithRelations;
}

interface ImageState {
  url: string;
  isPrimary: boolean;
}

const AdminProImageEdit = ({ product }: AdminProImageEditProps) => {
  const [isPending, startTransition] = useTransition();
  const [images, setImages] = useState<ImageState[]>(
    product.images.map((img) => ({
      url: img.url,
      isPrimary: img.isPrimary,
    }))
  );

  // 1. Unified Sync with Toast Promise
  const syncWithServer = (currentImages: ImageState[], loadingMsg: string) => {
    const promise = new Promise(async (resolve, reject) => {
      startTransition(async () => {
        const res = await upsertProductImages({
          productId: product.id,
          images: currentImages,
        });
        if (res.success) resolve(res);
        else reject(res);
      });
    });

    toast.promise(promise, {
      loading: loadingMsg,
      success: "Gallery updated successfully",
      error: "Failed to sync changes",
    });
  };

  // 2. Handle Delete
  const handleDelete = async (urlToDelete: string) => {
    try {
      // Remove from UploadThing storage
      await deleteUploadThingImage(urlToDelete);

      const updatedImages = images.filter((img) => img.url !== urlToDelete);
      
      // Auto-set new primary if we just deleted the primary one
      if (updatedImages.length > 0 && !updatedImages.some(img => img.isPrimary)) {
        updatedImages[0].isPrimary = true;
      }

      setImages(updatedImages);
      syncWithServer(updatedImages, "Deleting image...");
    } catch (error) {
      toast.error("Cloud storage deletion failed");
    }
  };

  // 3. Handle Primary Change
  const handleSetPrimary = (url: string) => {
    if (images.find(img => img.url === url)?.isPrimary) return;

    const updatedImages = images.map((img) => ({
      ...img,
      isPrimary: img.url === url,
    }));
    setImages(updatedImages);
    syncWithServer(updatedImages, "Updating primary image...");
  };

  // 4. Handle New Uploads
  const handleUploadComplete = (res: { url: string }[]) => {
    const newImages = res.map((file, index) => ({
      url: file.url,
      isPrimary: images.length === 0 && index === 0,
    }));

    const updatedGallery = [...images, ...newImages];
    setImages(updatedGallery);
    syncWithServer(updatedGallery, "Saving new images...");
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 rounded-xl p-8 bg-zinc-50/50">
        <UploadButton
          endpoint="multiImageUploader"
          onClientUploadComplete={handleUploadComplete}
          onUploadError={(error: Error) => {
            toast.error(`Upload failed: ${error.message}`);
          }}
          appearance={{
            button: "bg-black text-white hover:bg-zinc-800 transition-colors px-6 py-2 rounded-md h-auto",
            allowedContent: "text-zinc-500 text-xs mt-2"
          }}
          content={{
            button({ ready }) {
              if (ready) return "Upload Images";
              return "Preparing...";
            },
            allowedContent: "Images up to 8MB, max 8"
          }}
        />
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {images.map((img) => (
          <div 
            key={img.url} 
            className={cn(
              "group relative aspect-square rounded-lg overflow-hidden border-2 transition-all",
              img.isPrimary ? "border-black ring-2 ring-zinc-100" : "border-zinc-200"
            )}
          >
            <Image
              src={img.url}
              alt="Product"
              fill
              className="object-cover"
            />

            {/* Primary Overlay / Set Primary Button */}
            <button 
              onClick={() => handleSetPrimary(img.url)}
              disabled={isPending}
              className={cn(
                "absolute inset-0 flex items-center justify-center transition-all",
                img.isPrimary ? "bg-black/5" : "bg-transparent hover:bg-black/10"
              )}
            >
              {img.isPrimary && (
                <div className="bg-white rounded-full p-1 shadow-sm">
                  <CheckCircle2 size={20} className="text-black" />
                </div>
              )}
            </button>

            {/* Delete Button with Shadcn AlertDialog */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  disabled={isPending}
                  className="absolute top-2 right-2 p-1.5 bg-white/90 text-red-600 rounded-md shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:bg-red-50 border border-zinc-100"
                >
                  <X size={14} />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Image?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently remove the image from this product and cloud storage.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => handleDelete(img.url)}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
            {img.isPrimary && (
              <span className="absolute bottom-2 left-2 bg-black text-[9px] text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                Primary
              </span>
            )}
          </div>
        ))}
      </div>

      {isPending && (
        <div className="flex items-center justify-center gap-2 text-sm text-zinc-500 font-medium">
          <Loader2 className="h-4 w-4 animate-spin" />
          Updating product gallery...
        </div>
      )}
    </div>
  );
};

export default AdminProImageEdit;