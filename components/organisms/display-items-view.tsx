import { getDisplayItemsRes } from '@/types'
import React from 'react'
import DisplayItem from '../molecules/displayItem'


interface props {
    displayItems: getDisplayItemsRes[]
}

const DisplayItemsView = ({ displayItems }: props) => {
  return (
    <div className="w-full max-w-4xl mx-auto py-6">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-zinc-700 mb-4">Display Items</h2>
        <div className="h-[1px] w-full bg-zinc-200" />
      </div>

      <div className="flex flex-col">
        {displayItems.length > 0 ? (
          displayItems.map((item) => (
            <DisplayItem
              key={item.id}
              id={item.id}
              title={item.title}
              position={item.position}
              isActive={item.isActive}
            />
          ))
        ) : (
          <div className="text-center py-20 bg-zinc-50 rounded-xl border-2 border-dashed border-zinc-200">
            <p className="text-zinc-400 font-medium">No display items found.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default DisplayItemsView;