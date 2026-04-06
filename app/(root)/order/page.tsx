import React from 'react'
import OrderClient from './order-client'
import { auth } from '@/auth'

const Cart = async() => {
  const session = await auth()
  
  return (
    <div>
      <OrderClient session={session||undefined}/>
    </div>
  )
}

export default Cart
