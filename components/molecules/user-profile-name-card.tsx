"use client"
import { Session } from "next-auth";
import React from "react";
import { signOut } from "next-auth/react";

interface UserProfileNameCardProps {
  session: Session;
}

const UserProfileNameCard = ({ session }: UserProfileNameCardProps) => {
  const userName = session.user.name;
  const email = session.user.email;
  
  // Get the first letter for the avatar
  const initial = userName ? userName.charAt(0).toUpperCase() : "U";

  return (
    <div className="flex items-center flex-col sm:flex-row sm:justify-between w-full p-6 bg-white border border-zinc-100 rounded-lg shadow-sm">
      <div className="flex items-center mr-auto gap-4">
        {/* Avatar Circle */}
        <div className="flex items-center justify-center w-16 h-16 bg-zinc-200 rounded-full text-white text-2xl font-bold">
          {initial}
        </div>

        {/* User Info */}
        <div className="flex flex-col">
          <h2 className="text-xl font-bold text-zinc-900 leading-tight">
            {userName}
          </h2>
          <p className="text-sm font-medium text-zinc-500">
            {email}
          </p>
        </div>
      </div>

      {/* Sign Out Button - Wrapped in a form for Server Action */}
      <form
      className="ml-auto sm:block"
        action={async () => {
          await signOut({ redirectTo: "/" });
        }}
      >
        <button
          type="submit"
          className="px-6 py-2 bg-black  text-white text-sm font-bold rounded-xl hover:bg-zinc-800 transition-colors active:scale-95"
        >
          Sign Out
        </button>
      </form>
    </div>
  );
};

export default UserProfileNameCard;