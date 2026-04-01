// --- 1. The Skeleton Component ---
 const ProductSkeleton = () => (
  <div className="max-w-[1600px] mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-6 gap-12 animate-caret-blink">
    {/* Left Side: Image Gallery Placeholder */}
    <div className="lg:col-span-4 space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        <div className="bg-zinc-100 aspect-[3/4] w-full" />
        <div className="bg-zinc-100 aspect-[3/4] w-full hidden lg:block" />
        <div className="bg-zinc-100 aspect-[3/4] w-full hidden lg:block" />
        <div className="bg-zinc-100 aspect-[3/4] w-full hidden lg:block" />
      </div>
    </div>

    {/* Right Side: Details Placeholder */}
    <div className="lg:col-span-2 space-y-10 px-8">
      <div className="space-y-4">
        <div className="h-10 bg-zinc-100 w-3/4" />
        <div className="h-4 bg-zinc-100 w-1/4" />
        <div className="h-8 bg-zinc-100 w-1/2 mt-6" />
      </div>

      <div className="space-y-6 pt-10">
        <div className="h-4 bg-zinc-100 w-1/3" />
        <div className="flex gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-9 h-9 rounded-full bg-zinc-100" />
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <div className="h-4 bg-zinc-100 w-1/3" />
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-zinc-100" />
          ))}
        </div>
      </div>

      <div className="h-16 bg-zinc-100 rounded-full w-full mt-10" />
    </div>
  </div>
);

export default ProductSkeleton;