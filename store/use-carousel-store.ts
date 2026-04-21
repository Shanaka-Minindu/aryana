import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface CarouselStore {
  carouselId: string;
  setCarouselId: (id: string) => void;
}

export const useCarouselStore = create<CarouselStore>()(
    persist(
        (set)=>({
            carouselId:"",
            setCarouselId:(id)=>set({carouselId:id}),
        }),{
            name:"carousel-storage",
            storage:createJSONStorage(()=>localStorage),
        }
    )
);
