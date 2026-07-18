"use client";

import { useState } from "react";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, MailCheck, ArrowLeft } from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AuthLayout } from "@/components/auth/AuthLayout";

const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });

      if (!response.ok) {
        throw new Error("Failed to process request");
      }

      setIsSubmitted(true);
      toast.success("Password reset email sent");
    } catch (error) {
      // In a real app, we might not want to reveal if an email exists
      // but for UX, a generic success/failure can be used
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <AuthLayout
        title="Check your email"
        subtitle="We've sent you a link to reset your password"
      >
        <div className="flex flex-col items-center justify-center space-y-6 py-6">
          <div className="h-20 w-20 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center">
            <MailCheck className="h-10 w-10" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-zinc-600 dark:text-zinc-400">
              We sent a password reset link to <br />
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">{form.getValues().email}</span>
            </p>
          </div>
          <Button
            variant="outline"
            className="w-full mt-4"
            onClick={() => setIsSubmitted(false)}
          >
            Didn&apos;t receive the email? Try again
          </Button>
          <Link
            href="/login"
            className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 mt-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to sign in
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Forgot password"
      subtitle="Enter your email address and we'll send you a link to reset your password."
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="name@example.com" type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Send Reset Link
          </Button>
        </form>
      </Form>

      <div className="mt-8 text-center">
        <Link
          href="/login"
          className="inline-flex items-center text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to sign in
        </Link>
      </div>
    </AuthLayout>
  );
}
