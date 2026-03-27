import React from "react";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import Header from "@/components/organisms/header";

const layout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  return (
    <main>
      <Toaster position="top-right" reverseOrder={false}/>

      <SessionProvider>
        <Header/>
        {children}</SessionProvider>
    </main>
  );
};

export default layout;
