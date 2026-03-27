import { auth } from "@/auth";
import { redirect } from "next/navigation";
import React from "react";
import SigninForm from "./signin-form";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

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

          <SigninForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default SignInPage;
