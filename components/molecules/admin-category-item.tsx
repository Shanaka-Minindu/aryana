"use client";

import React, { useState, useTransition, useEffect, useRef } from "react";
import { getCategoryProps } from "@/types";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import { Loader2, UploadCloud, X } from "lucide-react";

import { 
  deleteCategory, 
  updateCategory, 
  deleteUploadThingImage 
} from "@/lib/actions/admin/admin.category.actions";
import { newCategoryValidator } from "@/lib/validators";
import { UploadButton } from "@/lib/uploadthing";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

interface AdminCategoryItemProps {
  category: string;
  slug: string;
  id: string;
  image?: string | null;
  parentId?: string | null;
  categories?: getCategoryProps[];
}

const AdminCategoryItem = ({
  category,
  id,
  slug,
  image,
  parentId,
  categories = [],
}: AdminCategoryItemProps) => {
  const [isPending, startTransition] = useTransition();
  const [showFirstDelete, setShowFirstDelete] = useState(false);
  const [showSecondDelete, setShowSecondDelete] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(image || null);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);

  const uploadBtnRef = useRef<HTMLDivElement>(null);

  // 1. Initialize Form with current values
  const form = useForm<z.infer<typeof newCategoryValidator>>({
    resolver: zodResolver(newCategoryValidator),
    defaultValues: {
      name: category,
      slug: slug,
      parentId: parentId || "MAIN",
      image: image || "",
    },
  });

  // 2. Slug Auto-generation (Same as NewCategoryCard)
  const categoryName = form.watch("name");
  useEffect(() => {
    if (categoryName && isUpdateOpen) {
      const generatedSlug = categoryName
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      form.setValue("slug", generatedSlug, { shouldValidate: true });
    }
  }, [categoryName, isUpdateOpen, form]);

  const selectedParent = form.watch("parentId");
  const isMainCategory = selectedParent === "MAIN";

  // 3. Handlers
  const handleDelete = async () => {
    startTransition(async () => {
      const res = await deleteCategory(id);
      if (res.success) {
        toast.success("Category deleted");
      } else {
        toast.error(res.message || "Failed to delete");
      }
    });
  };

  const onUpdateSubmit = async (values: z.infer<typeof newCategoryValidator>) => {

    const formData = new FormData();
    
    formData.append("name", values.name);
    formData.append("slug", values.slug);
    formData.append("parentId", values.parentId === "MAIN" ? "" : values.parentId || "");
    formData.append("imageUrl", values.image || "");

    startTransition(async () => {
      const res = await updateCategory({ formData, id });
      if (res.success) {
        toast.success("Updated successfully");
        setIsUpdateOpen(false);
      } else {
        toast.error(res.message || "Update failed");
      }
    });
  };

  const handleImageRemove = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const currentImageUrl = form.getValues("image");
    if (currentImageUrl) {
      const res = await deleteUploadThingImage(currentImageUrl);
      if (res.success) {
        setImagePreview(null);
        form.setValue("image", "");
      }
    }
  };

  return (
    <div className="w-full bg-white border border-zinc-100 rounded-xl p-4 flex items-center gap-4 shadow-sm">
      {/* Category Image Preview Box */}
      <div className="w-20 h-20 rounded-lg bg-zinc-100 flex items-center justify-center overflow-hidden border border-zinc-50 shrink-0">
        {image ? (
          <img src={image} alt={category} className="w-full h-full object-cover" />
        ) : (
          <span className="text-3xl font-bold text-zinc-300 uppercase">
            {category.charAt(0)}
          </span>
        )}
      </div>

      <div className="flex-1">
        <h3 className="font-semibold text-zinc-800 text-lg">{category}</h3>
        <p className="text-sm text-zinc-500">Parent Category: {categories.find(c => c.id === parentId)?.name || "Main"}</p>
        <p className="text-sm text-zinc-500">Slug: {slug}</p>
      </div>

      <div className="flex gap-2">
        {/* Update Dialog */}
        <Dialog open={isUpdateOpen} onOpenChange={setIsUpdateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-black text-white hover:bg-zinc-800 rounded-lg px-6">Update</Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold border-b pb-4">Update Category</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onUpdateSubmit)} className="space-y-6 pt-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold text-zinc-600">Name:</FormLabel>
                        <FormControl><Input {...field} className="h-12 border-zinc-200" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="slug" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold text-zinc-600">Slug:</FormLabel>
                        <FormControl><Input {...field} className="h-12 border-zinc-200" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="parentId" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold text-zinc-600">Parent Category:</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <FormControl>
                            <SelectTrigger className="h-12 border-zinc-200">
                              <SelectValue placeholder="Select Parent" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="MAIN" className="font-bold text-sky-600">Main Category</SelectItem>
                            {categories.filter(c => c.id !== id).map((cat) => (
                              <SelectItem key={cat.id} value={cat.id} className={!cat.parentId ? "bg-zinc-50 font-semibold" : ""}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />
                  </div>

                  {/* Image Section */}
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-100 rounded-xl p-4 bg-zinc-50/30">
                    <div 
                      onClick={() => !isMainCategory && !uploading && uploadBtnRef.current?.querySelector('input')?.click()}
                      className={`relative w-full aspect-square max-w-[200px] bg-white rounded-lg border border-zinc-200 flex items-center justify-center overflow-hidden mb-4 cursor-pointer`}
                    >
                      {uploading && <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80"><Loader2 className="animate-spin text-zinc-400" /></div>}
                      {imagePreview ? (
                        <>
                          <img src={imagePreview} className="w-full h-full object-cover" />
                          <button type="button" onClick={handleImageRemove} className="absolute top-2 right-2 p-1 bg-white rounded-full shadow hover:text-rose-500"><X className="w-4 h-4" /></button>
                        </>
                      ) : (
                        <UploadCloud className="text-zinc-200 w-10 h-10" />
                      )}
                    </div>
                    <div ref={uploadBtnRef} className={isMainCategory ? "opacity-50 pointer-events-none" : ""}>
                      <UploadButton
                        endpoint="singleImageUploader"
                        onUploadBegin={async () => {
                          const current = form.getValues("image");
                          if (current) await deleteUploadThingImage(current);
                          setUploading(true);
                        }}
                        onClientUploadComplete={(res) => {
                          setUploading(false);
                          if (res?.[0].url) {
                            setImagePreview(res[0].url);
                            form.setValue("image", res[0].url);
                          }
                        }}
                        content={{ button: () => imagePreview ? "Update Image" : "Select Image" }}
                        appearance={{ button: "bg-black text-white h-10 px-6 rounded-lg text-xs" }}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2 border-t pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsUpdateOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={isPending || uploading} className="bg-black hover:bg-zinc-800">
                    {isPending ? "Updating..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog Sequence */}
        <Button onClick={() => setShowFirstDelete(true)} className="bg-black text-white hover:bg-zinc-800 rounded-lg px-6">Delete</Button>
      </div>

      {/* Confirmation 1: Yes/No */}
      <AlertDialog open={showFirstDelete} onOpenChange={setShowFirstDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete this category and all related products.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => setShowSecondDelete(true)} className="bg-rose-600 hover:bg-rose-700">Yes, Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmation 2: Typed Input */}
      <AlertDialog open={showSecondDelete} onOpenChange={setShowSecondDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Final Confirmation</AlertDialogTitle>
            <AlertDialogDescription>Please type <span className="font-bold text-black">Aryana</span> to confirm deletion.</AlertDialogDescription>
          </AlertDialogHeader>
          <Input 
            value={confirmText} 
            onChange={(e) => setConfirmText(e.target.value)} 
            placeholder="Type Aryana here"
            className="border-zinc-300 focus:ring-black"
          />
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmText("")}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              disabled={confirmText !== "Aryana" || isPending}
              onClick={handleDelete}
              className="bg-black text-white hover:bg-zinc-800"
            >
              {isPending ? "Deleting..." : "Delete Permanently"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminCategoryItem;