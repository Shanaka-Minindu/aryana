"use client"
import AddCarousel from '@/components/organisms/add-carousel'
import CarouselView from '@/components/organisms/carousel-view'
import { carouselData } from '@/types'
import React from 'react'


interface CarouselClientProps {
    carouselCounts : number[]
    carouselData : carouselData[]
}

const CarouselClient = ({carouselCounts,carouselData}:CarouselClientProps) => {
  return (
    <div>
      <AddCarousel carouselCounts={carouselCounts}/>
      <CarouselView carouselData={carouselData}/>
    </div>
  )
} 

export default CarouselClient
