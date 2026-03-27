
import Carousel from "@/components/organisms/carousel";
import { Button } from "@/components/ui/button";
import { getCarousel } from "@/lib/actions/carousel.actions";
import React from "react";



const HomePage =async () => {

  const response = await getCarousel(1);
  const carouselItems = response.success && response.data ? response.data : [];
  return (
    <div className="">
     {carouselItems.length > 0 ? (
        <Carousel items={carouselItems} />
      ) : (
        <div className="h-[500px] flex items-center justify-center bg-zinc-100">
          <p className="text-zinc-500">No active slides found.</p>
        </div>
      )}

      
    </div>
  );
};

export default HomePage;

//https://images.pexels.com/photos/7779758/pexels-photo-7779758.jpeg
//https://images.pexels.com/photos/896291/pexels-photo-896291.jpeg
// v
