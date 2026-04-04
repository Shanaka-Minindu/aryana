"use client";

import React, { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff, User, Mail, Lock } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

// Import your schema and action
import { registrationSchema } from "@/lib/validators";
import { signUpWithCredentials } from "@/lib/actions/user.actions";

import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";

const SignupFrom = () => {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | undefined>("");

  const form = useForm<z.infer<typeof registrationSchema>>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (values: z.infer<typeof registrationSchema>) => {
    setServerError("");

    startTransition(async () => {
      // 1. Prepare Form Data
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("email", values.email);
      formData.append("password", values.password);
      formData.append("confirmPassword", values.confirmPassword);
      formData.append("callBackUrl", callbackUrl);

      // 2. Get Guest Cart from Local Storage
      const localCart = localStorage.getItem("guest-cart");
      const guestCartData = localCart ? localCart : undefined;

      // 3. Call Server Action
      const result = await signUpWithCredentials(formData, guestCartData);

      if (!result.success) {
        toast.error(result.message || result.error || "Registration failed");
        setServerError(result.error);

        // Map server-side validation errors back to fields
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
        toast.success("Account created! Redirecting...");
        // Clear guest cart on success as it's now synced to DB
        localStorage.removeItem("guest-cart");
      }
    });
  };

  const inputStyles = "text-base! border-0 border-b-2 border-slate-200 rounded-none px-3 h-12 focus-visible:ring-0 focus-visible:border-slate-600 placeholder:text-slate-300 transition-colors bg-transparent";

  return (
    <div className="w-full flex flex-col">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Name Field */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Full Name"
                    disabled={isPending}
                    className={inputStyles}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* Email Field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="Email Address"
                    disabled={isPending}
                    className={inputStyles}
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
                      placeholder="Create Password"
                      disabled={isPending}
                      className={inputStyles}
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

          {/* Confirm Password Field */}
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm Password"
                      disabled={isPending}
                      className={inputStyles}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {!showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
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
            className="text-white py-4 font-bold uppercase w-full h-12 text-base mt-4"
          >
            {isPending ? "Creating Account..." : "Sign Up"}
          </Button>

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

export default SignupFrom;