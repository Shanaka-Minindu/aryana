import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { filterType, getFilterDataRes } from "@/types";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface FilterBoxProps {
  filterData: getFilterDataRes;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void; // Needed to close the drawer
  onFilterUpdate: (updates: Record<string, string[]>) => void;
  activeFilters: filterType
}

const FilterBox = ({
  filterData,
  isOpen,
  setIsOpen,
  onFilterUpdate,
  activeFilters,
}: FilterBoxProps) => {
  const [price, setPrice] = useState([
    Number(activeFilters.minPrice) || filterData.lowPrice,
    Number(activeFilters.maxPrice) || filterData.highPrice,
  ]);

  const toggleSelection = (key: string, value: string, current: string[]) => {
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onFilterUpdate({ [key]: next });
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPrice([
      Number(activeFilters.minPrice) || filterData.lowPrice,
      Number(activeFilters.maxPrice) || filterData.highPrice,
    ]);
  }, [
    activeFilters.minPrice,
    activeFilters.maxPrice,
    filterData.lowPrice,
    filterData.highPrice,
  ]);

  const handlePriceChange = (values: number[]) => {
    setPrice(values);
  };

  const handlePriceCommit = (values: number[]) => {
    onFilterUpdate({
      minPrice: [values[0].toString()],
      maxPrice: [values[1].toString()],
    });
  };

  // This is your original UI logic exactly as it was
  const renderFilters = (
    <div className="w-full space-y-6">
     <div className="h-[1px] w-full bg-zinc-100" />
      {/* SIZE SECTION */}
      <div className="mb-8">
        <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-zinc-900">Size</h4>
        <div className="grid grid-cols-2 gap-y-3">
          {filterData.sizes.map((size) => (
            <div key={size} className="flex items-center space-x-3">
              <Checkbox
                id={`size-${size}`}
                checked={activeFilters.size.includes(size)}
                onCheckedChange={() => toggleSelection("size", size, activeFilters.size)}
              />
              <label htmlFor={`size-${size}`} className="text-sm font-bold text-zinc-600 cursor-pointer uppercase">{size}</label>
            </div>
          ))}
        </div>
      </div>
      <div className="h-[1px] w-full bg-zinc-100" />
      {/* AVAILABILITY SECTION */}
      <div className="mb-8">
        <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-zinc-900">Availability</h4>
        <div className="space-y-3">
          {[{ id: "in-stock", label: "In Stock" }, { id: "out-of-stock", label: "Out Of Stock" }].map((item) => (
            <div key={item.id} className="flex items-center space-x-3">
              <Checkbox
                id={item.id}
                checked={activeFilters.inStock.includes(item.id)}
                onCheckedChange={() => toggleSelection("inStock", item.id, activeFilters.inStock)}
              />
              <label htmlFor={item.id} className="text-sm font-medium text-zinc-700 cursor-pointer">{item.label}</label>
            </div>
          ))}
        </div>
        

      </div>
      <div className="h-[1px] w-full bg-zinc-100" />
       {/* COLOR SECTION */}
      <div className="mb-8">
        <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-zinc-900">Color</h4>
        <div className="flex flex-wrap gap-3">
          {filterData.colors.map((color) => (
            <button
              key={color}
              onClick={() => toggleSelection("color", color, activeFilters.color)}
              className={cn(
                "h-8 w-8 rounded-full border transition-all flex items-center justify-center",
                activeFilters.color.includes(color) ? "border-zinc-900 scale-110" : "border-zinc-200"
              )}
            >
              <span className="h-6 w-6 rounded-full border border-zinc-100" style={{ backgroundColor: color.toLowerCase() }} />
            </button>
          ))}
        </div>
      </div>
      
      <div className="h-[1px] w-full bg-zinc-100" />
      {/* PRICE SECTION */}
      <div>
        <h4 className="mb-6 text-xs font-bold uppercase tracking-widest text-zinc-900">Price</h4>
        <Slider
          min={filterData.lowPrice}
          max={filterData.highPrice}
          step={100}
          value={price}
          onValueChange={handlePriceChange}
          onValueCommit={handlePriceCommit}
          className="mb-8"
        />
        <div className="flex gap-4">
          <div className="flex-1 rounded-lg border border-zinc-200 p-2">
            <span className="text-[10px] font-bold text-zinc-400 uppercase">Min</span>
            <p className="text-sm font-bold">Rs {price[0]}</p>
          </div>
          <div className="flex-1 rounded-lg border border-zinc-200 p-2">
            <span className="text-[10px] font-bold text-zinc-400 uppercase">Max</span>
            <p className="text-sm font-bold">Rs {price[1]}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Drawer */}
      <div className="lg:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetContent side="left" className="w-[320px] overflow-y-auto px-10">
            <SheetHeader className="my-3 pl-0 ">
              <SheetTitle className="text-left font-bold uppercase tracking-widest ">Filters</SheetTitle>
            </SheetHeader>
            {renderFilters}
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, x: -20, width: 0 }}
              animate={{ opacity: 1, x: 0, width: 320 }}
              exit={{ opacity: 0, x: -20, width: 0 }}
              className="overflow-hidden pr-4"
            >
              <div className="w-[300px] rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm">
                {renderFilters}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default FilterBox;