"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Camera, UserCircle, Sparkles, CheckCircle2 } from "lucide-react";
import Image from "next/image";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useAIStatus } from "@/hooks/use-ai-status";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(80),
  headline: z.string().max(120).optional().nullable(),
  bio: z.string().max(2000).optional().nullable(),
  location: z.string().max(120).optional().nullable(),
  skills: z.string().optional().nullable(), // We'll convert comma separated to array for API
  categories: z.string().optional().nullable(),
  hourlyRate: z.coerce.number().min(0).max(10000).optional().nullable(),
});

type ProfileValues = z.infer<typeof profileSchema>;

export default function ProfileSettingsPage() {
  const { data: session, update: updateSession } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI State
  const aiStatus = useAIStatus();
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<{ type: string; text: string; rationale: string; applied?: boolean }[]>([]);

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      headline: "",
      bio: "",
      location: "",
      skills: "",
      categories: "",
      hourlyRate: 0,
    },
  });

  const role = session?.user?.role;

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/users/me");
        if (!res.ok) throw new Error("Failed to load profile");
        const { data } = await res.json();
        
        form.reset({
          name: data.name || "",
          headline: data.headline || "",
          bio: data.bio || "",
          location: data.location || "",
          skills: data.skills?.join(", ") || "",
          categories: data.categories?.join(", ") || "",
          hourlyRate: data.hourlyRate || 0,
        });
        
        setAvatarUrl(data.image || null);
      } catch (err) {
        toast.error("Could not load profile data.");
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, [form]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate client-side
    const validMimeTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validMimeTypes.includes(file.type)) {
      toast.error("Invalid file type. Please use JPEG, PNG, or WEBP.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File is too large. Max size is 5MB.");
      return;
    }

    // Optimistic preview
    const objectUrl = URL.createObjectURL(file);
    const prevAvatarUrl = avatarUrl;
    setAvatarUrl(objectUrl);
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload image");
      }

      const uploadedUrl = data.data.url;
      setAvatarUrl(uploadedUrl);
      
      // Save it immediately to the profile
      const saveRes = await fetch("/api/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: uploadedUrl }),
      });
      
      if (!saveRes.ok) throw new Error("Failed to save avatar to profile");
      
      await updateSession({ image: uploadedUrl });
      toast.success("Profile picture updated");
      
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
      setAvatarUrl(prevAvatarUrl); // Rollback
    } finally {
      setIsUploading(false);
      URL.revokeObjectURL(objectUrl);
    }
  };

  const handleOptimizeProfile = async () => {
    setIsOptimizing(true);
    try {
      const res = await fetch("/api/ai/compose/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          headline: form.getValues("headline"),
          bio: form.getValues("bio"),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setAiSuggestions(data.data.suggestions || []);
      toast.success("Profile suggestions generated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to generate suggestions.");
    } finally {
      setIsOptimizing(false);
    }
  };

  const applySuggestion = (index: number) => {
    const sug = aiSuggestions[index];
    if (!sug) return;
    if (sug.type === "headline") form.setValue("headline", sug.text, { shouldDirty: true, shouldValidate: true });
    else if (sug.type === "bio") form.setValue("bio", sug.text, { shouldDirty: true, shouldValidate: true });
    else if (sug.type === "skills") {
      const current = form.getValues("skills");
      form.setValue("skills", current ? `${current}, ${sug.text}` : sug.text, { shouldDirty: true, shouldValidate: true });
    }
    
    setAiSuggestions(prev => {
      const next = [...prev];
      if (next[index]) next[index].applied = true;
      return next;
    });
    toast.success("Suggestion applied!");
  };

  const onSubmit = async (values: ProfileValues) => {
    setIsSaving(true);
    try {
      const payload: any = {
        name: values.name,
        location: values.location,
        headline: values.headline,
        bio: values.bio,
      };

      if (role === "freelancer") {
        payload.hourlyRate = Number(values.hourlyRate);
        if (values.skills) {
          payload.skills = values.skills.split(",").map((s) => s.trim()).filter(Boolean);
        } else {
          payload.skills = [];
        }
      } else {
        if (values.categories) {
          payload.categories = values.categories.split(",").map((s) => s.trim()).filter(Boolean);
        } else {
          payload.categories = [];
        }
      }

      const res = await fetch("/api/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update profile");
      }

      // Update session if name changed
      if (values.name !== session?.user?.name) {
        await updateSession({ name: values.name });
      }

      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-medium">Public Profile</h3>
          <p className="text-sm text-muted-foreground">
            This is how others will see you on the site.
          </p>
        </div>
        
        {role === "freelancer" && (
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Button 
                    type="button" 
                    variant="secondary"
                    className="bg-brand/10 text-brand hover:bg-brand/20 border-0"
                    onClick={handleOptimizeProfile}
                    disabled={!aiStatus.enabled || isOptimizing}
                  >
                    {isOptimizing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                    Optimize with AI
                  </Button>
                </div>
              </TooltipTrigger>
              {!aiStatus.enabled && (
                <TooltipContent>
                  <p>AI features are currently unavailable.</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {aiSuggestions.length > 0 && (
        <div className="bg-brand/5 border border-brand/20 rounded-xl p-5 space-y-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-brand" />
            <h4 className="font-semibold text-brand">AI Suggestions</h4>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {aiSuggestions.map((sug, i) => (
              <div key={i} className="bg-background rounded-lg border p-4 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1 block">
                    {sug.type}
                  </span>
                  <p className="text-sm font-medium text-foreground mb-2">{sug.text}</p>
                  <p className="text-xs text-muted-foreground mb-4">{sug.rationale}</p>
                </div>
                <Button 
                  size="sm" 
                  variant={sug.applied ? "secondary" : "default"} 
                  className="w-full"
                  disabled={sug.applied}
                  onClick={() => applySuggestion(i)}
                >
                  {sug.applied ? <><CheckCircle2 className="w-4 h-4 mr-2" /> Applied</> : "Apply Suggestion"}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="border-t pt-6">
        <div className="flex items-center gap-6 mb-8">
          <div className="relative group">
            <div className="h-24 w-24 rounded-full overflow-hidden bg-muted flex items-center justify-center border">
              {avatarUrl ? (
                <Image src={avatarUrl} alt="Avatar" width={96} height={96} className="object-cover w-full h-full" />
              ) : (
                <UserCircle className="h-16 w-16 text-muted-foreground" />
              )}
            </div>
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? <Loader2 className="h-6 w-6 text-white animate-spin" /> : <Camera className="h-6 w-6 text-white" />}
            </button>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/jpeg,image/png,image/webp"
              className="hidden" 
            />
          </div>
          <div>
            <h4 className="font-medium text-foreground">Profile Picture</h4>
            <p className="text-sm text-muted-foreground mb-3">
              JPEG, PNG, or WebP. Max size of 5MB.
            </p>
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
              Change
            </Button>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 max-w-2xl">
            
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your name" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="headline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Professional Headline</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Senior Full-Stack Engineer" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormDescription>
                    A brief one-liner about what you do.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. San Francisco, CA" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {role === "freelancer" && (
                <FormField
                  control={form.control}
                  name="hourlyRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hourly Rate ($)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="50" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tell us a little bit about yourself..." 
                      className="resize-none h-32" 
                      {...field} 
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {role === "freelancer" && (
              <FormField
                control={form.control}
                name="skills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Skills</FormLabel>
                    <FormControl>
                      <Input placeholder="React, Node.js, Design (comma separated)" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormDescription>
                      Comma-separated list of your technical skills.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {role === "client" && (
              <FormField
                control={form.control}
                name="categories"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hiring Categories</FormLabel>
                    <FormControl>
                      <Input placeholder="Web Development, Writing (comma separated)" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormDescription>
                      What types of freelancers do you typically look for?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="pt-4">
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save profile
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
