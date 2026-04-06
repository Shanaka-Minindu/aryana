/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import EmptyAddress from "@/components/molecules/empty-address";
import UserAddressForm from "@/components/molecules/user-address-form";
import UserProfileNameCard from "@/components/molecules/user-profile-name-card";
import { deliveryInfo } from "@/types";
import { Session } from "next-auth";
import React, { useEffect, useState } from "react";

interface UserClientProps {
  session: Session;
  userAddressData?: deliveryInfo;
}

const UserClient = ({ session, userAddressData }: UserClientProps) => {
  const [getAction, setAction] = useState(false);
  const [mounted, setMounted] = useState(false); // Add a mount tracker

  useEffect(() => {
    setMounted(true); // Signal that we are now on the client
    if (userAddressData) {
      setAction(true);
    }
  }, [userAddressData]);

  // Prevent hydration mismatch by returning a consistent shell
  // until the client-side logic (useEffect) has run.
  return (
    <div className="flex flex-col w-full md:w-3/4 lg:w-2/4  m-auto gap-8 px-5 py-10">
      <UserProfileNameCard session={session} />
      
      {/* Only render the conditional parts once mounted */}
      {mounted && (
        <>
          {!getAction ? (
            <EmptyAddress
              addAddressTrigger={() => {
                setAction(true);
              }}
            />
          ) : (
            <UserAddressForm 
              data={userAddressData} 
              clientId={session.user.id}
              addAddressTrigger={() => {
                setAction(true);
              }}
            />
          )}
        </>
      )}
    </div>
  );
};

export default UserClient;