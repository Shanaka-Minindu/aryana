import { create } from "zustand";

interface CartStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  refreshKey: number;
  triggerRefresh: () => void;
  cartCount: number;
  setCartCount: (count: number) => void;
}

export const useCartStore = create<CartStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
  refreshKey: 0,
  triggerRefresh: () => set((state) => ({ refreshKey: state.refreshKey + 1 })),
  cartCount: 0,
  setCartCount: (count) => set({ cartCount: count }),
}));
