"use server"
import React from "react";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import Header from "@/components/organisms/header";
import { auth } from "@/auth";
import Preloader from "@/components/organisms/preloader";

const layout = async ({
  children,
}: Readonly<{ children: React.ReactNode }>) => {
  const session = await auth();

  const isGlobalLoading = false;

  return (
    <main>
      <Toaster position="top-right" reverseOrder={false} />

      <SessionProvider>
        {isGlobalLoading ? (
          <Preloader />
        ) : (
          <>
            <Header session={session || undefined} />
            {children}
          </>
        )}
      </SessionProvider>
    </main>
  );
};

export default layout;
