"use server"
import React from 'react'
import UserClient from './user-client'
import { auth } from '@/auth'
import { getUserAddressData } from '@/lib/actions/user.actions';

const UserPage = async() => {
  const session = await auth();

  if (!session) return

  const addressData = await getUserAddressData(session.user.id);

  
  return (
<UserClient session={session}  userAddressData={addressData.data}/>
  )
}

export default UserPage
