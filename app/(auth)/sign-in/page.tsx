import { auth } from "@/auth";
import { redirect } from "next/navigation";
import React from "react";
import SigninForm from "./signin-form";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SignupFrom from "./signup-from";

const SignInPage = async (props: {
  searchParams: Promise<{ callbackUrl: string }>;
}) => {
  const { callbackUrl } = await props.searchParams;

  const session = await auth();
  if (session) {
    return redirect(callbackUrl || "/");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 ">
      <Card className="flex flex-row w-full max-w-4xl overflow-hidden rounded-2xl  border-none shadow-xl py-0">
        {/* Left Side: Decorative Image */}
        <div className="relative hidden w-1/2 md:block min-h-[650px]">
          <Image
            src="https://images.pexels.com/photos/14848573/pexels-photo-14848573.jpeg"
            alt="Clothing Store Aesthetic"
            fill
            className="object-cover overflow-hidden"
            priority
            sizes="50vw"
          />
        </div>

        {/* Right Side: Form Container */}
        <CardContent className="flex w-full flex-col justify-center p-8 md:w-1/2 lg:p-12">
          <div className="mb-8">
            <h1 className="text-4xl font-semibold text-slate-700">
              Hello, <span className="text-slate-500">Guys!</span>
            </h1>
          </div>
          {/* Tab Switcher - Centered and Minimalist */}
          
            <Tabs defaultValue="login" className="w-full p-5 sm:p-0 flex flex-row mb-12 ">
              {/* justify-center centers the tabs; h-auto prevents unwanted vertical padding */}
             <div className="">
              <TabsList className="bg-transparent border-none w-full mb-5 gap-12">
                <TabsTrigger
                  value="login"
                  className="text-lg font-medium rounded-none border-b-4 pb-2 shadow-none  
                   data-[state=active]:border-slate-600 
                   data-[state=active]:text-slate-800 
                    data-[state=active]:border-t-0
                    data-[state=active]:border-l-0
                    data-[state=active]:border-r-0
                    px-5
                   data-[state=active]:bg-transparent 
                   data-[state=active]:shadow-none 
                   text-slate-400"
                >
                  Login
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="text-lg font-medium rounded-none border-b-4 border-transparent bg-transparent pb-2 shadow-none transition-all 
                   data-[state=active]:border-slate-600 
                   data-[state=active]:text-slate-800 
                    data-[state=active]:border-t-0
                    data-[state=active]:border-l-0
                    data-[state=active]:border-r-0
                    px-5
                   data-[state=active]:bg-transparent 
                   data-[state=active]:shadow-none 
                   text-slate-400"
                >
                  SignUp
                </TabsTrigger>
              </TabsList>
             
              <TabsContent value="login" className="w-full">
                <SigninForm />
              </TabsContent>
              <TabsContent value="signup" className="w-full">
                <SignupFrom />
              </TabsContent>
              </div>
            </Tabs>
          
        </CardContent>
      </Card>
    </div>
  );
};

export default SignInPage;
