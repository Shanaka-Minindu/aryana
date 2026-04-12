"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Edit3, Image as ImageIcon, Package, AlertTriangle } from "lucide-react";
import { toast } from "react-hot-toast";

import { categoryProduct, ProductWithRelations } from "@/types";
import { deleteProduct } from "@/lib/actions/admin/admin.product.actions";
import { Button } from "../ui/button";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "../ui/alert-dialog";

import AdminProImageEdit from "./admin-pro-image-edit";
import AdminEditProDetails from "./admin-edit-pro-details";
import AdminProVariantEdit from "./admin-pro-variant-edit";

interface AdminProductItemProps {
  Product: ProductWithRelations;
  categoryData: categoryProduct[];
}

// Define which view is currently active
type ActiveView = "NONE" | "IMAGE" | "DETAILS" | "STOCK";

const AdminProductItem = ({ Product ,categoryData}: AdminProductItemProps) => {
  const [activeView, setActiveView] = useState<ActiveView>("NONE");
  const [isDeleting, setIsDeleting] = useState(false);

  // Helper to find the primary image or fallback to the first one
  const displayImage = Product.images.find(img => img.isPrimary)?.url || Product.images[0]?.url;

  const toggleView = (view: ActiveView) => {
    setActiveView((prev) => (prev === view ? "NONE" : view));
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const res = await deleteProduct(Product.id);
      if (res.success) {
        toast.success(res.message || "Product deleted successfully.");
      } else {
        toast.error(res.message || "Something went wrong. please try again.");
      }
    } catch (error) {
      toast.error("Failed to delete product");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="border border-zinc-200 rounded-xl bg-white overflow-hidden shadow-sm">
      {/* 1. Main Info Row */}
      <div className="p-4 flex flex-col md:flex-row items-center gap-6">
        {/* Product Image preview */}
        <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-zinc-100 flex-shrink-0">
          {displayImage ? (
            <Image src={displayImage} alt={Product.name} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-400">
              <ImageIcon size={24} />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 text-center md:text-left">
          <h3 className="font-bold text-lg text-zinc-900">{Product.name}</h3>
          <p className="text-sm text-zinc-500 font-medium uppercase tracking-wider">
            {Product.category.name}
          </p>
          <div className="mt-1 flex items-center justify-center md:justify-start gap-2">
             <span className={`w-2 h-2 rounded-full ${Product.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
             <span className="text-xs text-zinc-400">{Product.isActive ? 'Active' : 'Inactive'}</span>
          </div>
        </div>

        {/* Actions Buttons */}
        <div className="flex flex-wrap justify-center gap-2">
          <Button 
            variant={activeView === "IMAGE" ? "default" : "outline"} 
            size="sm" 
            onClick={() => toggleView("IMAGE")}
            className="flex items-center gap-2"
          >
            <ImageIcon size={16} /> Update Image
          </Button>

          <Button 
            variant={activeView === "DETAILS" ? "default" : "outline"} 
            size="sm" 
            onClick={() => toggleView("DETAILS")}
            className="flex items-center gap-2"
          >
            <Edit3 size={16} /> Update Details
          </Button>

          <Button 
            variant={activeView === "STOCK" ? "default" : "outline"} 
            size="sm" 
            onClick={() => toggleView("STOCK")}
            className="flex items-center gap-2"
          >
            <Package size={16} /> Update Stock
          </Button>

          {/* Delete Dialog */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" disabled={isDeleting}>
                <Trash2 size={16} />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-4">
                  <AlertTriangle size={24} />
                </div>
                <AlertDialogTitle className="text-center">Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription className="text-center">
                  This action cannot be undone. If the product has order history, it will be <strong>deactivated</strong> instead of deleted to preserve records.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDelete} 
                  className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
                >
                  Delete Product
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* 2. Dynamic Edit Sections with Smooth Animation */}
      <AnimatePresence mode="wait">
        {activeView !== "NONE" && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="border-t border-zinc-100 bg-zinc-50/50"
          >
            <div className="p-6">
              {activeView === "IMAGE" && <AdminProImageEdit product={Product} />}
              {activeView === "DETAILS" && <AdminEditProDetails product={Product} categoryData={categoryData} />}
              {activeView === "STOCK" && <AdminProVariantEdit product={Product} />}
              
              <div className="mt-4 flex justify-end">
                <Button variant="ghost" size="sm" onClick={() => setActiveView("NONE")}>           
                  Close Panel
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminProductItem;