"use client";

import React, { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { z } from "zod";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { signInWithCredentials } from "@/lib/actions/user.actions";
import { loginSchema } from "@/lib/validators"; 
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

const SigninForm = () => {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | undefined>("");

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    setServerError("");

    startTransition(async () => {
      const formData = new FormData();
      formData.append("email", values.email);
      formData.append("password", values.password);
      formData.append("callbackUrl", callbackUrl);

      const result = await signInWithCredentials(formData);

      if (!result.success) {
        // Show general error in a toast
        toast.error(
          result.message || "There is something.. Please try again..",
        );

        // Show specific credential error below the button
        setServerError(result.message);

        // If there are specific field errors (like Zod validation from server), map them:
        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([field, messages]) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            form.setError(field as any, {
              type: "server",
              message: messages ? messages[0] : "Invalid field",
            });
          });
        }
      } else {
        toast.success("Welcome back!");
      }
    });
  };

  return (
    <div className="w-full flex flex-col m">
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                    className=" text-base! border-0 border-b-2 border-slate-200 rounded-none px-3 h-12   focus-visible:ring-0 focus-visible:border-slate-600 placeholder:text-slate-300 transition-colors bg-transparent"
                  />
                </FormControl>
                <FormMessage className="text-xs" />
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
                      className=" text-base! border-0 border-b-2 border-slate-200 rounded-none px-3 h-12  focus-visible:ring-0 focus-visible:border-slate-600 placeholder:text-slate-300 transition-colors bg-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {!showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={isPending}
            className=" text-white py-4 font-bold uppercase w-full h-12 text-base"
            //className="w-full bg-[#4e677c] text-white py-4 font-bold uppercase tracking-widest rounded-none hover:bg-[#3d5263] transition-all mt-6 shadow-md active:scale-[0.98]"
          >
            {isPending ? "Logging in..." : "Login"}
          </Button>
          {/* ERROR MESSAGE DISPLAY BELOW BUTTON */}
          {serverError && (
            <p className="text-center text-sm font-medium text-red-500 animate-in fade-in slide-in-from-top-1">
              {serverError}
            </p>
          )}
        </form>
      </Form>
    </div>
  );
};

export default SigninForm;
