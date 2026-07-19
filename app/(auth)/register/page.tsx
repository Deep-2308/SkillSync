"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Briefcase, UserSearch, CheckCircle2 } from "lucide-react";
import { signIn } from "next-auth/react";

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
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { OAuthButtons } from "@/components/auth/OAuthButtons";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { cn } from "@/lib/utils";

// --- Schemas ---

const accountSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().min(1, "Email is required").email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
    terms: z.boolean().refine((val) => val, "You must accept the terms and conditions"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type AccountFormValues = z.infer<typeof accountSchema>;

const freelancerProfileSchema = z.object({
  headline: z.string().max(120).optional(),
  hourlyRate: z.coerce.number().min(0).max(10000).optional(),
  skills: z.string().optional(), // We'll parse this as comma-separated tags
  bio: z.string().max(2000).optional(),
});

type FreelancerProfileValues = z.infer<typeof freelancerProfileSchema>;

const clientProfileSchema = z.object({
  categories: z.string().optional(), // Comma separated
});

type ClientProfileValues = z.infer<typeof clientProfileSchema>;

// --- Components ---

function RegisterWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status, update } = useSession();
  
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [role, setRole] = useState<"client" | "freelancer" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize from URL or session storage
  useEffect(() => {
    if (status === "loading") return;

    const urlRole = searchParams.get("role");
    if (urlRole === "client" || urlRole === "freelancer") {
      setRole(urlRole);
    }

    // Google First-Timer logic
    if (status === "authenticated" && session?.user) {
      if (!session.user.role) {
        // Has no role, must pick one (Step 1 -> Step 3)
        // If they already picked one in state, stay there, otherwise start at 1
        if (step === 2) setStep(3); // skip account creation
      } else {
        // Has role, meaning they probably refreshed on Step 3 or finished
        // Redirect them away or let them finish profile
        setRole(session.user.role as "client" | "freelancer");
        if (step < 3) setStep(3);
      }
    }
  }, [searchParams, status, session, step]);

  const handleRoleSelection = async (selectedRole: "client" | "freelancer") => {
    setRole(selectedRole);
    
    if (status === "authenticated" && !session?.user?.role) {
      // It's a Google first timer picking a role
      setIsSubmitting(true);
      try {
        const res = await fetch("/api/users/role", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: selectedRole }),
        });
        
        if (!res.ok) throw new Error("Failed to set role");
        
        // Update session so middleware knows we have a role
        await update({ role: selectedRole });
        setStep(3);
      } catch (err) {
        toast.error("Failed to save role. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Normal credentials flow
      setStep(2);
    }
  };

  const accountForm = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
    mode: "onBlur",
  });

  const onAccountSubmit = async (data: AccountFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          role,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        if (response.status === 409) {
          accountForm.setError("email", { message: errorData?.error || "Email already exists" });
          return;
        }
        throw new Error(errorData?.error || "Failed to register");
      }

      // Automatically sign in
      const signInRes = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (signInRes?.error) {
        toast.error("Account created, but auto-login failed. Please log in.");
        router.push("/login");
        return;
      }

      setStep(3);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const freelancerForm = useForm<FreelancerProfileValues>({
    resolver: zodResolver(freelancerProfileSchema),
    defaultValues: { headline: "", hourlyRate: 0, skills: "", bio: "" },
  });

  const clientForm = useForm<ClientProfileValues>({
    resolver: zodResolver(clientProfileSchema),
    defaultValues: { categories: "" },
  });

  const onProfileSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const payload: any = {};
      
      if (role === "freelancer") {
        if (data.headline) payload.headline = data.headline;
        if (data.hourlyRate) payload.hourlyRate = Number(data.hourlyRate);
        if (data.bio) payload.bio = data.bio;
        if (data.skills) {
          payload.skills = data.skills.split(",").map((s: string) => s.trim()).filter(Boolean);
        }
      } else {
        if (data.categories) {
          payload.categories = data.categories.split(",").map((s: string) => s.trim()).filter(Boolean);
        }
      }

      const res = await fetch("/api/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save profile");

      setStep(4);
    } catch (err) {
      toast.error("Failed to save profile. You can do this later in settings.");
      // Even if it fails, they have an account. Proceed to dashboard.
      setStep(4);
    } finally {
      setIsSubmitting(false);
    }
  };

  const skipProfile = () => {
    setStep(4);
  };

  // When step 4 is reached, automatically redirect
  useEffect(() => {
    if (step === 4) {
      const timer = setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [step, router]);

  // Loading state while checking session
  if (status === "loading") {
    return (
      <AuthLayout title="Setting things up..." subtitle="Please wait a moment">
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-brand" />
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title={
        step === 1 ? "How do you want to use SkillSync?" :
        step === 2 ? "Create your account" :
        step === 3 ? "Complete your profile" :
        "You're all set!"
      }
      subtitle={
        step === 1 ? "Select your role to get started" :
        step === 2 ? "Join SkillSync and start your journey today" :
        step === 3 ? "Add some details so we can tailor your experience" :
        "Redirecting you to your dashboard..."
      }
    >
      
      {/* Step Indicator */}
      {step < 4 && (
        <div className="mb-8 flex items-center justify-center gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                  step === i ? "bg-brand text-primary-foreground" :
                  step > i ? "bg-brand/20 text-brand" : "bg-muted text-muted-foreground"
                )}
              >
                {step > i ? <CheckCircle2 className="h-4 w-4" /> : i}
              </div>
              {i < 3 && (
                <div
                  className={cn(
                    "h-[2px] w-12 mx-2",
                    step > i ? "bg-brand/20" : "bg-muted"
                  )}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* STEP 1: Role Selection */}
      {step === 1 && (
        <div className="space-y-6">
          <RadioGroup
            value={role || ""}
            onValueChange={(val) => setRole(val as "client" | "freelancer")}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            <div>
              <RadioGroupItem value="client" id="client" className="sr-only" />
              <label
                htmlFor="client"
                className={cn(
                  "flex cursor-pointer flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-6 hover:bg-accent hover:text-accent-foreground transition-all",
                  role === "client" && "border-brand bg-brand/5 ring-1 ring-brand"
                )}
              >
                <UserSearch className={cn("mb-4 h-8 w-8", role === "client" ? "text-brand" : "text-muted-foreground")} />
                <span className="font-semibold text-base text-center">I&apos;m a Client</span>
                <span className="mt-2 text-sm text-muted-foreground text-center">I want to hire</span>
              </label>
            </div>
            <div>
              <RadioGroupItem value="freelancer" id="freelancer" className="sr-only" />
              <label
                htmlFor="freelancer"
                className={cn(
                  "flex cursor-pointer flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-6 hover:bg-accent hover:text-accent-foreground transition-all",
                  role === "freelancer" && "border-brand bg-brand/5 ring-1 ring-brand"
                )}
              >
                <Briefcase className={cn("mb-4 h-8 w-8", role === "freelancer" ? "text-brand" : "text-muted-foreground")} />
                <span className="font-semibold text-base text-center">I&apos;m a Freelancer</span>
                <span className="mt-2 text-sm text-muted-foreground text-center">I want to work</span>
              </label>
            </div>
          </RadioGroup>

          <Button 
            className="w-full" 
            size="lg"
            disabled={!role || isSubmitting} 
            onClick={() => role && handleRoleSelection(role)}
          >
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Continue
          </Button>

          {status === "unauthenticated" && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>
              <OAuthButtons text="Sign up with Google" />
            </>
          )}

          {status === "unauthenticated" && (
            <p className="text-center text-sm text-muted-foreground mt-6">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-brand hover:underline">
                Sign in
              </Link>
            </p>
          )}
        </div>
      )}

      {/* STEP 2: Account Creation */}
      {step === 2 && (
        <Form {...accountForm}>
          <form onSubmit={accountForm.handleSubmit(onAccountSubmit)} className="space-y-5">
            <FormField
              control={accountForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={accountForm.control}
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FormField
                control={accountForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <PasswordInput placeholder="Create a password" {...field} />
                    </FormControl>
                    {/* Live Strength Indicator */}
                    {field.value && (
                      <div className="flex gap-1 mt-2">
                        <div className={cn("h-1 flex-1 rounded-full", field.value.length >= 8 ? "bg-emerald-500" : "bg-muted")} />
                        <div className={cn("h-1 flex-1 rounded-full", /[A-Z]/.test(field.value) ? "bg-emerald-500" : "bg-muted")} />
                        <div className={cn("h-1 flex-1 rounded-full", /[0-9]/.test(field.value) ? "bg-emerald-500" : "bg-muted")} />
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={accountForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <PasswordInput placeholder="Confirm password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={accountForm.control}
              name="terms"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-1">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="font-normal text-sm text-muted-foreground">
                      I agree to the <Link href="/terms" className="text-brand hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-brand hover:underline">Privacy Policy</Link>
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setStep(1)} disabled={isSubmitting}>
                Back
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create Account
              </Button>
            </div>
          </form>
        </Form>
      )}

      {/* STEP 3: Profile Setup */}
      {step === 3 && role === "freelancer" && (
        <Form {...freelancerForm}>
          <form onSubmit={freelancerForm.handleSubmit(onProfileSubmit)} className="space-y-5">
            <FormField
              control={freelancerForm.control}
              name="headline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Professional Headline</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Senior Full-Stack Engineer" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={freelancerForm.control}
              name="hourlyRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hourly Rate ($)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="50" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={freelancerForm.control}
              name="skills"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Skills (comma separated)</FormLabel>
                  <FormControl>
                    <Input placeholder="React, Node.js, TypeScript" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={freelancerForm.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Tell clients about your experience..." className="resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4 border-t">
              <Button type="button" variant="ghost" onClick={skipProfile} disabled={isSubmitting}>
                Skip for now
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Complete Profile
              </Button>
            </div>
          </form>
        </Form>
      )}

      {step === 3 && role === "client" && (
        <Form {...clientForm}>
          <form onSubmit={clientForm.handleSubmit(onProfileSubmit)} className="space-y-5">
            <FormField
              control={clientForm.control}
              name="categories"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What categories do you typically hire for?</FormLabel>
                  <FormControl>
                    <Input placeholder="Web Development, Design, Writing (comma separated)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4 border-t">
              <Button type="button" variant="ghost" onClick={skipProfile} disabled={isSubmitting}>
                Skip for now
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Complete Profile
              </Button>
            </div>
          </form>
        </Form>
      )}

      {/* STEP 4: Success */}
      {step === 4 && (
        <div className="flex flex-col items-center justify-center py-8 text-center animate-in fade-in zoom-in duration-500">
          <div className="rounded-full bg-brand/10 p-4 mb-4">
            <CheckCircle2 className="h-12 w-12 text-brand" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight mb-2">Welcome aboard!</h2>
          <p className="text-muted-foreground">Preparing your dashboard...</p>
        </div>
      )}
    </AuthLayout>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <AuthLayout title="Loading..." subtitle="Please wait a moment">
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-brand" />
        </div>
      </AuthLayout>
    }>
      <RegisterWizard />
    </Suspense>
  );
}
