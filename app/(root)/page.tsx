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

  const [
    displayIt1,
    displayIt2,
    displayIt3,
    displayIt4,
    displayIt5,
    displayIt6,
  ] = await Promise.all([
    getDisplayItems(1),
    getDisplayItems(2),
    getDisplayItems(3),
    getDisplayItems(4),
    getDisplayItems(5),
    getDisplayItems(6),
  ]);

  const displayItem =
    displayIt1.success && displayIt1.data ? displayIt1.data : null;

  const displayItem2 =
    displayIt2.success && displayIt2.data ? displayIt2.data : null;

  const displayItem3 =
    displayIt3.success && displayIt3.data ? displayIt3.data : null;

  const displayItem4 =
    displayIt4.success && displayIt4.data ? displayIt4.data : null;

  const displayItem5 =
    displayIt5.success && displayIt5.data ? displayIt5.data : null;

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
