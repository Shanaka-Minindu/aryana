import { Skeleton } from "../ui/skeleton";

const CartSkeletonList = () => (
  <div className="space-y-6">
    {[1, 2, 3].map((i) => (
      <div key={i} className="flex gap-4 items-center rounded-3xl border p-4">
        <Skeleton className="h-24 w-24 rounded-xl" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-8 w-32 rounded-lg" />
        </div>
      </div>
    ))}
  </div>
);

export default CartSkeletonList;