import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface DisplayItem {
  id: string;
  name: string;
  categoryId:string;
}

interface DisplayItemState {
  savedItem: DisplayItem | null;
  setSavedItem: (item: DisplayItem) => void;
  clearSavedItem: () => void;
  productSelect :boolean;
  setProductSelect:(state:boolean) =>void;
}

export const useDisplayItemStore = create<DisplayItemState>()(
  persist(
    (set) => ({
      savedItem: null,
      setSavedItem: (item) => set({ savedItem: item }),
      clearSavedItem: () => set({ savedItem: null }),
      productSelect:true,
      setProductSelect: (state)=>set({productSelect:state})
    }),
    {
      name: 'display-item-storage', // unique name for localStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
);