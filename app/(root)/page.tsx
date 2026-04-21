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
  const carouselItems2 =
    carousel2.success && carousel.data ? carousel.data : [];

  const displayIt1 = await getDisplayItems(1);
  const displayItem =
    displayIt1.success && displayIt1.data ? displayIt1.data : null;

  const displayIt2 = await getDisplayItems(2);
  const displayItem2 =
    displayIt2.success && displayIt2.data ? displayIt2.data : null;
    

  const displayIt3 = await getDisplayItems(3);
  const displayItem3 =
    displayIt3.success && displayIt3.data ? displayIt3.data : null;


    const displayIt4 = await getDisplayItems(4);
  const displayItem4 =
  displayIt4.success && displayIt4.data ? displayIt4.data : null;



    const displayIt5 = await getDisplayItems(5);
  const displayItem5 =
  displayIt5.success && displayIt5.data ? displayIt5.data : null;


    const displayIt6 = await getDisplayItems(6);
  const displayItem6 =
  displayIt6.success && displayIt6.data ? displayIt6.data : null;



  const categoryBox = await getCategoryHome();
  const categoryBoxData =
    categoryBox.success && categoryBox.data ? categoryBox.data : null;
  return (
    <div className="">
      {carouselItems.length > 0 && <Carousel items={carouselItems} />}
      {displayItem && <DisplayItems displayItems={displayItem} />}
      {displayItem2 && <DisplayItems displayItems={displayItem2} />}
      {categoryBoxData && <CategoryBox categoryBox={categoryBoxData} />}
      {displayItem3 && <DisplayItems displayItems={displayItem3} />}
      {displayItem4 && <DisplayItems displayItems={displayItem4} />}
      {carouselItems2.length > 0 && <Carousel items={carouselItems2} />}
      {displayItem5 && <DisplayItems displayItems={displayItem5} />}
      {displayItem6 && <DisplayItems displayItems={displayItem6} />}
    </div>
  );
};

export default HomePage;
