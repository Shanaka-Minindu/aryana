/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { leftDrawer } from "@/lib/actions/header.actions"; 
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Menu } from "lucide-react";
import { Session } from "next-auth";

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
}

const HeaderLeftDrawer = ({ session }: { session?: Session }) => {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const role = session?.user.role;

  const adminCategory: CategoryItem[] = [
    { id: "1", name: "Dashboard", slug: "dashboard" },
    { id: "2", name: "Orders", slug: "order" },
    { id: "3", name: "Add Category", slug: "add_category" },
    { id: "4", name: "Add Product", slug: "add_product" },
    { id: "5", name: "Customize Carousel", slug: "customize_carousel" },
    { id: "6", name: "Add Items", slug: "add_items" },
    { id: "7", name: "Shipping", slug: "shipping" },
  ];

  if (role === "ADMIN") {
    useEffect(() => {
      setCategories(adminCategory);
      setLoading(false)
    }, []);
    
  } else {
    useEffect(() => {
      const fetchCategories = async () => {
        try {
          const response = await leftDrawer();
          if (response.success && response.data) {
            setCategories(response.data);
          }
        } catch (error) {
          console.error("Failed to fetch drawer categories:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchCategories();
    }, []);
  }

  return (
    <Drawer direction="left">
      <DrawerTrigger asChild>
        <button className="p-2 hover:bg-slate-100 rounded-md transition-colors">
          <Menu className="h-6 w-6 text-slate-700" />
        </button>
      </DrawerTrigger>
      <DrawerContent className=" text-black h-full w-[350px] sm:w-[400px]">
        <div className="flex flex-col h-full overflow-y-auto px-6 py-4">
          {/* Header with Close Button */}
          <div className="flex justify-end mb-4">
            <DrawerClose asChild>
              <button className="p-1 hover:bg-zinc-400 rounded-full transition-colors">
                <X className="h-6 w-6 text-black" />
              </button>
            </DrawerClose>
          </div>

          <DrawerHeader className="p-0 mb-6">
            <DrawerTitle className="sr-only">Navigation Menu</DrawerTitle>
          </DrawerHeader>

          {/* Dynamic Category Links */}
          <nav className="flex flex-col space-y-1">
            {loading ? (
              <p className="text-zinc-500 text-sm">Loading categories...</p>
            ) : (
              categories.map((category) => (
                <div
                  key={category.id}
                  className="group border-b border-zinc-800/50"
                >
                  <DrawerClose asChild>
                    <Link
                      href={`/${role === "ADMIN"?"admin":"shop"}/${category.slug}`}
                      className="block py-4 text-[16px] font-bold tracking-tight hover:text-zinc-400 transition-colors uppercase"
                    >
                      {category.name}
                    </Link>
                  </DrawerClose>
                </div>
              ))
            )}
          </nav>

          {/* Static Footer Button */}
          <div className="mt-auto py-8">
            <DrawerClose asChild>
              <Link
                href="/sign-in"
                className="inline-flex items-center justify-center bg-black text-white px-8 py-3 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-zinc-200 transition-colors"
              >
                Log In <span className="ml-2 h-2 w-2 bg-white rounded-full" />
              </Link>
            </DrawerClose>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default HeaderLeftDrawer;
