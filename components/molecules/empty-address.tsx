import React from "react";
import { Plus } from "lucide-react"; // Optional: if you want to use the icon

interface EmptyAddressProps {
  addAddressTrigger: () => void;
}

const EmptyAddress = ({ addAddressTrigger }: EmptyAddressProps) => {
  return (
    <div className="w-full bg-white border border-zinc-100 rounded-[2rem] p-8 shadow-sm transition-all">
      {/* Header Section */}
      <div className="flex items-center justify-between border-b border-zinc-100 pb-6">
        <h2 className="text-xl font-black text-zinc-900 tracking-tight">
          Default Delivery Information
        </h2>
        <button
          onClick={addAddressTrigger}
          className="flex items-center gap-1 bg-black text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-zinc-800 transition-colors active:scale-95 shadow-md"
        >
          Add +
        </button>
      </div>

      {/* Content Section */}
      <div onClick={addAddressTrigger} className="flex flex-col items-center justify-center py-12 text-center">
        <h3 className="text-xl font-medium text-zinc-400">
          Still you did not add your information.
        </h3>
        <p className="mt-1 text-sm text-zinc-300 font-medium">
          Press the Add + button to add your information
        </p>
      </div>
    </div>
  );
};

export default EmptyAddress;