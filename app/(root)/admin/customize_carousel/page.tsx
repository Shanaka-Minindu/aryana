import React from 'react'
import CarouselClient from './carousel-client'
import { getAvailableCarouselSlots, getCarousels } from '@/lib/actions/admin/admin.carousel'

const CustomizeCarousel = async() => {

const carouselCounts = await getAvailableCarouselSlots();
const carouselData = await getCarousels();
const carouselDataRes =  carouselData.data? carouselData.data :[]

if(!carouselCounts.success || !carouselCounts.data)return


  return (
    <div>
     <CarouselClient carouselCounts={carouselCounts.data} carouselData={carouselDataRes}/>
    </div>
  )
}

export default CustomizeCarousel
