"use client";

import React, { useTransition } from 'react';
import { Eye, EyeOff, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { deleteDisplayItem, toggleDisplayItemStatus } from '@/lib/actions/admin/admin.displayItem.action';

interface ItemProps {
  id: string;
  title: string;
  position: string;
  isActive: boolean;
}

const DisplayItem = ({ id, title, position, isActive }: ItemProps) => {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      const res = await toggleDisplayItemStatus(id, isActive);
      if (res.success) toast.success(res.message);
      else toast.error(res.message);
    });
  };

  const handleDelete = () => {
    if (!confirm("Are you sure? This will remove all products in this collection.")) return;
    startTransition(async () => {
      const res = await deleteDisplayItem(id);
      if (res.success) toast.success(res.message);
      else toast.error(res.message);
    });
  };

  return (
    <div className={cn(
      "flex items-center justify-between py-5 border-b border-zinc-100 last:border-0 px-2",
      !isActive && "opacity-50"
    )}>
      <div className="space-y-1">
        <h4 className="font-bold text-zinc-700 text-lg">{title}</h4>
        <p className="text-sm font-bold text-zinc-400 uppercase tracking-tight">
          Position : {position}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleToggle} 
          disabled={isPending}
          className="hover:bg-zinc-100"
        >
          {isPending ? (
            <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
          ) : isActive ? (
            <Eye className="h-6 w-6 text-zinc-800" />
          ) : (
            <EyeOff className="h-6 w-6 text-zinc-400" />
          )}
        </Button>

        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleDelete}
          disabled={isPending}
          className="hover:bg-red-50 text-zinc-800 hover:text-red-600"
        >
          <Trash2 className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};

export default DisplayItem;