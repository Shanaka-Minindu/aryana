"use client";

import React, { useTransition } from "react";
import Image from "next/image";
import { Eye, EyeOff, Trash2, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  deleteCarousel,
  toggleCarouselStatus,
} from "@/lib/actions/admin/admin.carousel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { carouselData } from "@/types";



const CarouselItem = ({ id, img, isActive, name }: carouselData) => {
  const [isPending, startTransition] = useTransition();

  // 1. Handle Status Toggle (The Eye Icon)
  const onToggleStatus = () => {
    startTransition(async () => {
      const res = await toggleCarouselStatus(id);
      if (res.success) {
        toast.success(res.message!);
      } else {
        toast.error(res.message!);
      }
    });
  };

  // 2. Handle Deletion
  const onDelete = () => {
    if (!confirm("Are you sure you want to delete this carousel? This will remove all associated images.")) return;

    startTransition(async () => {
      const res = await deleteCarousel(id);
      if (res.success) {
        toast.success(res.message!);
      } else {
        toast.error(res.message!);
      }
    });
  };

  return (
    <div className={cn(
      "flex items-center gap-4 p-4 bg-white border rounded-xl shadow-sm transition-all",
      !isActive && "opacity-60 grayscale-[0.5]"
    )}>
      {/* Thumbnail Preview */}
      <div className="relative w-24 h-14 rounded-md overflow-hidden bg-zinc-100 shrink-0 border border-zinc-200">
        <Image
          src={img || "/placeholder-image.png"} // Fallback image if img is missing
          alt={name}
          fill
          className="object-cover"
        />
      </div>

      {/* Carousel Details */}
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-zinc-800 truncate text-sm md:text-base">
          {name}
        </h4>
        <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">
          Status: {isActive ? "Active" : "Inactive"}
        </p>
      </div>

      {/* Actions Section */}
      <div className="flex items-center gap-1">
        {/* Toggle Status Button */}
        <Button
          variant="ghost"
          size="lg"
          disabled={isPending}
          onClick={onToggleStatus}
          className={cn(
            "hover:bg-zinc-100",
            isActive ? "text-zinc-600" : "text-zinc-400"
          )}
        >
          {isPending ? (
            <Loader2 size={22} className="animate-spin" />
          ) : isActive ? (
            <Eye size={22} />
          ) : (
            <EyeOff size={22} />
          )}
        </Button>

        {/* Delete Button */}
        <Button
          variant="ghost"
          size="lg"
          disabled={isPending}
          onClick={onDelete}
          className="text-zinc-400 hover:text-red-600 hover:bg-red-50"
        >
          {isPending ? (
            <Loader2 size={22} className="animate-spin" />
          ) : (
            <Trash2 size={22} />
          )}
        </Button>
      </div>
    </div>
  );
};

export default CarouselItem;