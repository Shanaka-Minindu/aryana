"use client";

import React, { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { z } from "zod";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { signInWithCredentials } from "@/lib/actions/user.actions"; // Adjust path as needed
import { loginSchema } from "@/lib/validators"; // Adjust path as needed
import { zodResolver } from '@hookform/resolvers/zod';

import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SigninForm = () => {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>("");

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    setError("");

    startTransition(async () => {
      const formData = new FormData();
      formData.append("email", values.email);
      formData.append("password", values.password);
      formData.append("callbackUrl", callbackUrl);

      const result = await signInWithCredentials(formData);
      
      if (!result.success) {
        setError(result.message);
      }
    });
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Tab Switcher */}
      <Tabs defaultValue="login" className="w-full mb-10">
        <TabsList className="bg-transparent border-none flex justify-center gap-8 p-0">
          <TabsTrigger
            value="login"
            className="text-xl font-medium data-[state=active]:border-b-2 data-[state=active]:border-slate-600 rounded-none bg-transparent shadow-none p-0 pb-1 text-slate-400 data-[state=active]:text-slate-700"
          >
            Login
          </TabsTrigger>
          <TabsTrigger
            value="signup"
            className="text-xl font-medium data-[state=active]:border-b-2 data-[state=active]:border-slate-600 rounded-none bg-transparent shadow-none p-0 pb-1 text-slate-400 data-[state=active]:text-slate-700"
          >
            SignUp
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Email Field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Enter your email"
                    disabled={isPending}
                    className="border-0 border-b border-slate-400 rounded-none px-0 focus-visible:ring-0 focus-visible:border-slate-700 placeholder:text-slate-300 transition-colors"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password Field */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter Password"
                      disabled={isPending}
                      className="border-0 border-b border-slate-400 rounded-none px-0 pr-10 focus-visible:ring-0 focus-visible:border-slate-700 placeholder:text-slate-300 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-[#4e677c] text-white py-3 font-semibold rounded-none hover:bg-[#3d5263] transition-colors mt-4"
          >
            {isPending ? "Logging in..." : "Login"}
          </button>
        </form>
      </Form>

      {/* Social Login Section */}
      <div className="mt-8 flex flex-col items-center">
        <p className="text-slate-400 text-sm mb-6">Or</p>
        <div className="flex gap-6">
          <button className="hover:opacity-80 transition-opacity">
            <img src="/google-icon.svg" alt="Google" className="w-6 h-6" />
          </button>
          <button className="hover:opacity-80 transition-opacity">
            <img src="/facebook-icon.svg" alt="Facebook" className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SigninForm;