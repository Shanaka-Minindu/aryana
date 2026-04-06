import React from "react";
import { Plus } from "lucide-react"; // Optional: if you want to use the icon

interface EmptyAddressProps {
  addAddressTrigger: () => void;
}

const EmptyAddress = ({ addAddressTrigger }: EmptyAddressProps) => {
  return (
    <div className="w-full bg-white border border-zinc-100 rounded-lg p-8 shadow-sm transition-all">
      {/* Header Section */}
      <div className="flex items-baseline flex-col sm:flex-row  justify-between border-b border-zinc-100 pb-6">
        <h2 className="text-xl font-bold text-zinc-900 tracking-tight">
          Default Delivery Information
        </h2>
        <button
          onClick={addAddressTrigger}
          className=" gap-1 bg-black ml-auto text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-zinc-800 transition-colors active:scale-95 shadow-md"
        >
          Add +
        </button>
      </div>

      {/* Content Section */}
      <div
        onClick={addAddressTrigger}
        className="flex flex-col items-center justify-center py-12 text-center"
      >
        <h3 className="text-lg font-medium text-zinc-400">
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
