"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { selectedProduct } from "@/types";

interface productProps {
  product: selectedProduct;
}

const Product = ({ product }: productProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const name = product.name;
  const price = product.price;
  const isActive = product.isActive;
  const isSale = product.isSale;
  const categorySlug = product.categorySlug;
  const salePrice = product.salePrice;
  const slug = product.slug;
  const images = product.images;
  const colors = product.colors;
  // Calculate Sale Percentage
  const salePercentage =
    isSale && salePrice ? Math.round(((price - salePrice) / price) * 100) : 0;

  // Handle image switching logic
  const displayImage =
    isHovered && images.length > 1 ? images[1].url : images[0].url;

  return (
    <Link href={`/shop/${categorySlug}/${slug}`} className="group">
      <Card className="border-none shadow-none bg-transparent overflow-hidden pt-0">
        <CardContent className="p-0 space-y-3">
          {/* Image Container */}
          <div
            className="relative aspect-[3/4] w-full bg-zinc-100 overflow-hidden"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <Image
              src={displayImage}
              alt={name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />

            {/* Status Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {!isActive && (
                <Badge
                  variant="destructive"
                  className="rounded-sm uppercase text-[10px] font-bold px-2 py-0.5"
                >
                  Sold Out
                </Badge>
              )}
              {isSale && isActive && (
                <Badge className="bg-red-600 hover:bg-red-700 rounded-sm uppercase text-[10px] font-bold px-2 py-0.5">
                  {salePercentage}% OFF
                </Badge>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-1 px-4">
            {/* Color Swatches */}
            <div className="flex gap-1.5 mb-2">
              {colors.map((color, index) => (
                <div
                  key={index}
                  className="w-4 h-4 rounded-sm border border-zinc-200"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>

            <h3 className="text-lg font-medium text-zinc-900 leading-tight">
              {name}
            </h3>

          

            <div className="flex items-center gap-2 py-1 ">
              {isSale && salePrice ? (
                <>
                  <span className="text-base font-bold text-red-600">
                    LKR {salePrice.toLocaleString()}
                  </span>
                  <span className="text-sm text-zinc-400 line-through">
                    LKR {price.toLocaleString()}
                  </span>
                </>
              ) : (
                <span className="text-base font-bold text-zinc-900">
                  LKR {price.toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default Product;
