"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, Search, User, ShoppingBag, X } from "lucide-react";
import { getHeaderItems, HeaderItem } from "@/lib/actions/header.actions";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import HeaderLeftDrawer from "../molecules/header-left-drawer";
import ShoppingCart from "./shopping-cart";
import { Session } from "next-auth";
import { useCartStore } from "@/store/use-cart-store";
import Image from "next/image";

const Header = ({ session }: { session?: Session }) => {
  const [navItems, setNavItems] = useState<HeaderItem[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { onOpen, cartCount } = useCartStore();
  useEffect(() => {
    const fetchNav = async () => {
      const response = await getHeaderItems();
      if (response.success && response.data) {
        // Limit to main 5 items as per requirement
        setNavItems(response.data.slice(0, 4));
      }
    };
    fetchNav();
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container mx-auto flex h-20 items-center justify-between px-0 lg:px-8">
        {/* LEFT SECTION: Drawer Trigger & Logo */}
        <div className="flex it gap-4 lg:w-1/6">
          <HeaderLeftDrawer session={session} />
          <Link
            href="/"
            className="text-2xl font-bold tracking-tighter text-slate-900 lg:text-3xl"
          >
            <Image src="/logo.png" width={120} height={50} alt="logo" />
          </Link>
        </div>

        {/* CENTER SECTION: Dynamic Navigation */}
        <div className="hidden lg:flex lg:w-1/2 justify-center">
          <NavigationMenu className="max-w-full">
            <NavigationMenuList className="gap-2">
              {navItems.map((item) => (
                <NavigationMenuItem key={item.id}>
                  {item.children && item.children.length > 0 ? (
                    <>
                      <NavigationMenuTrigger className="bg-transparent text-sm font-medium  uppercase tracking-wide text-slate-600 hover:text-slate-900 focus:bg-transparent data-[state=open]:bg-transparent">
                        {item.name}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid w-[600px] gap-3 p-6 pr-30 md:grid-cols-3 items-center lg:w-[800px]">
                          {item.children.map((child) => (
                            <li key={child.id} className="space-y-3">
                              <Link
                                href={`/shop/${child.slug}`}
                                className="block text-sm font-bold text-slate-900 hover:underline"
                              >
                                {child.name}
                              </Link>
                              {child.children && (
                                <ul className="space-y-2">
                                  {child.children.map((grandChild) => (
                                    <li key={grandChild.id}>
                                      <Link
                                        href={`/shop/${grandChild.slug}`}
                                        className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
                                      >
                                        {grandChild.name}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </li>
                          ))}
                        </ul>
                      </NavigationMenuContent>
                    </>
                  ) : (
                    <NavigationMenuLink asChild>
                      <Link
                        href={`/category/${item.slug}`}
                        className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium uppercase tracking-wide text-slate-600 transition-colors hover:text-slate-900"
                      >
                        {item.name}
                      </Link>
                    </NavigationMenuLink>
                  )}
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* RIGHT SECTION: Search, Profile, Cart */}
        <div className="flex items-center gap-4">
          {isSearchOpen ? (
            <div className="flex items-center border-b border-slate-900 animate-in fade-in slide-in-from-right-4">
              <input
                autoFocus
                placeholder="Search products..."
                className="outline-none px-2 py-1 text-sm w-40 lg:w-64"
              />
              <button onClick={() => setIsSearchOpen(false)}>
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
          ) : (
            <button onClick={() => setIsSearchOpen(true)} className="p-2">
              <Search className="h-6 w-6" />
            </button>
          )}

          <Link
            href="/user"
            className="p-2 text-slate-600 hover:text-slate-900"
          >
            <User className="h-5 w-5 lg:h-6 lg:w-6" />
          </Link>

          <button
            onClick={() => {
              onOpen();
            }}
            className="group relative p-2 text-slate-600 hover:text-slate-900"
          >
            <ShoppingBag className="h-5 w-5 lg:h-6 lg:w-6" />
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white">
              {cartCount}
            </span>
          </button>
          <ShoppingCart session={session} />
        </div>
      </div>
    </header>
  );
};

export default Header;
