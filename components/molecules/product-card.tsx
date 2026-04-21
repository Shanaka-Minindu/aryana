import Image from "next/image";
import { cn } from "@/lib/utils";

interface ProductItemProps {
  image: string;
  name: string;
  price: string;
  position: number | null;
  onClick: () => void;
}

const ProductCard = ({ image, name, price, position, onClick }: ProductItemProps) => {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "relative flex flex-col p-3 bg-white border rounded-xl cursor-pointer transition-all hover:shadow-md group",
        position ? "border-blue-500 ring-2 ring-blue-100 scale-[1.02]" : "border-zinc-200"
      )}
    >
      {/* Position Badge */}
      {position && (
        <div className="absolute -top-2 -left-2 w-7 h-7 bg-zinc-200 border-2 border-white rounded-full flex items-center justify-center text-xs font-bold z-10 shadow-sm">
          {position}
        </div>
      )}
      
      <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-zinc-50 mb-3">
        <Image src={image} alt={name} fill className="object-cover" />
      </div>
      
      <div className="space-y-1">
        <h4 className="font-bold text-zinc-800 text-sm truncate">{name}</h4>
        <p className="text-zinc-500 font-bold text-xs">Rs: {price}</p>
      </div>
    </div>
  );
};

export default ProductCard;