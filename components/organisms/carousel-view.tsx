import { carouselData } from '@/types'
import React from 'react'
import CarouselItem from '../molecules/carousel-item'


interface CarouselViewProps {
    carouselData: carouselData[]
}

const CarouselView = ({ carouselData }: CarouselViewProps) => {
  return (
    <div className="w-full max-w-5xl mx-auto py-8">
      {/* Header Section based on image_53eb46.png */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-zinc-900 px-1">Carousel</h2>
        <div className="h-[1px] w-full bg-zinc-200 mt-4" />
      </div>

      {/* Carousel List Container */}
      <div className="flex flex-col gap-4">
        {carouselData.length > 0 ? (
          carouselData.map((carousel) => (
            <CarouselItem
              key={carousel.id}
              id={carousel.id}
              name={carousel.name}
              isActive={carousel.isActive}
              img={carousel.img}
            />
          ))
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-2xl border-zinc-200 bg-zinc-50/50">
            <p className="text-zinc-500 font-medium">No carousels found.</p>
            <p className="text-zinc-400 text-sm">Create a new carousel to get started.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default CarouselView