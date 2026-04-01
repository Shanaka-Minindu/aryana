import Carousel from "@/components/organisms/carousel";
import CategoryBox from "@/components/organisms/category-box";
import DisplayItems from "@/components/organisms/display-items";
import { Button } from "@/components/ui/button";
import { getCarousel } from "@/lib/actions/carousel.actions";
import { getCategoryHome } from "@/lib/actions/categorybox.actions";
import { getDisplayItems } from "@/lib/actions/displayItem.actions";
import React from "react";

const HomePage = async () => {
  const carousel = await getCarousel(1);
  const carouselItems = carousel.success && carousel.data ? carousel.data : [];

  const carousel2 = await getCarousel(2);
  const carouselItems2 = carousel.success && carousel.data ? carousel.data : [];

  const displayIt1 = await getDisplayItems(1);
  const displayItem =
    displayIt1.success && displayIt1.data ? displayIt1.data : null;

  const categoryBox = await getCategoryHome();
  const categoryBoxData =
    categoryBox.success && categoryBox.data ? categoryBox.data : null;
  return (
    <div className="">
      {carouselItems.length > 0 ? (
        <Carousel items={carouselItems} />
      ) : (
        <div className="h-[500px] flex items-center justify-center bg-zinc-100">
          <p className="text-zinc-500">No active slides found.</p>
        </div>
      )}
      {displayItem && <DisplayItems displayItems={displayItem} />}
      {categoryBoxData && <CategoryBox categoryBox={categoryBoxData} />}
      {displayItem && <DisplayItems displayItems={displayItem} />}
       {displayItem && <DisplayItems displayItems={displayItem} />}
      
    </div>
  );
};

export default HomePage;
